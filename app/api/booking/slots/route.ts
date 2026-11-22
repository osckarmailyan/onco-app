import { meetingConfig } from '../../../../lib/meeting-config';
import { bookingDb,bookingSettings,bookingJson,bookingFailure,BookingError,enforceRateLimit,bookingColumns,type BookingRecord } from '../../../../lib/booking-server';
import { ensurePayment, refreshPayment } from '../../../../lib/booking-payments';

export const runtime = 'nodejs';
export async function GET(request: Request) {
  try {
    bookingSettings(true);
    await enforceRateLimit(request,'slots',80);
    // Release a pending slot only after the provider confirms cancellation, never on a local timer.
    const candidates = await bookingDb().rpc('reconcilable_meeting_bookings');
    if (candidates.error) throw new BookingError('Онлайн-запись временно недоступна.',503);
    const ids = (candidates.data || []).map((item:{id:string}) => item.id);
    if (ids.length) {
      // Rotate attempts before network calls as well, so one permanently failing provider ID cannot starve the queue.
      const touch = await bookingDb().from('meeting_bookings').update({updated_at:new Date().toISOString()}).in('id',ids).eq('status','pending');
      if (touch.error) throw new BookingError('Онлайн-запись временно недоступна.',503);
    }
    const pending = ids.length ? await bookingDb().from('meeting_bookings').select(bookingColumns).in('id',ids).eq('status','pending') : {data:[],error:null};
    if (pending.error) throw new BookingError('Онлайн-запись временно недоступна.',503);
    const checked = await Promise.allSettled((pending.data || []).map(async item => {
      const booking = item as unknown as BookingRecord;
      // Replay the exact provider idempotency key after an interrupted creation; never unlock an ambiguous payment.
      if (!booking.payment_id && Date.now()-Date.parse(booking.created_at) > 60000) await ensurePayment(booking);
      return refreshPayment(booking);
    }));
    if (checked.some(result => result.status === 'rejected')) {
      // Keep unverified reservations locked; availability remains safe during provider outages.
      console.warn('Some pending booking payments could not be reconciled.');
    }
    const {data,error} = await bookingDb().rpc('available_meeting_slots',{p_duration_minutes:meetingConfig.durationMinutes});
    if (error) throw new BookingError('Онлайн-запись временно недоступна.',503);
    return bookingJson({configured:true,timeZone:meetingConfig.timeZone,slots:(data || []).map((slot:{id:string;starts_at:string;ends_at:string}) => ({id:slot.id,startsAt:slot.starts_at,endsAt:slot.ends_at}))});
  } catch (error) {
    if (error instanceof BookingError && error.status === 503) return bookingJson({configured:false,error:error.message,supportEmail:meetingConfig.supportEmail},503);
    return bookingFailure(error);
  }
}

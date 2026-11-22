import { bookingDb,bookingSettings,bookingJson,bookingFailure,BookingError,readJson,enforceRateLimit,bookingColumns,type BookingRecord } from '../../../../lib/booking-server';
import { refreshPayment,sendConfirmation } from '../../../../lib/booking-payments';

export const runtime = 'nodejs';
export async function POST(request: Request) {
  try {
    bookingSettings();
    await enforceRateLimit(request,'webhook',120);
    const value = await readJson(request,16384);
    const body = value as {type?:string;event?:string;object?:{id?:string}} | null;
    const id = body?.object?.id;
    if (body?.type !== 'notification' || !['payment.succeeded','payment.canceled'].includes(body.event || '') || typeof id !== 'string' || !/^[a-zA-Z0-9_-]{1,100}$/.test(id)) throw new BookingError('Некорректное уведомление.');
    const result = await bookingDb().from('meeting_bookings').select(bookingColumns).eq('payment_id',id).maybeSingle();
    if (result.error) throw new BookingError('Временно недоступно.',503);
    // Unknown IDs cause no provider request, write, or mail.
    if (!result.data) return bookingJson({received:true});
    // The webhook body never authorizes payment: authenticated GET to YooKassa does.
    const booking = await refreshPayment(result.data as unknown as BookingRecord);
    if (booking.status === 'paid') {
      const sent = await sendConfirmation(booking);
      // Keep provider retries alive while another delivery claim is in progress or needs recovery.
      if (!sent) throw new BookingError('Подтверждение готовится. Повторите уведомление позже.',503);
    }
    return bookingJson({received:true});
  } catch (error) { return bookingFailure(error); }
}

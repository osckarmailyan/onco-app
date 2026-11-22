import { meetingConfig } from '../../../../lib/meeting-config';
import { bookingDb,bookingSettings,bookingJson,bookingFailure,BookingError,enforceRateLimit,bookingColumns,hashToken,type BookingRecord } from '../../../../lib/booking-server';
import { refreshPayment, sendConfirmation } from '../../../../lib/booking-payments';

export const runtime = 'nodejs';
export async function GET(request: Request) {
  try {
    bookingSettings();
    const token = new URL(request.url).searchParams.get('token');
    if (!token || !/^[a-f0-9]{64}$/.test(token)) throw new BookingError('Запись не найдена. Проверьте ссылку из письма.',404);
    await enforceRateLimit(request,'status',80);
    const result = await bookingDb().from('meeting_bookings').select(bookingColumns).eq('token_hash',hashToken(token)).single();
    if (result.error || !result.data) throw new BookingError('Запись не найдена. Проверьте ссылку из письма.',404);
    const booking = await refreshPayment(result.data as unknown as BookingRecord);
    let emailSent = Boolean(booking.email_sent_at);
    if (booking.status === 'paid' && !emailSent) {
      try { emailSent = await sendConfirmation(booking); } catch { console.error('Booking confirmation delivery needs retry.'); }
    }
    return bookingJson({status:booking.status,needsReschedule:booking.requires_reschedule,startsAt:booking.meeting_slots?.starts_at,endsAt:booking.meeting_slots?.ends_at,emailSent,
      ...(booking.status === 'paid' ? {instructions:booking.requires_reschedule ? `Оплата получена после начала выбранного интервала. Не оплачивайте повторно. Напишите ${meetingConfig.supportEmail}, чтобы согласовать дальнейшие действия и время встречи.` : `Откройте ссылку на видеозвонок из письма. Проверьте микрофон и камеру за несколько минут до начала. Если письмо не пришло, проверьте «Спам» или напишите ${meetingConfig.supportEmail}.`} : {}),
    });
  } catch (error) { return bookingFailure(error); }
}

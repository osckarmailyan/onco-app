import { meetingConfig } from '../../../lib/meeting-config';
import { validateBooking, validateIdempotencyKey } from '../../../lib/booking-validation';
import { bookingDb,bookingSettings,bookingColumns,bookingJson,bookingFailure,BookingError,requireSameOrigin,readJson,enforceRateLimit,fingerprint,tokenFor,hashToken,type BookingRecord } from '../../../lib/booking-server';
import { ensurePayment } from '../../../lib/booking-payments';

export const runtime = 'nodejs';
export async function POST(request: Request) {
  try {
    bookingSettings(true);
    requireSameOrigin(request);
    const key = request.headers.get('idempotency-key');
    if (!validateIdempotencyKey(key)) throw new BookingError('Обновите страницу и повторите запись.');
    const body = await readJson(request);
    let input;
    try { input = validateBooking(body,meetingConfig.legalVersion); }
    catch (error) { throw new BookingError(error instanceof Error ? error.message : 'Проверьте поля формы.',400); }
    await enforceRateLimit(request,'create',6);
    const requestHash = fingerprint(input);
    const id = crypto.randomUUID();
    const {data,error} = await bookingDb().rpc('reserve_meeting',{
      p_id:id,p_slot_id:input.slotId,p_name:input.name,p_email:input.email,p_amount_rub:meetingConfig.priceRub,
      p_consent_version:input.consentVersion,p_idempotency_key:key,p_request_hash:requestHash,
      p_token_hash:hashToken(tokenFor(id)),p_duration_minutes:meetingConfig.durationMinutes,p_duration_label:meetingConfig.durationLabel,
    });
    if (error) {
      if (error.message?.includes('IDEMPOTENCY_CONFLICT')) throw new BookingError('Данные изменились. Обновите страницу и повторите запись.',409);
      if (error.message?.includes('SLOT_UNAVAILABLE')) throw new BookingError('Это время уже занято. Выберите другое.',409);
      throw new BookingError('Не удалось сохранить запись. Попробуйте позже.',503);
    }
    const bookingId = typeof data === 'string' ? data : null;
    if (!bookingId) throw new BookingError('Не удалось сохранить запись.',503);
    const result = await bookingDb().from('meeting_bookings').select(bookingColumns).eq('id',bookingId).single();
    if (result.error || !result.data) throw new BookingError('Не удалось открыть запись.',503);
    const booking = result.data as unknown as BookingRecord;
    const token = tokenFor(booking.id);
    if (booking.status === 'paid') return bookingJson({confirmationUrl:`${bookingSettings().siteUrl}/success?token=${token}`,token});
    const confirmationUrl = await ensurePayment(booking);
    return bookingJson({confirmationUrl,token});
  } catch (error) { return bookingFailure(error); }
}

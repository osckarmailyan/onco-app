import { Resend } from 'resend';
import { bookingDb, bookingSettings, BookingError, tokenFor, type BookingRecord } from './booking-server';
import { isCheckoutUrl, matchesPayment, paymentNeedsReschedule, type VerifiedPayment } from './booking-validation';
import { meetingConfig } from './meeting-config';
import { buildMeetingConfirmation } from './booking-email';

async function providerRequest(path: string, init: RequestInit = {}) {
  const settings = bookingSettings();
  const response = await fetch(`https://api.yookassa.ru/v3/${path}`,{
    ...init,
    headers:{'Authorization':`Basic ${Buffer.from(`${settings.shopId}:${settings.paymentSecret}`).toString('base64')}`,'Content-Type':'application/json',...init.headers},
    cache:'no-store',signal:AbortSignal.timeout(12000),
  });
  if (!response.ok) throw new BookingError('Платёжный сервис временно недоступен. Повторите попытку с этой страницы.',502);
  const payment = await response.json() as VerifiedPayment;
  if (!payment || typeof payment.id !== 'string' || typeof payment.status !== 'string') throw new BookingError('Не удалось проверить платёж.',502);
  return payment;
}
export async function ensurePayment(booking: BookingRecord) {
  if (booking.status !== 'pending') throw new BookingError('Эта запись уже завершена. Проверьте её статус.',409);
  if (booking.payment_id && isCheckoutUrl(booking.checkout_url)) return booking.checkout_url;
  // YooKassa preserves an idempotency key for 24 hours. Never create an ambiguous second charge later.
  if (Date.now()-Date.parse(booking.created_at) > 23*60*60*1000) throw new BookingError('Для этой записи нужно уточнение. Напишите нам.',409);
  if (!booking.payment_id && (!booking.meeting_slots || Date.parse(booking.meeting_slots.starts_at) <= Date.now()+60*60*1000)) throw new BookingError('До встречи осталось слишком мало времени. Напишите нам, чтобы согласовать запись.',409);
  const settings = bookingSettings();
  const payment = await providerRequest('payments',{
    method:'POST',headers:{'Idempotence-Key':booking.id},
    body:JSON.stringify({
      amount:{value:booking.amount_rub.toFixed(2),currency:'RUB'},capture:true,
      confirmation:{type:'redirect',return_url:`${settings.siteUrl}/success?token=${tokenFor(booking.id)}`},
      description:'OncoExperts — индивидуальная поддерживающая беседа',
      metadata:{booking_id:booking.id},
    }),
  });
  if (payment.test !== settings.testMode || payment.amount?.value !== booking.amount_rub.toFixed(2) || payment.amount?.currency !== 'RUB' ||
    payment.metadata?.booking_id !== booking.id) throw new BookingError('Не удалось подготовить безопасную оплату. Напишите нам.',502);
  const paid = matchesPayment(payment,{...booking,payment_id:payment.id},settings.testMode);
  const canceled = payment.status === 'canceled';
  const url = payment.confirmation?.confirmation_url;
  if (!paid && !canceled && !isCheckoutUrl(url)) throw new BookingError('Не удалось подготовить безопасную оплату. Напишите нам.',502);
  const status = paid ? 'paid' : canceled ? 'canceled' : 'pending';
  const needsReschedule = paid && paymentNeedsReschedule(payment,booking.meeting_slots?.starts_at);
  const capturedAt = Number.isFinite(Date.parse(payment.captured_at || '')) ? payment.captured_at : null;
  const {error} = await bookingDb().from('meeting_bookings').update({payment_id:payment.id,checkout_url:isCheckoutUrl(url) ? url : null,status,requires_reschedule:needsReschedule,payment_captured_at:capturedAt,updated_at:new Date().toISOString()}).eq('id',booking.id).eq('status','pending');
  if (error) throw new BookingError('Не удалось сохранить оплату. Повторите попытку с этой страницы.',503);
  booking.payment_id = payment.id;
  const persistedStatus = await reloadPersistedStatus(booking);
  booking.checkout_url = isCheckoutUrl(url) ? url : null;
  if (persistedStatus === 'canceled') throw new BookingError('Оплата отменена. Выберите время и начните запись заново.',409);
  return persistedStatus === 'paid' ? `${settings.siteUrl}/success?token=${tokenFor(booking.id)}` : url!;
}

export async function refreshPayment(booking: BookingRecord): Promise<BookingRecord> {
  if (booking.status !== 'pending' || !booking.payment_id) return booking;
  const payment = await providerRequest(`payments/${encodeURIComponent(booking.payment_id)}`);
  const settings = bookingSettings();
  if (payment.id !== booking.payment_id || payment.metadata?.booking_id !== booking.id || payment.test !== settings.testMode ||
    payment.amount?.currency !== 'RUB' || payment.amount?.value !== booking.amount_rub.toFixed(2)) throw new BookingError('Не удалось проверить платёж. Напишите нам.',502);
  const status = matchesPayment(payment,booking,settings.testMode) ? 'paid' : payment.status === 'canceled' ? 'canceled' : 'pending';
  const checkedAt = new Date().toISOString();
  const requiresReschedule = status === 'paid' && paymentNeedsReschedule(payment,booking.meeting_slots?.starts_at);
  const capturedAt = Number.isFinite(Date.parse(payment.captured_at || '')) ? payment.captured_at : null;
  // Rotate successfully checked pending payments behind less recently checked candidates.
  const update = status === 'pending' ? {updated_at:checkedAt} : {status,requires_reschedule:requiresReschedule,payment_captured_at:capturedAt,updated_at:checkedAt};
  const {error} = await bookingDb().from('meeting_bookings').update(update).eq('id',booking.id).eq('status','pending');
  if (error) throw new BookingError('Не удалось обновить запись.',503);
  if (status !== 'pending') await reloadPersistedStatus(booking);
  return booking;
}

async function reloadPersistedStatus(booking: BookingRecord) {
  const {data,error} = await bookingDb().from('meeting_bookings').select('status,requires_reschedule,email_sent_at').eq('id',booking.id).single();
  if (error || !data) throw new BookingError('Не удалось проверить сохранённую запись.',503);
  booking.status = data.status;
  booking.requires_reschedule = data.requires_reschedule;
  booking.email_sent_at = data.email_sent_at;
  return data.status as BookingRecord['status'];
}

export async function sendConfirmation(booking: BookingRecord) {
  if (booking.status !== 'paid' || booking.email_sent_at || !booking.meeting_slots) return Boolean(booking.email_sent_at);
  const now = new Date().toISOString();
  const {data,error} = await bookingDb().rpc('claim_meeting_email',{p_booking_id:booking.id});
  if (error) throw new BookingError('Не удалось подготовить подтверждение.',503);
  if (data !== true) return false;
  const message = buildMeetingConfirmation({...booking,meeting_slots:booking.meeting_slots},meetingConfig);
  const resend = new Resend(process.env.RESEND_API_KEY);
  // Provider idempotency plus a database claim prevent concurrent webhook/status emails.
  const result = await resend.emails.send({
    from:process.env.RESEND_FROM_EMAIL!,to:booking.email,
    ...message,
  },{idempotencyKey:`meeting-confirmation-${booking.id}`});
  if (result.error) {
    await bookingDb().from('meeting_bookings').update({email_claimed_at:null}).eq('id',booking.id);
    throw new BookingError('Оплата подтверждена. Письмо пока не отправлено — свяжитесь с нами.',503);
  }
  const update = await bookingDb().from('meeting_bookings').update({email_sent_at:now}).eq('id',booking.id);
  if (update.error) throw new BookingError('Оплата подтверждена. Проверяем доставку письма.',503);
  booking.email_sent_at = now;
  return true;
}

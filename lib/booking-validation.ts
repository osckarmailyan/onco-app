export type BookingInput = { name: string; email: string; slotId: string; consentVersion: string };
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export const validateIdempotencyKey = (key: string | null): key is string => typeof key === 'string' && uuid.test(key);

export function validateBooking(value: unknown, consentVersion: string): BookingInput {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Проверьте поля формы.');
  const body = value as Record<string, unknown>;
  const fields = ['name', 'email', 'slotId', 'consentVersion'];
  if (Object.keys(body).some(key => !fields.includes(key)) || fields.some(key => typeof body[key] !== 'string')) throw new Error('Проверьте поля формы.');
  const name = (body.name as string).trim();
  const email = (body.email as string).trim().toLowerCase();
  if (!name || name.length > 100 || /[\u0000-\u001f\u007f<>]/.test(name)) throw new Error('Укажите имя: до 100 символов.');
  if (email.length > 254 || !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email)) throw new Error('Укажите корректный email.');
  if (!validateIdempotencyKey(body.slotId as string)) throw new Error('Выберите доступное время.');
  if (body.consentVersion !== consentVersion) throw new Error('Ознакомьтесь с актуальными условиями и согласием.');
  return {name,email,slotId:body.slotId as string,consentVersion};
}

export function isSameOrigin(origin: string | null, siteUrl: string) {
  if (!origin) return false;
  try { return new URL(origin).origin === new URL(siteUrl).origin && new URL(origin).origin === origin; } catch { return false; }
}

export function isCheckoutUrl(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password && ['yoomoney.ru','yookassa.ru'].includes(url.hostname);
  } catch { return false; }
}

export type VerifiedPayment = {
  id: string; status: string; paid?: boolean; test?: boolean; captured_at?: string;
  amount?: {value: string; currency: string};
  metadata?: {booking_id?: string};
  confirmation?: {confirmation_url?: string};
};
export function matchesPayment(payment: VerifiedPayment, booking: {id:string;payment_id:string|null;amount_rub:number}, testMode: boolean) {
  return payment.id === booking.payment_id && payment.status === 'succeeded' && payment.paid === true &&
    payment.test === testMode && payment.amount?.currency === 'RUB' &&
    payment.amount?.value === booking.amount_rub.toFixed(2) && payment.metadata?.booking_id === booking.id;
}

/** Call only while first persisting a verified succeeded payment, never for historical paid rows. */
export function paymentNeedsReschedule(payment: Pick<VerifiedPayment, 'captured_at'>, startsAt: string | undefined, now = Date.now()) {
  const starts = Date.parse(startsAt || '');
  const captured = Date.parse(payment.captured_at || '');
  return !Number.isFinite(starts) || (Number.isFinite(captured) ? captured : now) >= starts;
}

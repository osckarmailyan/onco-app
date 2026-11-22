import { createHash, createHmac } from 'node:crypto';
import { getSupabaseAdmin } from './supabase-admin';
import { meetingConfig } from './meeting-config';
import { isSameOrigin } from './booking-validation';

export class BookingError extends Error {
  status: number;
  constructor(message: string, status = 400) { super(message); this.status = status; }
}
export function bookingJson(body: unknown, status = 200) {
  return Response.json(body,{status,headers:{'Cache-Control':'no-store, max-age=0','Referrer-Policy':'no-referrer'}});
}
export function bookingFailure(error: unknown) {
  if (error instanceof BookingError) return bookingJson({error:error.message},error.status);
  // Do not log contact details, payment secrets, or provider responses.
  console.error('Booking service operation failed.');
  return bookingJson({error:'Не удалось завершить действие. Попробуйте ещё раз или напишите нам.',supportEmail:meetingConfig.supportEmail},503);
}
export function bookingSettings(requireEnabled = false) {
  const tokenSecret = process.env.BOOKING_TOKEN_SECRET || '';
  const shopId = process.env.YOOKASSA_SHOP_ID || '';
  const paymentSecret = process.env.YOOKASSA_SECRET_KEY || '';
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || '';
  const testMode = process.env.YOOKASSA_TEST_MODE;
  let validUrl = false;
  try {
    const url = new URL(siteUrl);
    validUrl = url.protocol === 'https:' && !url.username && !url.password && url.pathname === '/' && !url.search && !url.hash;
    if (process.env.NODE_ENV === 'development') validUrl ||= url.protocol === 'http:' && ['localhost','127.0.0.1'].includes(url.hostname);
  } catch {}
  if ((requireEnabled && process.env.BOOKING_ENABLED !== 'true') || tokenSecret.length < 32 || !shopId || !paymentSecret || !validUrl ||
    !['true','false'].includes(testMode || '') || !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY ||
    !process.env.RESEND_API_KEY || !process.env.RESEND_FROM_EMAIL) {
    throw new BookingError('Онлайн-запись пока недоступна. Напишите нам, чтобы согласовать встречу.',503);
  }
  return {tokenSecret,shopId,paymentSecret,siteUrl:new URL(siteUrl).origin,testMode:testMode === 'true'};
}
export const bookingDb = () => getSupabaseAdmin();
export function tokenFor(id: string) {
  return createHmac('sha256',bookingSettings().tokenSecret).update(`booking:${id}`).digest('hex');
}
export const hashToken = (token: string) => createHash('sha256').update(token).digest('hex');
export const fingerprint = (input: unknown) => createHash('sha256').update(JSON.stringify(input)).digest('hex');

export function requireSameOrigin(request: Request) {
  const settings = bookingSettings();
  if (!isSameOrigin(request.headers.get('origin'), settings.siteUrl)) throw new BookingError('Обновите страницу и повторите запись.',403);
  if (!request.headers.get('content-type')?.toLowerCase().startsWith('application/json')) throw new BookingError('Ожидается форма записи.',415);
}
export async function readJson(request: Request, maxBytes = 4096): Promise<unknown> {
  const reader = request.body?.getReader();
  if (!reader) throw new BookingError('Пустой запрос.');
  const chunks: Uint8Array[] = [];
  let length = 0;
  try {
    while (true) {
      const {done,value} = await reader.read();
      if (done) break;
      length += value.length;
      if (length > maxBytes) { await reader.cancel(); throw new BookingError('Форма слишком большая.',413); }
      chunks.push(value);
    }
    const bytes = Buffer.concat(chunks);
    return JSON.parse(bytes.toString('utf8'));
  } catch (error) {
    if (error instanceof BookingError) throw error;
    throw new BookingError('Не удалось прочитать форму.');
  }
}
export async function enforceRateLimit(request: Request, scope: string, limit: number) {
  const ip = request.headers.get('x-vercel-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const bucket = createHmac('sha256',bookingSettings().tokenSecret).update(`${scope}:${ip}:${Math.floor(Date.now()/600000)}`).digest('hex');
  const {data,error} = await bookingDb().rpc('meeting_rate_limit',{p_key:bucket,p_limit:limit});
  if (error) throw new BookingError('Онлайн-запись временно недоступна.',503);
  if (data !== true) throw new BookingError('Слишком много попыток. Попробуйте через несколько минут.',429);
}

export type BookingRecord = {
  id: string; slot_id: string; name: string; email: string; duration_label: string; status: 'pending'|'paid'|'canceled'; amount_rub: number;
  payment_id: string|null; requires_reschedule:boolean; checkout_url:string|null; idempotency_key:string; request_hash:string; token_hash:string;
  created_at:string; email_sent_at:string|null; email_claimed_at:string|null;
  meeting_slots: {starts_at:string;ends_at:string;meeting_url:string} | null;
};
export const bookingColumns = 'id,slot_id,name,email,duration_label,status,amount_rub,payment_id,requires_reschedule,checkout_url,idempotency_key,request_hash,token_hash,created_at,email_sent_at,email_claimed_at,meeting_slots(starts_at,ends_at,meeting_url)';

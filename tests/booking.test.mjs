import test from 'node:test';
import assert from 'node:assert/strict';
import { buildMeetingConfirmation } from '../lib/booking-email.ts';
import { validateBooking, isSameOrigin, matchesPayment, isCheckoutUrl, validateIdempotencyKey, paymentNeedsReschedule } from '../lib/booking-validation.ts';

const input = { name: 'Анна', email: 'anna@example.com', slotId: '12345678-1234-4123-8123-123456789abc', consentVersion: '2026-11-22' };
test('accepts only minimal contact fields and current explicit consent', () => {
  assert.deepEqual(validateBooking(input, '2026-11-22'), input);
  for (const bad of [null, [], {...input, consentVersion: ''}, {...input, email: 'a@b'}, {...input, name: 'a'.repeat(101)}, {...input, slotId: '../private'}, {...input, email: 'a@example.com\r\nBcc:x@y.ru'}]) {
    assert.throws(() => validateBooking(bad, '2026-11-22'));
  }
});
test('rejects ignored extra diagnosis, price, and consent fields', () => {
  assert.throws(() => validateBooking({...input, price: 1}, '2026-11-22'));
  assert.throws(() => validateBooking({...input, diagnosis: 'private'}, '2026-11-22'));
});
test('mutation requires the exact configured origin', () => {
  assert.equal(isSameOrigin('https://www.oncoexperts.ru', 'https://www.oncoexperts.ru'), true);
  for (const origin of [null, 'null', 'https://evil.test', 'https://www.oncoexperts.ru.evil.test', 'http://www.oncoexperts.ru']) {
    assert.equal(isSameOrigin(origin, 'https://www.oncoexperts.ru'), false);
  }
});
test('idempotency keys require UUIDs', () => {
  assert.equal(validateIdempotencyKey(input.slotId), true);
  assert.equal(validateIdempotencyKey(null), false);
  assert.equal(validateIdempotencyKey('x'.repeat(65)), false);
});
test('payment confirmation validates amount currency metadata paid and shop mode', () => {
  const booking = {id: input.slotId, payment_id:'payment-123', amount_rub:10000};
  const payment = {id:'payment-123', status:'succeeded', paid:true, test:true, amount:{value:'10000.00',currency:'RUB'}, metadata:{booking_id: input.slotId}};
  assert.equal(matchesPayment(payment, booking, true), true);
  for (const bad of [{...payment,paid:false}, {...payment,test:false}, {...payment,amount:{value:'1.00',currency:'RUB'}}, {...payment,amount:{value:'10000.00',currency:'USD'}}, {...payment,metadata:{booking_id:'other'}}, {...payment,id:'other'}, {...payment,status:'pending'}]) {
    assert.equal(matchesPayment(bad, booking, true), false);
  }
});
test('checkout redirects accept only HTTPS YooKassa hosts', () => {
  assert.equal(isCheckoutUrl('https://yoomoney.ru/checkout/payments/v2/contract?orderId=123'), true);
  assert.equal(isCheckoutUrl('https://yookassa.ru/checkout/123'), true);
  for (const url of ['javascript:alert(1)', 'https://yoomoney.ru.evil.test/','http://yoomoney.ru/','https://evil.test/','https://user:pass@yoomoney.ru/']) assert.equal(isCheckoutUrl(url),false);
});

test('late payment uses provider capture time, not the date of a later historical status read', () => {
  const start = '2026-11-22T12:00:00Z';
  const now = Date.parse('2026-11-23T12:00:00Z');
  assert.equal(paymentNeedsReschedule({captured_at:'2026-11-22T11:30:00Z'},start,now), false);
  assert.equal(paymentNeedsReschedule({captured_at:'2026-11-22T12:00:00Z'},start,now), true);
  assert.equal(paymentNeedsReschedule({captured_at:'2026-11-22T12:01:00Z'},start,now), true);
  assert.equal(paymentNeedsReschedule({},start,now), true);
  assert.equal(paymentNeedsReschedule({captured_at:'broken'},start,Date.parse('2026-11-22T11:00:00Z')), false);
  assert.equal(paymentNeedsReschedule({},undefined,now), true);
});

test('confirmation keeps the booked duration and late-payment mail contains no private meeting link', () => {
  const booking = {requires_reschedule:false,duration_label:'25–30 минут',meeting_slots:{starts_at:'2026-11-23T12:00:00Z',meeting_url:'https://video.example.invalid/private-join'}};
  const settings = {timeZone:'Europe/Moscow',supportEmail:'support@example.invalid',durationLabel:'future changed offering'};
  const normal = buildMeetingConfirmation(booking,settings);
  assert.match(normal.text,/25–30 минут/); assert.doesNotMatch(normal.text,/future changed offering/);
  assert.match(normal.text,/private-join/); assert.match(normal.subject,/встреча подтверждена/);
  const late = buildMeetingConfirmation({...booking,requires_reschedule:true},settings);
  assert.doesNotMatch(late.text,/private-join/); assert.doesNotMatch(late.text,/Ваша индивидуальная встреча подтверждена/);
  assert.match(late.text,/Не оплачивайте повторно/); assert.match(late.text,/support@example.invalid/);
});

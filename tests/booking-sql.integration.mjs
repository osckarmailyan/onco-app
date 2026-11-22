/** Isolated in-memory PostgreSQL/WASM QA. Never connects to Supabase or a payment service.
 * PGLITE_MODULE_PATH=/absolute/pglite/dist/index.js node --test tests/booking-sql.integration.mjs
 * PGlite has one connection: contention below tests queued calls, not independent-backend lock timing.
 */
import { test, before, beforeEach, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { randomUUID, createHash } from 'node:crypto';

if (!process.env.PGLITE_MODULE_PATH) throw new Error('Set PGLITE_MODULE_PATH to the separately installed pinned PGlite module; see docs/booking-setup.md.');
const { PGlite } = await import(pathToFileURL(process.env.PGLITE_MODULE_PATH).href);
const db = new PGlite();
const hash = (value = randomUUID()) => createHash('sha256').update(value).digest('hex');

before(async () => {
  await db.exec('create role anon; create role authenticated; create role service_role bypassrls;');
  await db.exec(await readFile(new URL('../migrations/20261122_001_booking.sql',import.meta.url),'utf8'));
});
after(async () => { await db.close(); });
beforeEach(async () => { await db.exec('reset role; truncate public.meeting_bookings, public.meeting_slots, public.meeting_rate_limits cascade;'); });
async function slot(offset = '2 days', length = '30 minutes', enabled = true) {
  const id = randomUUID();
  await db.query("insert into public.meeting_slots(id,starts_at,ends_at,meeting_url,enabled) values($1,now()+$2::interval,now()+$2::interval+$3::interval,'https://video.example.invalid/private-test',$4)",[id,offset,length,enabled]);
  return id;
}
async function reserve(slotId, { id = randomUUID(), key = randomUUID(), requestHash = hash(), duration = 30, durationLabel = '25–30 минут' } = {}) {
  const result = await db.query("select public.reserve_meeting($1,$2,'QA','qa@example.invalid',10000,'2026-11-22',$3,$4,$5,$6,$7) as id",[id,slotId,key,requestHash,hash(id),duration,durationLabel]);
  return result.rows[0].id;
}
const count = async () => Number((await db.query('select count(*) as n from public.meeting_bookings')).rows[0].n);

test('migration applies and valid reservation stores consent, amount, and duration snapshots', async () => {
  const id = await reserve(await slot());
  const row = (await db.query('select * from public.meeting_bookings where id=$1',[id])).rows[0];
  assert.equal(row.status,'pending'); assert.equal(row.amount_rub,10000); assert.equal(row.duration_label,'25–30 минут');
  assert.equal(row.consent_version,'2026-11-22'); assert.equal(row.requires_reschedule,false); assert.ok(row.consented_at);
});
test('same idempotency key returns the original booking, changed payload is rejected', async () => {
  const slotId = await slot(); const key = randomUUID(); const requestHash = hash();
  const first = await reserve(slotId,{key,requestHash});
  assert.equal(await reserve(slotId,{key,requestHash}),first);
  await assert.rejects(reserve(slotId,{key,requestHash:hash()}),/IDEMPOTENCY_CONFLICT/);
  assert.equal(await count(),1);
});
test('queued competing reservations result in one winner and no duplicate booking', async () => {
  const id = await slot();
  const results = await Promise.allSettled(Array.from({length:12},() => reserve(id)));
  assert.equal(results.filter(result => result.status === 'fulfilled').length,1);
  assert.equal(results.filter(result => result.status === 'rejected' && /SLOT_UNAVAILABLE/.test(result.reason.message)).length,11);
  assert.equal(await count(),1);
});
test('overlapping slots conflict, while adjacent slots can both be booked', async () => {
  const first = await slot('2 days'); const overlap = await slot('2 days 15 minutes'); const adjacent = await slot('2 days 30 minutes');
  await reserve(first);
  await assert.rejects(reserve(overlap),/SLOT_UNAVAILABLE/);
  await reserve(adjacent);
  assert.equal(await count(),2);
  const available = await db.query('select * from public.available_meeting_slots(30)');
  assert.equal(available.rows.length,0);
});
test('canceled reservations release slots, paid reservations remain exclusive', async () => {
  const slotId = await slot(); const id = await reserve(slotId);
  await db.query("update public.meeting_bookings set status='canceled' where id=$1",[id]);
  const next = await reserve(slotId);
  await db.query("update public.meeting_bookings set status='paid' where id=$1",[next]);
  await assert.rejects(reserve(slotId),/SLOT_UNAVAILABLE/);
});
test('booking and availability share near/far boundaries, enabled flag and exact duration', async () => {
  const invalid = [await slot('30 minutes'),await slot('61 days'),await slot('3 days','15 minutes'),await slot('4 days','30 minutes',false)];
  for (const id of invalid) await assert.rejects(reserve(id),/SLOT_UNAVAILABLE/);
  const valid = await slot('59 days');
  const available = (await db.query('select id from public.available_meeting_slots(30)')).rows.map(row => row.id);
  assert.deepEqual(available,[valid]);
  assert.equal(await count(),0);
});
test('failed reservation transaction rolls back all writes', async () => {
  const id = await slot();
  await db.exec('begin;');
  try { await reserve(id); await assert.rejects(reserve(id),/SLOT_UNAVAILABLE/); }
  finally { await db.exec('rollback;'); }
  assert.equal(await count(),0);
});
test('anon/authenticated cannot read contacts or invoke service-only reservation RPCs', async () => {
  const slotId = await slot(); await reserve(slotId);
  for (const role of ['anon','authenticated']) {
    await db.exec(`set role ${role};`);
    try {
      await assert.rejects(db.query('select email from public.meeting_bookings'),/permission denied/);
      await assert.rejects(db.query('select * from public.available_meeting_slots(30)'),/permission denied/);
      await assert.rejects(db.query('select * from public.reconcilable_meeting_bookings()'),/permission denied/);
      await assert.rejects(reserve(slotId),/permission denied/);
    } finally { await db.exec('reset role;'); }
  }
  await db.exec('set role service_role;');
  try { assert.equal((await db.query('select email from public.meeting_bookings')).rows.length,1); }
  finally { await db.exec('reset role;'); }
});
test('email claims require paid status, exclude duplicates, and allow crash recovery after TTL', async () => {
  const id = await reserve(await slot());
  const claim = async () => (await db.query('select public.claim_meeting_email($1) as claimed',[id])).rows[0].claimed;
  assert.equal(await claim(),false);
  await db.query("update public.meeting_bookings set status='paid' where id=$1",[id]);
  assert.equal(await claim(),true); assert.equal(await claim(),false);
  await db.query("update public.meeting_bookings set email_claimed_at=now()-interval '6 minutes' where id=$1",[id]);
  assert.equal(await claim(),true);
  await db.query('update public.meeting_bookings set email_sent_at=now() where id=$1',[id]);
  assert.equal(await claim(),false);
});
test('rate limit is durable and atomically rejects attempts above the configured limit', async () => {
  const key = hash();
  const results = await Promise.all(Array.from({length:10},() => db.query('select public.meeting_rate_limit($1,3) as allowed',[key])));
  assert.equal(results.filter(result => result.rows[0].allowed).length,3);
  assert.equal((await db.query('select requests from public.meeting_rate_limits where bucket_key=$1',[key])).rows[0].requests,10);
});
test('twenty old or near-start orphan reservations do not starve recoverable or known payments', async () => {
  for (let index=0;index<20;index++) {
    const id = await reserve(await slot(`${index+2} days`));
    await db.query("update public.meeting_bookings set created_at=now()-interval '2 days',updated_at=now()-interval '2 days' where id=$1",[id]);
  }
  const known = await reserve(await slot('30 days'));
  await db.query("update public.meeting_bookings set payment_id='known-provider-payment' where id=$1",[known]);
  const recoverable = await reserve(await slot('40 days'));
  await db.query("update public.meeting_bookings set created_at=now()-interval '2 minutes' where id=$1",[recoverable]);
  const nearSlot = await slot('50 days'); const near = await reserve(nearSlot);
  await db.query("update public.meeting_bookings set created_at=now()-interval '2 minutes' where id=$1",[near]);
  await db.query("update public.meeting_slots set starts_at=now()+interval '30 minutes',ends_at=now()+interval '60 minutes' where id=$1",[nearSlot]);
  const selected = (await db.query('select id from public.reconcilable_meeting_bookings()')).rows.map(row => row.id).sort();
  assert.deepEqual(selected,[known,recoverable].sort());
  assert.equal(await count(),23); // No orphan was silently deleted or released.
  assert.equal((await db.query("select count(*)::integer as n from public.meeting_bookings where status='pending'")).rows[0].n,23);
});
test('bounded reconciliation rotates the marked batch without altering pending statuses', async () => {
  const ids = [];
  for (let index=0;index<25;index++) {
    const id = await reserve(await slot(`2 days ${index*30} minutes`)); ids.push(id);
    await db.query("update public.meeting_bookings set payment_id=$2,updated_at=now()-interval '1 hour'+$3::integer*interval '1 second' where id=$1",[id,`payment-${index}`,index]);
  }
  const first = (await db.query('select id from public.reconcilable_meeting_bookings()')).rows.map(row => row.id);
  assert.equal(first.length,20);
  await db.query('update public.meeting_bookings set updated_at=now() where id=any($1::uuid[])',[first]);
  const second = (await db.query('select id from public.reconcilable_meeting_bookings()')).rows.map(row => row.id);
  assert.equal(second.length,20);
  assert.equal((await db.query("select count(*)::integer as n from public.meeting_bookings where status='pending'")).rows[0].n,25);
  for (const id of ids.filter(id => !first.includes(id))) assert.ok(second.includes(id));
});
test('legacy migration preserves rows, closes old bucket, and keeps other bucket policies intact', async () => {
  await db.exec(`create table public.cases(id integer, email text); insert into public.cases values(1,'old@example.invalid');
    grant all on public.cases to anon,authenticated; alter table public.cases enable row level security;
    create policy legacy_allow_all on public.cases for all to anon,authenticated using(true) with check(true);
    create schema storage; grant usage on schema storage to anon,authenticated;
    create table storage.buckets(id text primary key,public boolean); insert into storage.buckets values('cases',true),('other',true);
    create table storage.objects(id integer,bucket_id text); insert into storage.objects values(1,'cases'),(2,'other');
    alter table storage.objects enable row level security; grant all on storage.objects to anon,authenticated;
    create policy legacy_storage_allow_all on storage.objects for all to anon,authenticated using(true) with check(true);`);
  await db.exec(await readFile(new URL('../migrations/20261122_002_close_legacy_cases.sql',import.meta.url),'utf8'));
  assert.equal((await db.query('select count(*)::integer as n from public.cases')).rows[0].n,1);
  assert.deepEqual((await db.query('select id,public from storage.buckets order by id')).rows,[{id:'cases',public:false},{id:'other',public:true}]);
  await db.exec('set role anon;');
  try {
    await assert.rejects(db.query('select * from public.cases'),/permission denied/);
    assert.deepEqual((await db.query('select bucket_id from storage.objects')).rows,[{bucket_id:'other'}]);
    await assert.rejects(db.query("insert into storage.objects values(3,'cases')"),/row-level security/);
  } finally { await db.exec('reset role;'); }
});

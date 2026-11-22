-- Additive migration. Review and apply to a staging Supabase project first.
-- Never run automatically at application startup. No existing patient data is changed.
-- Data-preserving rollback: BOOKING_ENABLED=false and retain tables. No destructive DOWN after real bookings.
begin;
create table public.meeting_slots (
  id uuid primary key default gen_random_uuid(),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  meeting_url text not null check (meeting_url ~ '^https://[^[:space:]]+$'),
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  check (ends_at > starts_at),
  unique (starts_at)
);
create table public.meeting_bookings (
  id uuid primary key,
  slot_id uuid not null references public.meeting_slots(id),
  name text not null check (length(name) between 1 and 100),
  email text not null check (length(email) between 3 and 254),
  status text not null default 'pending' check (status in ('pending','paid','canceled')),
  amount_rub integer not null check (amount_rub > 0),
  consent_version text not null,
  duration_label text not null check (length(duration_label) between 1 and 100),
  consented_at timestamptz not null default now(),
  idempotency_key uuid not null unique,
  request_hash text not null,
  token_hash text not null unique,
  payment_id text unique,
  requires_reschedule boolean not null default false,
  payment_captured_at timestamptz,
  checkout_url text,
  email_sent_at timestamptz,
  email_claimed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index meeting_one_active_booking_per_slot on public.meeting_bookings(slot_id) where status in ('pending','paid');
create index meeting_pending_payments on public.meeting_bookings(created_at) where status = 'pending';
create table public.meeting_rate_limits (
  bucket_key text primary key,
  requests integer not null,
  expires_at timestamptz not null
);
create index meeting_rate_limits_expiry on public.meeting_rate_limits(expires_at);
alter table public.meeting_slots enable row level security;
alter table public.meeting_bookings enable row level security;
alter table public.meeting_rate_limits enable row level security;
revoke all on public.meeting_slots, public.meeting_bookings, public.meeting_rate_limits from public, anon, authenticated;
grant all on public.meeting_slots, public.meeting_bookings, public.meeting_rate_limits to service_role;

create function public.meeting_rate_limit(p_key text, p_limit integer) returns boolean
language plpgsql security definer set search_path = '' as $$
declare v_count integer;
begin
  if length(p_key) <> 64 or p_limit < 1 or p_limit > 1000 then return false; end if;
  delete from public.meeting_rate_limits where expires_at < now();
  insert into public.meeting_rate_limits(bucket_key,requests,expires_at)
    values(p_key,1,now()+interval '11 minutes')
    on conflict (bucket_key) do update set requests = public.meeting_rate_limits.requests + 1
    returning requests into v_count;
  return v_count <= p_limit;
end;
$$;

create function public.reserve_meeting(
  p_id uuid,p_slot_id uuid,p_name text,p_email text,p_amount_rub integer,p_consent_version text,
  p_idempotency_key uuid,p_request_hash text,p_token_hash text,p_duration_minutes integer,p_duration_label text
) returns uuid language plpgsql security definer set search_path = '' as $$
declare v_existing public.meeting_bookings; v_slot public.meeting_slots;
begin
  -- One short lock covers competing and overlapping slots as well as retries.
  perform pg_catalog.pg_advisory_xact_lock(914284017);
  select * into v_existing from public.meeting_bookings where idempotency_key = p_idempotency_key;
  if found then
    if v_existing.request_hash <> p_request_hash then raise exception 'IDEMPOTENCY_CONFLICT'; end if;
    return v_existing.id;
  end if;
  select * into v_slot from public.meeting_slots where id = p_slot_id and enabled = true for update;
  if not found or v_slot.starts_at <= now()+interval '1 hour' or v_slot.starts_at >= now()+interval '60 days' or v_slot.ends_at-v_slot.starts_at <> make_interval(mins=>p_duration_minutes) then raise exception 'SLOT_UNAVAILABLE'; end if;
  if exists (
    select 1 from public.meeting_bookings b join public.meeting_slots s on s.id=b.slot_id
    where b.status in ('pending','paid') and tstzrange(s.starts_at,s.ends_at,'[)') && tstzrange(v_slot.starts_at,v_slot.ends_at,'[)')
  ) then raise exception 'SLOT_UNAVAILABLE'; end if;
  insert into public.meeting_bookings(id,slot_id,name,email,amount_rub,consent_version,duration_label,idempotency_key,request_hash,token_hash)
  values(p_id,p_slot_id,p_name,p_email,p_amount_rub,p_consent_version,p_duration_label,p_idempotency_key,p_request_hash,p_token_hash);
  return p_id;
end;
$$;

create function public.available_meeting_slots(p_duration_minutes integer)
returns table(id uuid,starts_at timestamptz,ends_at timestamptz)
language sql security definer set search_path = '' as $$
  select s.id,s.starts_at,s.ends_at from public.meeting_slots s
  where s.enabled = true and s.starts_at > now()+interval '1 hour' and s.starts_at < now()+interval '60 days'
    and s.ends_at-s.starts_at = make_interval(mins=>p_duration_minutes)
    and not exists (select 1 from public.meeting_bookings b join public.meeting_slots taken on taken.id=b.slot_id
      where b.status in ('pending','paid') and tstzrange(taken.starts_at,taken.ends_at,'[)') && tstzrange(s.starts_at,s.ends_at,'[)'))
  order by s.starts_at limit 100;
$$;

-- Unrecoverable orphan reservations stay locked for manual review but must not starve live payments.
create function public.reconcilable_meeting_bookings()
returns table(id uuid)
language sql security definer set search_path = '' as $$
  select b.id from public.meeting_bookings b join public.meeting_slots s on s.id=b.slot_id
  where b.status='pending' and (
    b.payment_id is not null or (
      b.created_at > now()-interval '23 hours' and b.created_at < now()-interval '1 minute'
      and s.starts_at > now()+interval '1 hour'
    )
  )
  order by b.updated_at,b.created_at,b.id limit 20;
$$;

create function public.claim_meeting_email(p_booking_id uuid) returns boolean
language plpgsql security definer set search_path = '' as $$
begin
  update public.meeting_bookings set email_claimed_at=now()
  where id=p_booking_id and status='paid' and email_sent_at is null
    and (email_claimed_at is null or email_claimed_at < now()-interval '5 minutes');
  return found;
end;
$$;
revoke all on function public.meeting_rate_limit(text,integer) from public,anon,authenticated;
revoke all on function public.reserve_meeting(uuid,uuid,text,text,integer,text,uuid,text,text,integer,text) from public,anon,authenticated;
revoke all on function public.available_meeting_slots(integer) from public,anon,authenticated;
revoke all on function public.reconcilable_meeting_bookings() from public,anon,authenticated;
revoke all on function public.claim_meeting_email(uuid) from public,anon,authenticated;
grant execute on function public.meeting_rate_limit(text,integer) to service_role;
grant execute on function public.reserve_meeting(uuid,uuid,text,text,integer,text,uuid,text,text,integer,text) to service_role;
grant execute on function public.available_meeting_slots(integer) to service_role;
grant execute on function public.reconcilable_meeting_bookings() to service_role;
grant execute on function public.claim_meeting_email(uuid) to service_role;
commit;

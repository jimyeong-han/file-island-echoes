-- Only this app's table and RPC. No game passwords or email addresses are stored here.
create table public.fie_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  revision bigint not null check (revision between 1 and 9007199254740991),
  payload jsonb,
  app_version text not null check (length(app_version) <= 48),
  updated_at timestamptz not null default now(),
  last_request uuid not null,
  last_expected bigint not null,
  constraint bounded_profile check (payload is null or (
    octet_length(payload::text) <= 8388608
    and jsonb_typeof(payload) = 'object'
    and payload->>'version' = '3'
    and jsonb_typeof(payload->'runs') = 'object'
    and jsonb_typeof(payload->'archive') = 'object'
    and jsonb_typeof(payload->'settings') = 'object'
    and payload ?& array['version','runs','archive','settings','activeCharacterId']
  ))
);
alter table public.fie_profiles enable row level security;
alter table public.fie_profiles force row level security;
revoke all on public.fie_profiles from anon, authenticated;
grant select on public.fie_profiles to anon, authenticated;
create policy own_profile_read on public.fie_profiles for select to authenticated
  using ((select auth.uid()) is not null and (select auth.uid()) = user_id);

-- Writes only go through this CAS operation. Direct REST writes cannot bypass revision checks.
-- SECURITY DEFINER is needed because clients have no table write grant. The target UUID is
-- derived solely from the verified JWT; never accept a user_id parameter. Pin the search path.
create function public.fie_write_profile(p_expected bigint, p_request uuid, p_payload jsonb, p_app_version text)
returns jsonb language plpgsql security definer set search_path = '' set lock_timeout = '3s'
as $$
declare
  caller uuid := auth.uid();
  current_row public.fie_profiles;
begin
  if caller is null then raise exception 'Authentication required' using errcode = '42501'; end if;
  if p_request is null or p_expected is null or p_expected < 0 or p_expected >= 9007199254740991
    or p_app_version is null or p_app_version !~ '^[0-9]+\.[0-9]+\.[0-9]+$' then
    raise exception 'Invalid request' using errcode = '22023';
  end if;
  -- Also serializes creation when no row exists yet. Hash collisions only serialize extra work.
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(caller::text, 0));
  select * into current_row from public.fie_profiles where user_id = caller;
  if current_row.last_request = p_request then
    if current_row.last_expected <> p_expected or current_row.payload is distinct from p_payload
      or current_row.app_version <> p_app_version then
      raise exception 'Request identifier reused' using errcode = '22023';
    end if;
    return jsonb_build_object('kind', 'saved', 'record', to_jsonb(current_row));
  end if;
  if coalesce(current_row.revision, 0) <> p_expected then
    return jsonb_build_object('kind', 'conflict', 'record', to_jsonb(current_row));
  end if;
  insert into public.fie_profiles(user_id, revision, payload, app_version, updated_at, last_request, last_expected)
    values(caller, p_expected + 1, p_payload, p_app_version, clock_timestamp(), p_request, p_expected)
    on conflict(user_id) do update set revision = excluded.revision, payload = excluded.payload,
      app_version = excluded.app_version, updated_at = excluded.updated_at,
      last_request = excluded.last_request, last_expected = excluded.last_expected
    returning * into current_row;
  -- A null payload is a tombstone: deletion cannot reset revision and allow stale devices to resurrect data.
  return jsonb_build_object('kind', 'saved', 'record', to_jsonb(current_row));
end;
$$;
revoke all on function public.fie_write_profile(bigint, uuid, jsonb, text) from public, anon, authenticated;
grant execute on function public.fie_write_profile(bigint, uuid, jsonb, text) to authenticated;

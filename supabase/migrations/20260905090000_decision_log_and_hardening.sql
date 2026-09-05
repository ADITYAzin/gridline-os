-- ==============================================================================
-- Gridline OS — Migration: Decision Log v1.0 & SaaS Multi-Tenant Hardening
-- Version: 20260905090000
-- ==============================================================================

-- 1. Enable btree_gist extension for schedule exclusion constraints
create extension if not exists btree_gist with schema extensions;

-- 2. Organizations: Add incremental job sequence counter (Decision #3)
alter table public.organizations
  add column if not exists job_sequence integer not null default 0;

-- 3. Jobs: Add unique constraint per tenant for job_number (Decision #3)
do $$
begin
  if exists (
    select 1 from pg_constraint 
    where conrelid = 'public.jobs'::regclass and conname = 'jobs_job_number_key'
  ) then
    alter table public.jobs drop constraint jobs_job_number_key;
  end if;
end $$;

alter table public.jobs
  add constraint jobs_org_id_job_number_key unique (org_id, job_number);

-- 4. Jobs: Add cancellation audit fields (Decision #6 & #9)
alter table public.jobs
  add column if not exists cancelled_by uuid references public.profiles(id) on delete set null,
  add column if not exists cancelled_at timestamptz,
  add column if not exists cancellation_reason text;

-- 5. Atomic Job Number Generator (Decision #3)
create or replace function public.generate_next_job_number(p_org_id uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_seq integer;
  v_job_number text;
begin
  update public.organizations
  set job_sequence = job_sequence + 1
  where id = p_org_id
  returning job_sequence into v_seq;

  if v_seq is null then
    raise exception 'Organization not found: %', p_org_id;
  end if;

  v_job_number := 'GL-' || lpad(v_seq::text, 4, '0');
  return v_job_number;
end;
$$;

-- 6. Schedules: Enforce No Overlapping Bookings for the Same Technician
alter table public.schedules
  add constraint schedules_no_overlap
  exclude using gist (
    technician_id with =,
    tstzrange(start_at, end_at) with &&
  );

-- 7. Cross-Tenant Child-Org Assertion Trigger (Integrity Guard)
create or replace function public.fn_assert_job_child_org()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_customer_org uuid;
  v_tech_org uuid;
begin
  -- Validate customer belongs to same org
  select org_id into v_customer_org from public.customers where id = NEW.customer_id;
  if v_customer_org is null or v_customer_org <> NEW.org_id then
    raise exception 'Cross-tenant violation: Customer does not belong to the same organization.';
  end if;

  -- Validate technician (if assigned) belongs to same org and has technician role
  if NEW.technician_id is not null then
    select org_id into v_tech_org from public.profiles where id = NEW.technician_id;
    if v_tech_org is null or v_tech_org <> NEW.org_id then
      raise exception 'Cross-tenant violation: Technician does not belong to the same organization.';
    end if;
  end if;

  return NEW;
end;
$$;

drop trigger if exists trg_assert_job_child_org on public.jobs;
create trigger trg_assert_job_child_org
before insert or update on public.jobs
for each row
execute function public.fn_assert_job_child_org();

-- 8. Completion Gate & Cancellation Validation Trigger (Decision #4, #6, #9)
create or replace function public.validate_job_lifecycle_transition()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_pending_checklist_count integer;
  v_before_photo_count integer;
  v_after_photo_count integer;
  v_signature_count integer;
  v_report_count integer;
begin
  -- 8.1 Gating Transition into COMPLETED
  if NEW.status = 'completed' and (OLD.status is distinct from 'completed') then
    -- Condition 1: SOP Checklist items must all be completed
    select count(*) into v_pending_checklist_count
    from public.checklist_items
    where job_id = NEW.id and is_completed = false;

    if v_pending_checklist_count > 0 then
      raise exception 'Completion failed: All SOP checklist items must be marked as completed.';
    end if;

    -- Condition 2: At least 1 BEFORE photo (Decision #8)
    select count(*) into v_before_photo_count
    from public.job_photos
    where job_id = NEW.id and type = 'before';

    if v_before_photo_count < 1 then
      raise exception 'Completion failed: At least 1 "before" photo evidence is required.';
    end if;

    -- Condition 3: At least 1 AFTER photo (Decision #8)
    select count(*) into v_after_photo_count
    from public.job_photos
    where job_id = NEW.id and type = 'after';

    if v_after_photo_count < 1 then
      raise exception 'Completion failed: At least 1 "after" photo evidence is required.';
    end if;

    -- Condition 4: Customer E-Signature available
    select count(*) into v_signature_count
    from public.signatures
    where job_id = NEW.id;

    if v_signature_count < 1 then
      raise exception 'Completion failed: Customer signature is required.';
    end if;

    -- Condition 5: Submitted Work Report available
    select count(*) into v_report_count
    from public.work_reports
    where job_id = NEW.id;

    if v_report_count < 1 then
      raise exception 'Completion failed: Submitted work report is required.';
    end if;

    -- Auto-record completion timestamp if not passed
    if NEW.completed_at is null then
      NEW.completed_at := now();
    end if;
  end if;

  -- 8.2 Gating Transition into CANCELLED (Decision #6 & #9)
  if NEW.status = 'cancelled' and (OLD.status is distinct from 'cancelled') then
    if NEW.cancellation_reason is null or trim(NEW.cancellation_reason) = '' then
      raise exception 'Cancellation failed: Cancellation reason is required.';
    end if;

    if NEW.cancelled_at is null then
      NEW.cancelled_at := now();
    end if;
  end if;

  return NEW;
end;
$$;

drop trigger if exists trg_validate_job_lifecycle_transition on public.jobs;
create trigger trg_validate_job_lifecycle_transition
before update on public.jobs
for each row
execute function public.validate_job_lifecycle_transition();

-- 9. Evidence Photo Limit Guard (Decision #8: Max 10 per type per job)
create or replace function public.fn_enforce_photo_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer;
begin
  select count(*) into v_count
  from public.job_photos
  where job_id = NEW.job_id and type = NEW.type;

  if v_count >= 10 then
    raise exception 'Storage quota exceeded: Maximum 10 % photos allowed per job.', NEW.type;
  end if;

  return NEW;
end;
$$;

drop trigger if exists trg_enforce_photo_limit on public.job_photos;
create trigger trg_enforce_photo_limit
before insert on public.job_photos
for each row
execute function public.fn_enforce_photo_limit();

-- 10. Table: invite_tokens (Decision #2 & Onboarding Appendix v1.1)
create table if not exists public.invite_tokens (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  invited_by uuid not null references public.profiles(id) on delete cascade,
  email text not null,
  role public.user_role not null,
  token_hash text not null unique,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.invite_tokens enable row level security;

-- Drop policy if exists then create
drop policy if exists "invites_admin_all" on public.invite_tokens;
create policy "invites_admin_all" on public.invite_tokens
  for all
  to authenticated
  using (
    org_id = get_user_org_id()
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  )
  with check (
    org_id = get_user_org_id()
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- Indexes for performance
create index if not exists idx_invite_tokens_token_hash on public.invite_tokens(token_hash);
create index if not exists idx_invite_tokens_org_id on public.invite_tokens(org_id);
create index if not exists idx_jobs_org_job_number on public.jobs(org_id, job_number);

-- 11. Storage Bucket: job-files (Private, 10MB limit, images only)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'job-files',
  'job-files',
  false,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = false,
  file_size_limit = 10485760,
  allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp'];

-- Storage RLS: Tenant Isolation
-- Path schema: {org_id}/{job_id}/...
drop policy if exists "job_files_org_isolation_select" on storage.objects;
create policy "job_files_org_isolation_select"
on storage.objects for select
to authenticated
using (
  bucket_id = 'job-files'
  and (storage.foldername(name))[1] = get_user_org_id()::text
);

drop policy if exists "job_files_technician_insert" on storage.objects;
create policy "job_files_technician_insert"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'job-files'
  and (storage.foldername(name))[1] = get_user_org_id()::text
);

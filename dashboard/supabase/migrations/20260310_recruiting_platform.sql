-- ============================================================
-- AITestCraft — QA Recruiting Platform
-- Phase 1: Schema + RLS
-- Run this in the Supabase SQL Editor
-- ============================================================

-- ── 1. profiles ─────────────────────────────────────────────
-- One row per Clerk user (both candidates and recruiters).
create table if not exists profiles (
  id              uuid        default gen_random_uuid() primary key,
  clerk_user_id   text        not null unique,
  role            text        not null check (role in ('candidate', 'recruiter')),
  full_name       text        not null,
  email           text        not null,
  created_at      timestamptz default now()
);

alter table profiles enable row level security;

-- Users can read/update their own profile.
-- Recruiters need to read candidate profiles — handled via service role in API routes.
drop policy if exists "profiles_own_read"   on profiles;
drop policy if exists "profiles_own_insert" on profiles;
drop policy if exists "profiles_own_update" on profiles;

create policy "profiles_own_read"
  on profiles for select
  using (clerk_user_id = current_setting('app.clerk_user_id', true));

create policy "profiles_own_insert"
  on profiles for insert
  with check (clerk_user_id = current_setting('app.clerk_user_id', true));

create policy "profiles_own_update"
  on profiles for update
  using (clerk_user_id = current_setting('app.clerk_user_id', true));


-- ── 2. candidate_profiles ───────────────────────────────────
-- Extended profile for candidates (skills, bio, links).
create table if not exists candidate_profiles (
  id               uuid        default gen_random_uuid() primary key,
  clerk_user_id    text        not null unique references profiles(clerk_user_id) on delete cascade,
  skills           text[]      not null default '{}',
  experience_years integer     not null default 0 check (experience_years >= 0),
  bio              text,
  linkedin_url     text,
  github_url       text,
  created_at       timestamptz default now(),
  updated_at       timestamptz default now()
);

alter table candidate_profiles enable row level security;

drop policy if exists "candidate_profiles_own_read"   on candidate_profiles;
drop policy if exists "candidate_profiles_own_insert" on candidate_profiles;
drop policy if exists "candidate_profiles_own_update" on candidate_profiles;
-- Recruiters can read candidate profiles (needed for assessment review).
drop policy if exists "candidate_profiles_recruiter_read" on candidate_profiles;

create policy "candidate_profiles_own_read"
  on candidate_profiles for select
  using (clerk_user_id = current_setting('app.clerk_user_id', true));

create policy "candidate_profiles_own_insert"
  on candidate_profiles for insert
  with check (clerk_user_id = current_setting('app.clerk_user_id', true));

create policy "candidate_profiles_own_update"
  on candidate_profiles for update
  using (clerk_user_id = current_setting('app.clerk_user_id', true));

-- Recruiter reads go through supabaseAdmin() in API routes (bypasses RLS).
-- No extra policy needed for recruiters — service role bypasses RLS entirely.


-- ── 3. companies ────────────────────────────────────────────
-- One row per recruiter / company account.
create table if not exists companies (
  id             uuid        default gen_random_uuid() primary key,
  clerk_user_id  text        not null unique references profiles(clerk_user_id) on delete cascade,
  company_name   text        not null,
  industry       text,
  size           text        check (size in ('1-10', '11-50', '51-200', '201-1000', '1000+')),
  website        text,
  created_at     timestamptz default now(),
  updated_at     timestamptz default now()
);

alter table companies enable row level security;

drop policy if exists "companies_own_read"   on companies;
drop policy if exists "companies_own_insert" on companies;
drop policy if exists "companies_own_update" on companies;

create policy "companies_own_read"
  on companies for select
  using (clerk_user_id = current_setting('app.clerk_user_id', true));

create policy "companies_own_insert"
  on companies for insert
  with check (clerk_user_id = current_setting('app.clerk_user_id', true));

create policy "companies_own_update"
  on companies for update
  using (clerk_user_id = current_setting('app.clerk_user_id', true));


-- ── 4. job_postings ─────────────────────────────────────────
create table if not exists job_postings (
  id               uuid        default gen_random_uuid() primary key,
  company_id       uuid        not null references companies(id) on delete cascade,
  title            text        not null,
  description      text,
  required_skills  text[]      not null default '{}',
  experience_level text        not null check (experience_level in ('junior', 'mid', 'senior', 'lead')),
  location         text,
  remote           boolean     not null default true,
  status           text        not null default 'draft' check (status in ('draft', 'active', 'closed')),
  created_at       timestamptz default now(),
  updated_at       timestamptz default now()
);

alter table job_postings enable row level security;

drop policy if exists "job_postings_recruiter_all"     on job_postings;
drop policy if exists "job_postings_candidate_read"    on job_postings;

-- Recruiter manages their own company's postings.
create policy "job_postings_recruiter_all"
  on job_postings for all
  using (
    company_id in (
      select id from companies
      where clerk_user_id = current_setting('app.clerk_user_id', true)
    )
  )
  with check (
    company_id in (
      select id from companies
      where clerk_user_id = current_setting('app.clerk_user_id', true)
    )
  );

-- Candidates can read active postings.
create policy "job_postings_candidate_read"
  on job_postings for select
  using (status = 'active');


-- ── 5. assessments ──────────────────────────────────────────
-- Assessment created by a recruiter, linked to a job posting (optional).
-- questions jsonb shape: [{ id, question, type('mcq'|'code'|'text'), options?, correct_answer?, points }]
create table if not exists assessments (
  id                  uuid        default gen_random_uuid() primary key,
  company_id          uuid        not null references companies(id) on delete cascade,
  job_posting_id      uuid        references job_postings(id) on delete set null,
  title               text        not null,
  description         text,
  questions           jsonb       not null default '[]',
  time_limit_minutes  integer     not null default 60 check (time_limit_minutes > 0),
  passing_score       numeric(5,2) not null default 70 check (passing_score between 0 and 100),
  is_active           boolean     not null default true,
  created_at          timestamptz default now(),
  updated_at          timestamptz default now()
);

alter table assessments enable row level security;

drop policy if exists "assessments_recruiter_all"   on assessments;
drop policy if exists "assessments_candidate_read"  on assessments;

create policy "assessments_recruiter_all"
  on assessments for all
  using (
    company_id in (
      select id from companies
      where clerk_user_id = current_setting('app.clerk_user_id', true)
    )
  )
  with check (
    company_id in (
      select id from companies
      where clerk_user_id = current_setting('app.clerk_user_id', true)
    )
  );

-- NOTE: assessments_candidate_read policy is defined AFTER candidate_assessments table below.


-- ── 6. candidate_assessments ────────────────────────────────
-- A candidate's attempt on a recruiter's assessment.
-- answers jsonb shape: { [question_id]: answer_value }
create table if not exists candidate_assessments (
  id                  uuid        default gen_random_uuid() primary key,
  assessment_id       uuid        not null references assessments(id) on delete cascade,
  candidate_clerk_id  text        not null,
  answers             jsonb       not null default '{}',
  score               numeric(5,2) check (score between 0 and 100),
  ai_feedback         text,
  status              text        not null default 'invited' check (status in ('invited', 'in_progress', 'completed')),
  invited_at          timestamptz default now(),
  started_at          timestamptz,
  completed_at        timestamptz,
  unique (assessment_id, candidate_clerk_id)
);

alter table candidate_assessments enable row level security;

drop policy if exists "candidate_assessments_own"             on candidate_assessments;
drop policy if exists "candidate_assessments_recruiter_read"  on candidate_assessments;

-- Candidate reads/updates their own rows.
create policy "candidate_assessments_own"
  on candidate_assessments for all
  using (candidate_clerk_id = current_setting('app.clerk_user_id', true))
  with check (candidate_clerk_id = current_setting('app.clerk_user_id', true));

-- Recruiter reads results for their company's assessments.
create policy "candidate_assessments_recruiter_read"
  on candidate_assessments for select
  using (
    assessment_id in (
      select a.id from assessments a
      join companies c on c.id = a.company_id
      where c.clerk_user_id = current_setting('app.clerk_user_id', true)
    )
  );


-- Candidates can read assessments they've been invited to (defined here, after candidate_assessments exists).
drop policy if exists "assessments_candidate_read" on assessments;
create policy "assessments_candidate_read"
  on assessments for select
  using (
    id in (
      select assessment_id from candidate_assessments
      where candidate_clerk_id = current_setting('app.clerk_user_id', true)
    )
  );


-- ── 7. mock_interviews ──────────────────────────────────────
-- AI-driven mock interview sessions for candidates (self-practice).
-- questions jsonb: [{ id, question, expected_points[] }]
-- answers   jsonb: { [question_id]: { answer, score, feedback } }
-- feedback  jsonb: { overall_score, strengths[], improvements[], next_steps[] }
create table if not exists mock_interviews (
  id                  uuid        default gen_random_uuid() primary key,
  candidate_clerk_id  text        not null,
  topic               text        not null check (topic in (
                        'playwright', 'selenium', 'cypress', 'api-testing',
                        'performance', 'mobile', 'general-qa', 'cicd', 'behavioral'
                      )),
  difficulty          text        not null check (difficulty in ('easy', 'medium', 'hard', 'mixed')),
  questions           jsonb       not null default '[]',
  answers             jsonb       not null default '{}',
  score               numeric(5,2) check (score between 0 and 100),
  feedback            jsonb,
  completed           boolean     not null default false,
  created_at          timestamptz default now(),
  completed_at        timestamptz
);

alter table mock_interviews enable row level security;

drop policy if exists "mock_interviews_own" on mock_interviews;

create policy "mock_interviews_own"
  on mock_interviews for all
  using (candidate_clerk_id = current_setting('app.clerk_user_id', true))
  with check (candidate_clerk_id = current_setting('app.clerk_user_id', true));


-- ── Indexes (performance) ────────────────────────────────────
create index if not exists idx_profiles_clerk_user_id           on profiles(clerk_user_id);
create index if not exists idx_candidate_profiles_clerk_user_id on candidate_profiles(clerk_user_id);
create index if not exists idx_companies_clerk_user_id          on companies(clerk_user_id);
create index if not exists idx_job_postings_company_id          on job_postings(company_id);
create index if not exists idx_job_postings_status              on job_postings(status);
create index if not exists idx_assessments_company_id           on assessments(company_id);
create index if not exists idx_candidate_assessments_clerk_id   on candidate_assessments(candidate_clerk_id);
create index if not exists idx_candidate_assessments_status     on candidate_assessments(status);
create index if not exists idx_mock_interviews_clerk_id         on mock_interviews(candidate_clerk_id);
create index if not exists idx_mock_interviews_completed        on mock_interviews(completed);


-- ── Updated_at trigger helper ───────────────────────────────
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists tg_candidate_profiles_updated_at on candidate_profiles;
drop trigger if exists tg_companies_updated_at          on companies;
drop trigger if exists tg_job_postings_updated_at       on job_postings;
drop trigger if exists tg_assessments_updated_at        on assessments;

create trigger tg_candidate_profiles_updated_at
  before update on candidate_profiles
  for each row execute function update_updated_at();

create trigger tg_companies_updated_at
  before update on companies
  for each row execute function update_updated_at();

create trigger tg_job_postings_updated_at
  before update on job_postings
  for each row execute function update_updated_at();

create trigger tg_assessments_updated_at
  before update on assessments
  for each row execute function update_updated_at();

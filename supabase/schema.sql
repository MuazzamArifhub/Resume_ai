-- HYFY Supabase schema
-- Run this in the Supabase SQL Editor for your project.

create extension if not exists pgcrypto;

create table if not exists public.job_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists public.job_listings (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.job_categories(id) on delete cascade,
  title text not null,
  company text not null,
  location text,
  employment_type text,
  seniority text,
  source_url text,
  description text not null,
  requirements text,
  compensation text,
  is_active boolean not null default true,
  posted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  linkedin_url text,
  headline text,
  target_fields text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_resumes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  file_name text not null,
  file_path text not null,
  file_type text,
  file_size bigint,
  created_at timestamptz not null default now()
);

create table if not exists public.user_work_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  company text not null,
  role_title text not null,
  location text,
  start_date text,
  end_date text,
  description text,
  achievements text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists job_listings_category_id_idx
  on public.job_listings(category_id);

create index if not exists job_listings_active_posted_idx
  on public.job_listings(is_active, posted_at desc);

create index if not exists user_work_history_user_id_idx
  on public.user_work_history(user_id);

alter table public.job_categories enable row level security;
alter table public.job_listings enable row level security;
alter table public.user_profiles enable row level security;
alter table public.user_resumes enable row level security;
alter table public.user_work_history enable row level security;

create policy "Anyone can read job categories"
  on public.job_categories for select
  using (true);

create policy "Anyone can read active job listings"
  on public.job_listings for select
  using (is_active = true);

create policy "Users can read own profile"
  on public.user_profiles for select
  using (auth.uid() = user_id);

create policy "Users can insert own profile"
  on public.user_profiles for insert
  with check (auth.uid() = user_id);

create policy "Users can update own profile"
  on public.user_profiles for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can read own resumes"
  on public.user_resumes for select
  using (auth.uid() = user_id);

create policy "Users can insert own resumes"
  on public.user_resumes for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own resumes"
  on public.user_resumes for delete
  using (auth.uid() = user_id);

create policy "Users can read own work history"
  on public.user_work_history for select
  using (auth.uid() = user_id);

create policy "Users can insert own work history"
  on public.user_work_history for insert
  with check (auth.uid() = user_id);

create policy "Users can update own work history"
  on public.user_work_history for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own work history"
  on public.user_work_history for delete
  using (auth.uid() = user_id);

insert into public.job_categories (name, slug, description)
values
  ('Investment Banking', 'investment-banking', 'M&A, capital markets, restructuring, and coverage roles.'),
  ('Strategy Consulting', 'strategy-consulting', 'Strategy, diligence, operations, and digital transformation roles.'),
  ('Private Equity', 'private-equity', 'Buyout, growth equity, private credit, and real assets roles.'),
  ('Hedge Funds', 'hedge-funds', 'Public markets investing across equity, macro, quant, and credit.'),
  ('Sales & Trading', 'sales-and-trading', 'Client sales, rates, credit, FX, and structuring desks.'),
  ('Transaction Advisory', 'transaction-advisory', 'Diligence, valuation, tax, integration, and IPO advisory.')
on conflict (slug) do update
set name = excluded.name,
    description = excluded.description;

insert into storage.buckets (id, name, public)
values ('resumes', 'resumes', false)
on conflict (id) do nothing;

create policy "Users can upload own resume files"
  on storage.objects for insert
  with check (
    bucket_id = 'resumes'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can read own resume files"
  on storage.objects for select
  using (
    bucket_id = 'resumes'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can delete own resume files"
  on storage.objects for delete
  using (
    bucket_id = 'resumes'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

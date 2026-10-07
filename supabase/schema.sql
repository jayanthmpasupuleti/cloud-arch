-- ==============================================================================
-- Cloud Architect OS - Supabase Database Schema
-- Complete PostgreSQL schema with Row-Level Security (RLS) and triggers
-- ==============================================================================

-- 1. Profiles Table (Extends Supabase Auth auth.users)
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  name text not null default 'Cloud Architect Aspirant',
  email text not null,
  avatar text default 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  role text default 'Senior Data / Software Engineer',
  target_role text default 'Lead Cloud Solutions Architect',
  start_date text default to_char(current_date, 'YYYY-MM-DD'),
  bio text default 'Bridging scalable data platforms with multi-cloud architecture.',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. Kanban Cards Table
create table if not exists public.kanban_cards (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  description text default '',
  column text not null default 'todo', -- 'backlog', 'todo', 'inProgress', 'review', 'done'
  priority text not null default 'medium', -- 'low', 'medium', 'high'
  phase_id text default 'custom',
  week_num integer,
  project_id text,
  is_custom boolean default true,
  checklist jsonb default '[]'::jsonb,
  deliverables jsonb default '[]'::jsonb,
  tags jsonb default '[]'::jsonb,
  due_date text,
  notes text default '',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Index for speedy user card lookups
create index if not exists idx_kanban_cards_user on public.kanban_cards(user_id);
create index if not exists idx_kanban_cards_column on public.kanban_cards(user_id, column);

-- 3. Roadmap Progress Table (stores completed curriculum checkboxes)
create table if not exists public.roadmap_progress (
  user_id uuid references auth.users(id) on delete cascade not null,
  item_id text not null,
  completed boolean not null default true,
  updated_at timestamptz default now(),
  primary key (user_id, item_id)
);

create index if not exists idx_roadmap_progress_user on public.roadmap_progress(user_id);

-- 4. Certifications Status Table
create table if not exists public.certifications (
  user_id uuid references auth.users(id) on delete cascade not null,
  cert_id text not null,
  status text not null default 'planned', -- 'planned', 'in-progress', 'completed'
  target_date text,
  updated_at timestamptz default now(),
  primary key (user_id, cert_id)
);

create index if not exists idx_certifications_user on public.certifications(user_id);

-- 5. Daily Learning Notes & Journal Table
create table if not exists public.daily_notes (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  date text not null,
  title text not null,
  content text default '',
  tags jsonb default '[]'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_daily_notes_user on public.daily_notes(user_id);

-- ==============================================================================
-- Row Level Security (RLS) Policies
-- Ensures each authenticated user only accesses and modifies their own data
-- ==============================================================================

alter table public.profiles enable row level security;
alter table public.kanban_cards enable row level security;
alter table public.roadmap_progress enable row level security;
alter table public.certifications enable row level security;
alter table public.daily_notes enable row level security;

-- Profiles Policies
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Kanban Cards Policies
create policy "Users can view own kanban cards"
  on public.kanban_cards for select
  using (auth.uid() = user_id);

create policy "Users can insert own kanban cards"
  on public.kanban_cards for insert
  with check (auth.uid() = user_id);

create policy "Users can update own kanban cards"
  on public.kanban_cards for update
  using (auth.uid() = user_id);

create policy "Users can delete own kanban cards"
  on public.kanban_cards for delete
  using (auth.uid() = user_id);

-- Roadmap Progress Policies
create policy "Users can view own roadmap progress"
  on public.roadmap_progress for select
  using (auth.uid() = user_id);

create policy "Users can insert own roadmap progress"
  on public.roadmap_progress for insert
  with check (auth.uid() = user_id);

create policy "Users can update own roadmap progress"
  on public.roadmap_progress for update
  using (auth.uid() = user_id);

create policy "Users can delete own roadmap progress"
  on public.roadmap_progress for delete
  using (auth.uid() = user_id);

-- Certifications Policies
create policy "Users can view own certs"
  on public.certifications for select
  using (auth.uid() = user_id);

create policy "Users can insert own certs"
  on public.certifications for insert
  with check (auth.uid() = user_id);

create policy "Users can update own certs"
  on public.certifications for update
  using (auth.uid() = user_id);

-- Daily Notes Policies
create policy "Users can view own notes"
  on public.daily_notes for select
  using (auth.uid() = user_id);

create policy "Users can insert own notes"
  on public.daily_notes for insert
  with check (auth.uid() = user_id);

create policy "Users can update own notes"
  on public.daily_notes for update
  using (auth.uid() = user_id);

create policy "Users can delete own notes"
  on public.daily_notes for delete
  using (auth.uid() = user_id);

-- ==============================================================================
-- Auth Trigger: Automatically create public.profiles row on auth.users sign up
-- ==============================================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (
    id,
    name,
    email,
    avatar,
    role,
    target_role,
    start_date,
    created_at,
    updated_at
  )
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email,
    coalesce(new.raw_user_meta_data->>'avatar', 'https://api.dicebear.com/7.x/bottts/svg?seed=' || encode(new.email::bytea, 'hex')),
    coalesce(new.raw_user_meta_data->>'role', 'Cloud Architect Aspirant'),
    coalesce(new.raw_user_meta_data->>'target_role', 'Lead Cloud Solutions Architect'),
    coalesce(new.raw_user_meta_data->>'start_date', to_char(current_date, 'YYYY-MM-DD')),
    now(),
    now()
  );
  return new;
end;
$$;

-- Drop trigger if it exists and recreate
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Enable Realtime for live cross-device and multi-tab sync
alter publication supabase_realtime add table public.kanban_cards;
alter publication supabase_realtime add table public.profiles;
alter publication supabase_realtime add table public.daily_notes;

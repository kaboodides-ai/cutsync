-- ============================================================
-- CutSync — Supabase Schema + RLS Policies
-- Run this in Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- 1. PROFILES
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  name        text,
  avatar_url  text,
  provider    text default 'email',
  created_at  timestamptz default now()
);
alter table public.profiles enable row level security;
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- Auto-create profile trigger
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, name, avatar_url, provider)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture'),
    coalesce(new.raw_user_meta_data->>'provider', new.app_metadata->>'provider', 'email')
  );
  return new;
end;
$$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

-- 2. PROJECTS
create table if not exists public.projects (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references auth.users(id) on delete cascade,
  title             text not null,
  client_name       text default '',
  active_version_id uuid,
  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);
alter table public.projects enable row level security;
create policy "Users manage own projects" on public.projects for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- 3. VERSIONS
create table if not exists public.versions (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references public.projects(id) on delete cascade,
  number      int  not null default 1,
  name        text not null default 'גרסה 1 (V1)',
  video_src   text default '',
  approved    boolean default false,
  approved_at timestamptz,
  approved_by text,
  created_at  timestamptz default now()
);
alter table public.versions enable row level security;
create policy "Users manage own versions" on public.versions for all
  using (exists (select 1 from public.projects p where p.id = project_id and p.user_id = auth.uid()))
  with check (exists (select 1 from public.projects p where p.id = project_id and p.user_id = auth.uid()));

-- 4. COMMENTS
create table if not exists public.comments (
  id             uuid primary key default gen_random_uuid(),
  version_id     uuid not null references public.versions(id) on delete cascade,
  time           float not null default 0,
  category       text  not null default 'general',
  text           text  not null default '',
  author         text  not null default 'לקוח',
  completed      boolean default false,
  drawing        jsonb,
  reactions      jsonb default '{}'::jsonb,
  replies        jsonb default '[]'::jsonb,
  audio_src      text,
  audio_duration float,
  created_at     timestamptz default now()
);
alter table public.comments enable row level security;
create policy "Users manage own comments" on public.comments for all
  using (exists (select 1 from public.versions v join public.projects p on p.id = v.project_id where v.id = version_id and p.user_id = auth.uid()))
  with check (exists (select 1 from public.versions v join public.projects p on p.id = v.project_id where v.id = version_id and p.user_id = auth.uid()));

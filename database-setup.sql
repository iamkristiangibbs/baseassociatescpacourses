-- ============================================================
--  BASE ASSOCIATES CPA — Database Setup
--  Run this entire file ONCE in your Supabase SQL Editor
--  Dashboard → SQL Editor → New Query → paste → Run
-- ============================================================

-- 1. PROFILES (extends Supabase auth.users)
create table if not exists public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  full_name     text,
  phone         text,
  job_title     text,
  organisation  text,
  role          text default 'learner',   -- 'learner' | 'admin'
  created_at    timestamptz default now()
);

-- Auto-create profile on sign-up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2. BOOKINGS
create table if not exists public.bookings (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid references public.profiles(id) on delete cascade,
  course_id       int not null,
  course_title    text not null,
  session_slot    text not null,
  status          text default 'pending',   -- 'pending' | 'confirmed' | 'cancelled'
  payment_method  text,                      -- 'mtn' | 'airtel'
  payment_phone   text,
  payment_status  text default 'pending',   -- 'pending' | 'paid' | 'failed'
  amount_ugx      int default 118000,
  booking_ref     text unique,
  booked_at       timestamptz default now()
);

-- 3. WAITLIST
create table if not exists public.waitlist (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references public.profiles(id) on delete cascade,
  course_id   int not null,
  joined_at   timestamptz default now()
);

-- 4. ROW LEVEL SECURITY
alter table public.profiles  enable row level security;
alter table public.bookings  enable row level security;
alter table public.waitlist  enable row level security;

-- Profiles: users see/edit own; admins see all
create policy "Users can view own profile"
  on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);
create policy "Admins can view all profiles"
  on public.profiles for select using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Bookings: users see own; admins see all
create policy "Users can view own bookings"
  on public.bookings for select using (auth.uid() = user_id);
create policy "Users can insert own bookings"
  on public.bookings for insert with check (auth.uid() = user_id);
create policy "Users can update own bookings"
  on public.bookings for update using (auth.uid() = user_id);
create policy "Admins can view all bookings"
  on public.bookings for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Waitlist
create policy "Users manage own waitlist"
  on public.waitlist for all using (auth.uid() = user_id);
create policy "Admins manage all waitlist"
  on public.waitlist for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- ============================================================
--  MAKE YOURSELF ADMIN
--  After registering, run this with your email:
--  UPDATE public.profiles SET role='admin'
--  WHERE id = (SELECT id FROM auth.users WHERE email='YOUR@EMAIL.com');
-- ============================================================

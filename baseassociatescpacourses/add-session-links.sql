-- ============================================================
--  BASE ASSOCIATES CPA — Session Links Table
--  Run this in Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- Stores Zoom / Google Meet links per course + time slot
create table if not exists public.session_links (
  id          uuid primary key default gen_random_uuid(),
  course_id   int  not null,
  slot_id     text not null,  -- 'morning' | 'lunch' | 'evening' | 'late' | 'midnight'
  link_url    text not null,
  link_type   text not null default 'zoom',  -- 'zoom' | 'meet'
  updated_at  timestamptz default now(),
  unique(course_id, slot_id)
);

alter table public.session_links enable row level security;

-- Logged-in students can read links for their enrolled courses
create policy "Authenticated users can view session links"
  on public.session_links for select
  using (auth.role() = 'authenticated');

-- Only admins can create / update / delete links
create policy "Admins can manage session links"
  on public.session_links for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

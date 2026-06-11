-- ============================================================
--  BASE ASSOCIATES CPA — Certificates Table
--  Run in Supabase → SQL Editor → New Query
-- ============================================================

-- 1. Certificates table
create table if not exists public.certificates (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references public.profiles(id) on delete cascade,
  booking_id   uuid references public.bookings(id) on delete cascade,
  course_id    int  not null,
  course_title text not null,
  file_name    text not null,
  file_url     text not null,
  issued_at    timestamptz default now(),
  unique(booking_id)
);

alter table public.certificates enable row level security;

-- Students can only see their own certificates
create policy "Users can view own certificates"
  on public.certificates for select
  using (auth.uid() = user_id);

-- Admins can do everything
create policy "Admins can manage all certificates"
  on public.certificates for all
  using (public.is_admin());

-- ============================================================
--  2. Storage bucket for certificate files
--  Go to Supabase → Storage → New Bucket
--    Name:   certificates
--    Public: YES  (so download links work without signed URLs)
-- ============================================================

-- ============================================================
--  Fix: Admins can now see ALL users, bookings, and waitlist
--
--  The problem: the old policies checked "is this user an admin?"
--  by querying the profiles table — but that table is protected
--  by RLS, so the check would fail recursively and fall back to
--  "only show your own row."
--
--  The fix: a SECURITY DEFINER function that runs as the DB owner
--  (bypassing RLS) to check the admin role, then all policies
--  call that function instead of querying profiles directly.
--
--  Run this entire file in Supabase → SQL Editor → New Query
-- ============================================================

-- 1. Create a helper that bypasses RLS to check admin status
create or replace function public.is_admin()
returns boolean
language sql
security definer   -- runs as DB owner, not the calling user
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- 2. Drop the broken policies
drop policy if exists "Admins can view all profiles"   on public.profiles;
drop policy if exists "Admins can view all bookings"   on public.bookings;
drop policy if exists "Admins manage all waitlist"     on public.waitlist;
drop policy if exists "Admins can manage session links" on public.session_links;

-- 3. Recreate them using the safe helper function

create policy "Admins can view all profiles"
  on public.profiles for select
  using (public.is_admin());

create policy "Admins can update all profiles"
  on public.profiles for update
  using (public.is_admin());

create policy "Admins can manage all bookings"
  on public.bookings for all
  using (public.is_admin());

create policy "Admins manage all waitlist"
  on public.waitlist for all
  using (public.is_admin());

create policy "Admins can manage session links"
  on public.session_links for all
  using (public.is_admin());

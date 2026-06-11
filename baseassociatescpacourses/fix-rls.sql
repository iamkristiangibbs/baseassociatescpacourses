-- ============================================================
--  Fix infinite recursion in profiles RLS policy
--  Run this in Supabase SQL Editor
-- ============================================================

-- Step 1: Drop the broken policy that causes the loop
drop policy if exists "Admins can view all profiles" on public.profiles;
drop policy if exists "Admins can manage all bookings" on public.bookings;
drop policy if exists "Admins manage all waitlist" on public.waitlist;

-- Step 2: Re-create profiles admin policy using auth.jwt() 
-- instead of querying the profiles table (avoids the recursion)
create policy "Admins can view all profiles"
  on public.profiles for select
  using (
    auth.uid() = id
    or (auth.jwt() ->> 'role') = 'admin'
  );

-- Step 3: Re-create bookings admin policy the same safe way
create policy "Admins can manage all bookings"
  on public.bookings for all
  using (
    auth.uid() = user_id
    or (auth.jwt() ->> 'role') = 'admin'
  );

-- Step 4: Re-create waitlist admin policy
create policy "Admins manage all waitlist"
  on public.waitlist for all
  using (
    auth.uid() = user_id
    or (auth.jwt() ->> 'role') = 'admin'
  );

-- Step 5: Also allow INSERT into profiles for new users
-- (needed so the trigger can create the profile on sign-up)
drop policy if exists "Allow insert for new users" on public.profiles;
create policy "Allow insert for new users"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Step 6: Allow users to insert their own bookings (no recursion)
drop policy if exists "Users can insert own bookings" on public.bookings;
create policy "Users can insert own bookings"
  on public.bookings for insert
  with check (auth.uid() = user_id);

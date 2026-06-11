-- ============================================================
--  Add course notes table
--  Run in Supabase SQL Editor
-- ============================================================

create table if not exists public.course_notes (
  id           uuid primary key default gen_random_uuid(),
  course_id    int not null,
  course_title text not null,
  file_name    text not null,
  file_url     text not null,
  uploaded_by  uuid references public.profiles(id),
  uploaded_at  timestamptz default now()
);

alter table public.course_notes enable row level security;

-- Everyone who is logged in can read notes
create policy "Logged in users can view notes"
  on public.course_notes for select
  using (auth.uid() is not null);

-- Only admins can insert/delete notes
create policy "Admins can manage notes"
  on public.course_notes for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Create storage bucket for notes (run this too)
insert into storage.buckets (id, name, public)
values ('course-notes', 'course-notes', true)
on conflict do nothing;

-- Allow authenticated users to read files
create policy "Public read course notes"
  on storage.objects for select
  using (bucket_id = 'course-notes');

-- Allow admins to upload files
create policy "Admins can upload course notes"
  on storage.objects for insert
  with check (
    bucket_id = 'course-notes'
    and auth.uid() is not null
  );

-- Allow admins to delete files
create policy "Admins can delete course notes"
  on storage.objects for delete
  using (
    bucket_id = 'course-notes'
    and auth.uid() is not null
  );

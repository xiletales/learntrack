-- ═══════════════════════════════════════════════════════════════════
-- LearnTrack — Supabase Schema
-- Run this in your Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════════

create extension if not exists "uuid-ossp";

-- ─── PROFILES ────────────────────────────────────────────────────
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  role        text not null check (role in ('student', 'teacher')),
  name        text not null,
  gender      text check (gender in ('Male', 'Female')),
  school      text,
  school_year text,
  photo_url   text,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- ─── STUDENTS ────────────────────────────────────────────────────
create table public.students (
  id          uuid primary key references public.profiles(id) on delete cascade,
  nisn        text unique not null,
  birth_date  date,
  class       text,
  address     text
);

-- ─── TEACHERS ────────────────────────────────────────────────────
create table public.teachers (
  id              uuid primary key references public.profiles(id) on delete cascade,
  nip             text unique not null,
  class_handled   text,
  subject         text,
  phone           text,
  email           text
);

-- ─── GRADES ──────────────────────────────────────────────────────
create table public.grades (
  id          uuid primary key default uuid_generate_v4(),
  student_id  uuid not null references public.students(id) on delete cascade,
  semester    text not null,
  math        numeric(5,2) not null,
  science     numeric(5,2) not null,
  indonesian  numeric(5,2) not null,
  english     numeric(5,2) not null,
  avg         numeric(5,2) generated always as (
                (math + science + indonesian + english) / 4
              ) stored,
  uploaded_by uuid references public.teachers(id),
  created_at  timestamptz default now(),
  updated_at  timestamptz default now(),
  unique(student_id, semester)
);

-- ─── REFLECTIONS ─────────────────────────────────────────────────
create table public.reflections (
  id            uuid primary key default uuid_generate_v4(),
  student_id    uuid not null references public.students(id) on delete cascade,
  semester      text not null,
  text          text,
  target        text,
  teacher_note  text,
  noted_by      uuid references public.teachers(id),
  created_at    timestamptz default now(),
  updated_at    timestamptz default now(),
  unique(student_id, semester)
);

-- ═══════════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY
-- ═══════════════════════════════════════════════════════════════════

alter table public.profiles enable row level security;
alter table public.students enable row level security;
alter table public.teachers enable row level security;
alter table public.grades enable row level security;
alter table public.reflections enable row level security;

-- ── PROFILES ──
create policy "profiles_read_own" on public.profiles
  for select using (auth.uid() = id);

create policy "profiles_teacher_reads_students" on public.profiles
  for select using (
    exists (
      select 1 from public.teachers t
      join public.students s on s.class = t.class_handled
      where t.id = auth.uid() and s.id = profiles.id
    )
  );

create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- ── STUDENTS ──
create policy "students_read_own" on public.students
  for select using (auth.uid() = id);

create policy "students_teacher_reads_class" on public.students
  for select using (
    exists (
      select 1 from public.teachers t
      where t.id = auth.uid() and t.class_handled = students.class
    )
  );

create policy "students_update_own" on public.students
  for update using (auth.uid() = id);

-- ── TEACHERS ──
create policy "teachers_read_own" on public.teachers
  for select using (auth.uid() = id);

create policy "teachers_update_own" on public.teachers
  for update using (auth.uid() = id);

-- ── GRADES ──
create policy "grades_student_reads_own" on public.grades
  for select using (auth.uid() = student_id);

create policy "grades_teacher_reads_class" on public.grades
  for select using (
    exists (
      select 1 from public.teachers t
      join public.students s on s.class = t.class_handled
      where t.id = auth.uid() and s.id = grades.student_id
    )
  );

create policy "grades_teacher_inserts" on public.grades
  for insert with check (
    exists (select 1 from public.teachers where id = auth.uid())
  );

create policy "grades_teacher_updates" on public.grades
  for update using (
    exists (select 1 from public.teachers where id = auth.uid())
  );

-- ── REFLECTIONS ──
create policy "reflections_student_reads_own" on public.reflections
  for select using (auth.uid() = student_id);

create policy "reflections_student_inserts_own" on public.reflections
  for insert with check (auth.uid() = student_id);

create policy "reflections_student_updates_own" on public.reflections
  for update using (auth.uid() = student_id);

create policy "reflections_teacher_reads_class" on public.reflections
  for select using (
    exists (
      select 1 from public.teachers t
      join public.students s on s.class = t.class_handled
      where t.id = auth.uid() and s.id = reflections.student_id
    )
  );

create policy "reflections_teacher_updates_class" on public.reflections
  for update using (
    exists (
      select 1 from public.teachers t
      join public.students s on s.class = t.class_handled
      where t.id = auth.uid() and s.id = reflections.student_id
    )
  );

create policy "reflections_teacher_inserts" on public.reflections
  for insert with check (
    exists (select 1 from public.teachers where id = auth.uid())
  );

-- ═══════════════════════════════════════════════════════════════════
-- STORAGE
-- ═══════════════════════════════════════════════════════════════════

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

create policy "avatars_upload_own" on storage.objects
  for insert with check (
    bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "avatars_public_read" on storage.objects
  for select using (bucket_id = 'avatars');

create policy "avatars_update_own" on storage.objects
  for update using (
    bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "avatars_delete_own" on storage.objects
  for delete using (
    bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]
  );

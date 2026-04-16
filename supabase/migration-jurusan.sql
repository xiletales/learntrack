-- Add jurusan column to teachers table
ALTER TABLE public.teachers ADD COLUMN IF NOT EXISTS jurusan text CHECK (jurusan IN ('MIPA', 'IPS'));

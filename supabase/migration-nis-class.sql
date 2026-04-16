-- Rename nisn to nis and add major/grade/class_number to students
ALTER TABLE public.students RENAME COLUMN nisn TO nis;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS major text CHECK (major IN ('MIPA', 'IPS'));
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS grade text CHECK (grade IN ('10', '11', '12'));
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS class_number text CHECK (class_number IN ('1', '2', '3'));
ALTER TABLE public.students DROP COLUMN IF EXISTS class;

-- Add jurusan to teachers if not exists
ALTER TABLE public.teachers ADD COLUMN IF NOT EXISTS jurusan text CHECK (jurusan IN ('MIPA', 'IPS'));

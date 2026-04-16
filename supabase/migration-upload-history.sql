-- Upload history table
CREATE TABLE IF NOT EXISTS public.upload_history (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  teacher_id uuid NOT NULL REFERENCES public.teachers(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  row_count integer NOT NULL DEFAULT 0,
  success_count integer NOT NULL DEFAULT 0,
  failed_count integer NOT NULL DEFAULT 0,
  status text NOT NULL CHECK (status IN ('success', 'partial', 'failed')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.upload_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "upload_history_teacher_reads_own" ON public.upload_history
  FOR SELECT USING (auth.uid() = teacher_id);

CREATE POLICY "upload_history_teacher_inserts" ON public.upload_history
  FOR INSERT WITH CHECK (auth.uid() = teacher_id);

-- ═══════════════════════════════════════════════════════════════════
-- Migration: Expand subjects to full Indonesian curriculum
-- Run this in Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════════

-- Drop the computed avg column first (it depends on old columns)
ALTER TABLE public.grades DROP COLUMN IF EXISTS avg;

-- Rename existing columns
ALTER TABLE public.grades RENAME COLUMN math TO matematika_umum;
ALTER TABLE public.grades RENAME COLUMN science TO fisika;
ALTER TABLE public.grades RENAME COLUMN indonesian TO bahasa_indonesia;
ALTER TABLE public.grades RENAME COLUMN english TO bahasa_inggris;

-- Add new subject columns
ALTER TABLE public.grades ADD COLUMN IF NOT EXISTS matematika_peminatan numeric(5,2) NOT NULL DEFAULT 0;
ALTER TABLE public.grades ADD COLUMN IF NOT EXISTS kimia numeric(5,2) NOT NULL DEFAULT 0;
ALTER TABLE public.grades ADD COLUMN IF NOT EXISTS biologi numeric(5,2) NOT NULL DEFAULT 0;
ALTER TABLE public.grades ADD COLUMN IF NOT EXISTS sejarah numeric(5,2) NOT NULL DEFAULT 0;
ALTER TABLE public.grades ADD COLUMN IF NOT EXISTS informatika numeric(5,2) NOT NULL DEFAULT 0;
ALTER TABLE public.grades ADD COLUMN IF NOT EXISTS pai numeric(5,2) NOT NULL DEFAULT 0;
ALTER TABLE public.grades ADD COLUMN IF NOT EXISTS pjok numeric(5,2) NOT NULL DEFAULT 0;

-- Add computed average from all 11 subjects
ALTER TABLE public.grades ADD COLUMN avg numeric(5,2) GENERATED ALWAYS AS (
  (matematika_umum + matematika_peminatan + bahasa_indonesia + bahasa_inggris +
   fisika + kimia + biologi + sejarah + informatika + pai + pjok) / 11
) STORED;

-- Remove defaults now that migration is done
ALTER TABLE public.grades ALTER COLUMN matematika_peminatan DROP DEFAULT;
ALTER TABLE public.grades ALTER COLUMN kimia DROP DEFAULT;
ALTER TABLE public.grades ALTER COLUMN biologi DROP DEFAULT;
ALTER TABLE public.grades ALTER COLUMN sejarah DROP DEFAULT;
ALTER TABLE public.grades ALTER COLUMN informatika DROP DEFAULT;
ALTER TABLE public.grades ALTER COLUMN pai DROP DEFAULT;
ALTER TABLE public.grades ALTER COLUMN pjok DROP DEFAULT;

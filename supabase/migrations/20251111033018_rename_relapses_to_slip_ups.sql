/*
  # Rename Relapses to Slip Ups

  Handles both cases:
  - If relapses table exists, rename it to slip_ups
  - If slip_ups already exists, just ensure RLS policies are correct
*/
DO $$
BEGIN
  -- Only rename if relapses exists and slip_ups doesn't
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'relapses')
     AND NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'slip_ups') THEN
    ALTER TABLE public.relapses RENAME TO slip_ups;
  END IF;

  -- Rename column if it exists (from relapses table)
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'slip_ups' AND column_name = 'relapse_date'
  ) THEN
    ALTER TABLE public.slip_ups RENAME COLUMN relapse_date TO slip_up_date;
  END IF;
END $$;

DROP POLICY IF EXISTS "Users can view own relapses" ON public.slip_ups;
DROP POLICY IF EXISTS "Users can insert own relapses" ON public.slip_ups;
DROP POLICY IF EXISTS "Users can update own relapses" ON public.slip_ups;
DROP POLICY IF EXISTS "Users can delete own relapses" ON public.slip_ups;
DROP POLICY IF EXISTS "Sponsors can view their sponsees' relapses" ON public.slip_ups;

DROP POLICY IF EXISTS "Users can view own slip ups" ON public.slip_ups;
CREATE POLICY "Users can view own slip ups"
  ON public.slip_ups FOR SELECT TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert own slip ups" ON public.slip_ups;
CREATE POLICY "Users can insert own slip ups"
  ON public.slip_ups FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own slip ups" ON public.slip_ups;
CREATE POLICY "Users can update own slip ups"
  ON public.slip_ups FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete own slip ups" ON public.slip_ups;
CREATE POLICY "Users can delete own slip ups"
  ON public.slip_ups FOR DELETE TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Sponsors can view their sponsees' slip ups" ON public.slip_ups;
CREATE POLICY "Sponsors can view their sponsees' slip ups"
  ON public.slip_ups FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.sponsor_sponsee_relationships
      WHERE sponsor_sponsee_relationships.sponsor_id = auth.uid()
        AND sponsor_sponsee_relationships.sponsee_id = slip_ups.user_id
        AND sponsor_sponsee_relationships.status = 'active'
    )
  );

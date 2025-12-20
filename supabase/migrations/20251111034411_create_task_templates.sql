/*
  # Create Task Templates Table
*/
CREATE TABLE IF NOT EXISTS public.task_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  step_number integer NOT NULL CHECK (step_number >= 1 AND step_number <= 12),
  title text NOT NULL,
  description text NOT NULL,
  is_default boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_task_templates_step_number ON public.task_templates(step_number);
CREATE INDEX IF NOT EXISTS idx_task_templates_is_default ON public.task_templates(is_default);

DROP TRIGGER IF EXISTS update_task_templates_updated_at ON public.task_templates;
CREATE TRIGGER update_task_templates_updated_at
  BEFORE UPDATE ON public.task_templates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.task_templates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view task templates" ON public.task_templates;
CREATE POLICY "Anyone can view task templates"
  ON public.task_templates FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Sponsors can create custom templates" ON public.task_templates;
CREATE POLICY "Sponsors can create custom templates"
  ON public.task_templates FOR INSERT TO authenticated
  WITH CHECK (is_default = false);

DROP POLICY IF EXISTS "Template owners can update their templates" ON public.task_templates;
CREATE POLICY "Template owners can update their templates"
  ON public.task_templates FOR UPDATE TO authenticated
  USING (is_default = false)
  WITH CHECK (is_default = false);

DROP POLICY IF EXISTS "Template owners can delete their templates" ON public.task_templates;
CREATE POLICY "Template owners can delete their templates"
  ON public.task_templates FOR DELETE TO authenticated
  USING (is_default = false);

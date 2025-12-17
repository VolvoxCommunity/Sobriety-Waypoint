/*
  # Make Step Number Nullable in Tasks

  Allows tasks to be created without being associated with a specific step.
  This enables more flexible task assignment for general recovery activities.
*/
ALTER TABLE public.tasks ALTER COLUMN step_number DROP NOT NULL;
ALTER TABLE public.tasks DROP CONSTRAINT IF EXISTS tasks_step_number_check;
ALTER TABLE public.tasks ADD CONSTRAINT tasks_step_number_check
  CHECK (step_number IS NULL OR (step_number >= 1 AND step_number <= 12));

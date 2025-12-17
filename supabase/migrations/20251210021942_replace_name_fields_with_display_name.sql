/*
  # Replace Name Fields with Display Name

  Migrates from first_name/last_name to a single display_name field.
  Idempotent: handles cases where migration was partially applied.
*/

-- Add display_name column
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS display_name text;

-- Migrate existing data only if old columns exist
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'first_name'
  ) THEN
    UPDATE public.profiles
    SET display_name = TRIM(COALESCE(first_name, '') || ' ' || COALESCE(last_name, ''))
    WHERE display_name IS NULL
      AND (first_name IS NOT NULL OR last_name IS NOT NULL);
  END IF;
END $$;

-- Clean up empty strings
UPDATE public.profiles
SET display_name = NULL
WHERE display_name = '' OR display_name = ' ';

-- Drop the old columns
ALTER TABLE public.profiles DROP COLUMN IF EXISTS first_name;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS last_name;

COMMENT ON COLUMN public.profiles.display_name IS
  'User display name shown throughout the app. Free-form text (2-30 chars).';

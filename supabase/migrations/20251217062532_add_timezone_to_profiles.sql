/*
  # Add Timezone to Profiles

  Ensures the timezone column exists on profiles table.
  Uses IANA timezone identifiers (e.g., "America/New_York").
*/
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS timezone text;

COMMENT ON COLUMN public.profiles.timezone IS
  'User timezone as IANA identifier (e.g., America/New_York). Used for local time display.';

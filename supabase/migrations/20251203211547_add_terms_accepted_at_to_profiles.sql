/*
  # Add Terms Accepted At to Profiles

  Adds a timestamp field to track when users accept the Privacy Policy
  and Terms of Service during onboarding.
*/
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS terms_accepted_at timestamptz;

COMMENT ON COLUMN public.profiles.terms_accepted_at IS
  'Timestamp when user accepted Privacy Policy and Terms of Service. Required for legal audit trail.';

/*
  # Drop Phone Column from Profiles

  Removes the phone column as it's no longer needed in the app.
  Phone verification is not a planned feature.
*/
ALTER TABLE public.profiles DROP COLUMN IF EXISTS phone;

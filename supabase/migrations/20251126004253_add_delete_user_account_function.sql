/*
  # Add Delete User Account Function

  Creates a secure function that allows users to delete their own account.
  The function is marked SECURITY DEFINER to bypass RLS for cleanup operations.
*/
CREATE OR REPLACE FUNCTION public.delete_user_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_uuid uuid;
BEGIN
  -- Get the current user's ID
  user_uuid := auth.uid();

  IF user_uuid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Delete from profiles (cascades to related data due to ON DELETE CASCADE)
  DELETE FROM public.profiles WHERE id = user_uuid;

  -- Delete the user from auth.users (this will trigger Supabase's cleanup)
  DELETE FROM auth.users WHERE id = user_uuid;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.delete_user_account() TO authenticated;

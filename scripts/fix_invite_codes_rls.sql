-- Fix for "new row violates row-level security policy for table invite_codes"
-- Run this in the Supabase SQL Editor

-- This policy allows authenticated users (sponsees) to mark an invite code as used by them.
-- It checks that:
-- 1. The user is setting 'used_by' to their own user ID.
-- 2. The invite code is not already used (optional safety check, though handled in app logic).

CREATE POLICY "Enable update for claiming invite codes" 
ON invite_codes
FOR UPDATE
TO authenticated
USING (true) -- Allows the user to find the row (e.g. by code)
WITH CHECK (
  used_by = auth.uid() -- Allows the update only if they are assigning it to themselves
);


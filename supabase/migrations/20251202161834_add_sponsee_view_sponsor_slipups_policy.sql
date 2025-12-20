/*
  # Add Sponsee View Sponsor Slip-ups Policy

  Allows sponsees to view their sponsor's slip-ups for transparency
  in the recovery mentorship relationship.
*/
DROP POLICY IF EXISTS "Sponsees can view their sponsor's slip ups" ON public.slip_ups;
CREATE POLICY "Sponsees can view their sponsor's slip ups"
  ON public.slip_ups FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.sponsor_sponsee_relationships
      WHERE sponsor_sponsee_relationships.sponsee_id = auth.uid()
        AND sponsor_sponsee_relationships.sponsor_id = slip_ups.user_id
        AND sponsor_sponsee_relationships.status = 'active'
    )
  );

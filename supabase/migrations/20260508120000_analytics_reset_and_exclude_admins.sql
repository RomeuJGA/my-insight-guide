-- Reset accumulated dev/test data
TRUNCATE TABLE public.analytics_events;

-- Replace the open INSERT policy with one that silently blocks admin users.
-- Anon visitors and regular authenticated users continue to be tracked normally.
DROP POLICY IF EXISTS "Anyone can insert analytics events" ON public.analytics_events;

CREATE POLICY "Non-admin users can insert analytics events"
ON public.analytics_events
FOR INSERT
TO anon, authenticated
WITH CHECK (
  auth.uid() IS NULL
  OR NOT public.has_role(auth.uid(), 'admin')
);

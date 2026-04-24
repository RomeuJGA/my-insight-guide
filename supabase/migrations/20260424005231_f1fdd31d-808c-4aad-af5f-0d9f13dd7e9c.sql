-- Conversion funnel events
CREATE TYPE public.analytics_event_name AS ENUM (
  'landing_view',
  'click_receive_message',
  'reveal_attempt',
  'paywall_view',
  'package_selected',
  'purchase_attempt',
  'purchase_success'
);

CREATE TABLE public.analytics_events (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_name public.analytics_event_name NOT NULL,
  user_id uuid NULL,
  package text NULL,
  metadata jsonb NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_analytics_events_created_at ON public.analytics_events (created_at DESC);
CREATE INDEX idx_analytics_events_event_name ON public.analytics_events (event_name);
CREATE INDEX idx_analytics_events_user_id ON public.analytics_events (user_id) WHERE user_id IS NOT NULL;

ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- Anyone (anon or authenticated) can insert events
CREATE POLICY "Anyone can insert analytics events"
ON public.analytics_events
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Only admins can read
CREATE POLICY "Admins can view all analytics events"
ON public.analytics_events
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- No updates or deletes
CREATE POLICY "No direct update on analytics_events"
ON public.analytics_events FOR UPDATE TO authenticated USING (false);

CREATE POLICY "No direct delete on analytics_events"
ON public.analytics_events FOR DELETE TO authenticated USING (false);

-- Aggregation function for the dashboard (admin-only via RLS check inside)
CREATE OR REPLACE FUNCTION public.get_funnel_stats(_since timestamptz DEFAULT (now() - interval '30 days'))
RETURNS TABLE (
  total_users bigint,
  landing_views bigint,
  click_receive_message bigint,
  reveal_attempts bigint,
  paywall_views bigint,
  package_selected bigint,
  purchase_attempts bigint,
  purchase_success bigint,
  top_package text,
  top_package_count bigint
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Forbidden: admin role required';
  END IF;

  RETURN QUERY
  WITH ev AS (
    SELECT * FROM public.analytics_events WHERE created_at >= _since
  ),
  pkg AS (
    SELECT package, count(*)::bigint AS c
    FROM ev
    WHERE event_name = 'package_selected' AND package IS NOT NULL
    GROUP BY package
    ORDER BY c DESC
    LIMIT 1
  )
  SELECT
    (SELECT count(DISTINCT user_id) FROM ev WHERE user_id IS NOT NULL),
    (SELECT count(*) FROM ev WHERE event_name = 'landing_view'),
    (SELECT count(*) FROM ev WHERE event_name = 'click_receive_message'),
    (SELECT count(*) FROM ev WHERE event_name = 'reveal_attempt'),
    (SELECT count(*) FROM ev WHERE event_name = 'paywall_view'),
    (SELECT count(*) FROM ev WHERE event_name = 'package_selected'),
    (SELECT count(*) FROM ev WHERE event_name = 'purchase_attempt'),
    (SELECT count(*) FROM ev WHERE event_name = 'purchase_success'),
    (SELECT package FROM pkg),
    (SELECT c FROM pkg);
END;
$$;
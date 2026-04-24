-- Index to speed up funnel queries
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at
  ON public.analytics_events (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_analytics_events_event_name
  ON public.analytics_events (event_name);

-- Replace get_funnel_stats to optionally filter by variant (metadata->>'variant')
CREATE OR REPLACE FUNCTION public.get_funnel_stats(
  _since timestamp with time zone DEFAULT (now() - interval '30 days'),
  _variant text DEFAULT NULL
)
RETURNS TABLE(
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
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Forbidden: admin role required';
  END IF;

  RETURN QUERY
  WITH ev AS (
    SELECT *
    FROM public.analytics_events
    WHERE created_at >= _since
      AND (_variant IS NULL OR (metadata->>'variant') = _variant)
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
$function$;

-- New function: side-by-side funnel for both A/B variants
CREATE OR REPLACE FUNCTION public.get_funnel_stats_by_variant(
  _since timestamp with time zone DEFAULT (now() - interval '30 days')
)
RETURNS TABLE(
  variant text,
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
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Forbidden: admin role required';
  END IF;

  RETURN QUERY
  WITH ev AS (
    SELECT
      COALESCE(NULLIF(metadata->>'variant', ''), 'unknown') AS variant,
      event_name,
      user_id,
      package
    FROM public.analytics_events
    WHERE created_at >= _since
  ),
  pkg AS (
    SELECT
      e.variant,
      e.package,
      count(*)::bigint AS c,
      row_number() OVER (PARTITION BY e.variant ORDER BY count(*) DESC) AS rn
    FROM ev e
    WHERE e.event_name = 'package_selected' AND e.package IS NOT NULL
    GROUP BY e.variant, e.package
  ),
  variants AS (
    SELECT DISTINCT e.variant FROM ev e
  )
  SELECT
    v.variant,
    (SELECT count(DISTINCT e.user_id) FROM ev e WHERE e.variant = v.variant AND e.user_id IS NOT NULL),
    (SELECT count(*) FROM ev e WHERE e.variant = v.variant AND e.event_name = 'landing_view'),
    (SELECT count(*) FROM ev e WHERE e.variant = v.variant AND e.event_name = 'click_receive_message'),
    (SELECT count(*) FROM ev e WHERE e.variant = v.variant AND e.event_name = 'reveal_attempt'),
    (SELECT count(*) FROM ev e WHERE e.variant = v.variant AND e.event_name = 'paywall_view'),
    (SELECT count(*) FROM ev e WHERE e.variant = v.variant AND e.event_name = 'package_selected'),
    (SELECT count(*) FROM ev e WHERE e.variant = v.variant AND e.event_name = 'purchase_attempt'),
    (SELECT count(*) FROM ev e WHERE e.variant = v.variant AND e.event_name = 'purchase_success'),
    (SELECT p.package FROM pkg p WHERE p.variant = v.variant AND p.rn = 1),
    (SELECT p.c FROM pkg p WHERE p.variant = v.variant AND p.rn = 1)
  FROM variants v
  ORDER BY v.variant;
END;
$function$;
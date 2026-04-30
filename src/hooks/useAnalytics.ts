import { useCallback, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Enums } from "@/integrations/supabase/types";
import { useAuth } from "./useAuth";
import { getCurrentVariant } from "./useABVariant";

export type AnalyticsEvent = Enums<"analytics_event_name">;

interface TrackOptions {
  package?: string | null;
  metadata?: Record<string, unknown>;
}

const MAX_RETRIES = 2;

/**
 * Lightweight analytics. Inserts into the `analytics_events` table.
 * Anon + authenticated users are allowed by RLS; reads are admin-only.
 * Every event is auto-tagged with the visitor's A/B variant so the
 * funnel can be split by experiment arm.
 * Failures are swallowed — analytics must never break the funnel.
 */
export function useAnalytics() {
  const { user } = useAuth();

  const track = useCallback(
    async (event: AnalyticsEvent, opts: TrackOptions = {}) => {
      const variant = getCurrentVariant();
      const metadata = {
        ...(opts.metadata ?? {}),
        ...(variant ? { variant } : {}),
      };
      const payload = {
        event_name: event,
        user_id: user?.id ?? null,
        package: opts.package ?? null,
        metadata: Object.keys(metadata).length ? metadata : null,
      };

      for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
        try {
          const { error } = await supabase.from("analytics_events").insert(payload);
          if (!error) return;
          if (attempt === MAX_RETRIES) console.warn("[analytics] failed to track", event, error);
        } catch (err) {
          if (attempt === MAX_RETRIES) console.warn("[analytics] failed to track", event, err);
        }
      }
    },
    [user?.id],
  );

  return { track };
}

/**
 * Fires a single event once per mounted component (e.g. landing_view, paywall_view).
 * Waits one tick so the A/B variant is resolved before sending.
 */
export function useTrackOnce(event: AnalyticsEvent, opts: TrackOptions = {}) {
  const { track } = useAnalytics();
  const fired = useRef(false);
  const optsKey = JSON.stringify(opts);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    // Defer to next tick so useABVariant has a chance to assign first.
    const id = window.setTimeout(() => track(event, opts), 0);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event, optsKey]);
}

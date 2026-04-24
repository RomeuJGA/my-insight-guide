import { useCallback, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export type AnalyticsEvent =
  | "landing_view"
  | "click_receive_message"
  | "reveal_attempt"
  | "paywall_view"
  | "package_selected"
  | "purchase_attempt"
  | "purchase_success";

interface TrackOptions {
  package?: string | null;
  metadata?: Record<string, unknown>;
}

/**
 * Lightweight analytics. Inserts into the `analytics_events` table.
 * Anon + authenticated users are allowed by RLS; reads are admin-only.
 * Failures are swallowed — analytics must never break the funnel.
 */
export function useAnalytics() {
  const { user } = useAuth();

  const track = useCallback(
    async (event: AnalyticsEvent, opts: TrackOptions = {}) => {
      try {
        await supabase.from("analytics_events").insert({
          event_name: event,
          user_id: user?.id ?? null,
          package: opts.package ?? null,
          metadata: opts.metadata ?? null,
        });
      } catch (err) {
        // Never throw from analytics
        console.warn("[analytics] failed to track", event, err);
      }
    },
    [user?.id],
  );

  return { track };
}

/**
 * Fires a single event once per mounted component (e.g. landing_view, paywall_view).
 */
export function useTrackOnce(event: AnalyticsEvent, opts: TrackOptions = {}) {
  const { track } = useAnalytics();
  const fired = useRef(false);
  // Stable JSON serialisation so re-renders with same data don't refire.
  const optsKey = JSON.stringify(opts);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    track(event, opts);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event, optsKey]);
}

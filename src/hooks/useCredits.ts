import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export function useCredits() {
  const { user, loading: authLoading } = useAuth();
  const [credits, setCredits] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) {
      setCredits(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.functions.invoke("get-credits");
    if (!error && data && typeof data.credits === "number") {
      setCredits(data.credits);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (authLoading) return;
    refresh();
  }, [authLoading, refresh]);

  // Realtime balance updates
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel(`user_credits:${user.id}:${Math.random().toString(36).slice(2)}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "user_credits", filter: `user_id=eq.${user.id}` },
        (payload: any) => {
          const next = payload.new?.credits;
          if (typeof next === "number") setCredits(next);
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Local override (e.g. value returned by get-message after consume)
  const setLocal = useCallback((n: number) => setCredits(n), []);

  return { credits, loading, refresh, setLocal };
}

import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

/**
 * Triggers the welcome credit grant once per session, only if the user's
 * email is verified. Server-side RPC enforces single-grant per user.
 */
export function useWelcomeCredit(onGranted?: (newBalance: number) => void) {
  const { user, loading } = useAuth();
  const triedRef = useRef<string | null>(null);

  useEffect(() => {
    if (loading || !user) return;
    if (!user.email_confirmed_at) return; // só após verificação
    if (triedRef.current === user.id) return;
    triedRef.current = user.id;

    (async () => {
      const { data, error } = await supabase.functions.invoke("grant-welcome-credit");
      if (error) return;
      if (data?.granted) {
        toast.success("Email confirmado. Recebeu 1 crédito gratuito.");
        if (typeof data.credits === "number") onGranted?.(data.credits);
      }
    })();
  }, [user, loading, onGranted]);
}

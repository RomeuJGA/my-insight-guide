import { useEffect, useRef, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const hadSessionRef = useRef(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, s) => {
      if (s) hadSessionRef.current = true;
      if (event === "SIGNED_OUT" && hadSessionRef.current) {
        toast.info("A sua sessão expirou. Por favor, inicie sessão novamente.");
        hadSessionRef.current = false;
      }
      setSession(s);
      setUser(s?.user ?? null);
    });

    supabase.auth.getSession().then(({ data: { session: s } }) => {
      if (s) hadSessionRef.current = true;
      setSession(s);
      setUser(s?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return { session, user, loading };
}

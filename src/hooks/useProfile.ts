import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export type GrammaticalGender = "m" | "f";

export interface Profile {
  user_id: string;
  full_name: string | null;
  grammatical_gender: GrammaticalGender | null;
}

export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    supabase
      .from("profiles")
      .select("user_id, full_name, grammatical_gender")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        setProfile(data as Profile | null);
        setLoading(false);
      });
  }, [user?.id]);

  const updateGender = async (gender: GrammaticalGender) => {
    if (!user) return;
    await supabase
      .from("profiles")
      .upsert({ user_id: user.id, grammatical_gender: gender, updated_at: new Date().toISOString() });
    setProfile((p) =>
      p ? { ...p, grammatical_gender: gender } : { user_id: user.id, full_name: null, grammatical_gender: gender }
    );
  };

  return { profile, loading, updateGender };
}

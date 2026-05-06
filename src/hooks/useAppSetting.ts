import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";

export function useAppSetting<T extends Json>(
  key: string,
  defaultValue: T,
): { value: T; loading: boolean; set: (v: T) => Promise<void> } {
  const [value, setValue] = useState<T>(defaultValue);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.from as any)("app_settings")
      .select("value")
      .eq("key", key)
      .maybeSingle()
      .then(({ data }: { data: { value: T } | null }) => {
        if (data?.value !== undefined && data.value !== null) {
          setValue(data.value);
        }
        setLoading(false);
      });
  }, [key]);

  const set = async (v: T) => {
    setValue(v);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from as any)("app_settings").upsert({ key, value: v });
  };

  return { value, loading, set };
}

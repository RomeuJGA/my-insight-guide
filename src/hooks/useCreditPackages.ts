import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type CreditPackage = {
  id: string;
  name: string;
  credits: number;
  price_eur: number;
  badge: string | null;
  display_order: number;
  active: boolean;
};

export function useCreditPackages(opts: { onlyActive?: boolean } = { onlyActive: true }) {
  const [packages, setPackages] = useState<CreditPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = async () => {
    setLoading(true);
    let q = supabase.from("credit_packages").select("*").order("display_order", { ascending: true });
    if (opts.onlyActive) q = q.eq("active", true);
    const { data, error } = await q;
    if (error) setError(error.message);
    else {
      setPackages(
        (data ?? []).map((p: any) => ({
          ...p,
          price_eur: typeof p.price_eur === "string" ? parseFloat(p.price_eur) : Number(p.price_eur),
        })),
      );
      setError(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opts.onlyActive]);

  return { packages, loading, error, refetch };
}

export function formatEur(value: number): string {
  return `${value.toFixed(2).replace(".", ",")} €`;
}

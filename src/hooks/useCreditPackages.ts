import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type CreditPackageRow = Database["public"]["Tables"]["credit_packages"]["Row"];

export type CreditPackage = Pick<
  CreditPackageRow,
  "id" | "name" | "credits" | "price_eur" | "badge" | "display_order" | "active"
> & { description: string | null; future_price_eur: number | null };

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
        (data ?? []).map((p: CreditPackageRow) => ({
          id: p.id,
          name: p.name,
          credits: p.credits,
          price_eur: Number(p.price_eur),
          badge: p.badge,
          display_order: p.display_order,
          active: p.active,
          description: (p as CreditPackageRow & { description?: string | null }).description ?? null,
          future_price_eur: (p as CreditPackageRow & { future_price_eur?: number | null }).future_price_eur != null
            ? Number((p as CreditPackageRow & { future_price_eur?: number | null }).future_price_eur)
            : null,
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

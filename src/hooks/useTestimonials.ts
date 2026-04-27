import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type Testimonial = {
  id: string;
  quote: string;
  author: string;
  role: string | null;
  rating: number;
  display_order: number;
  active: boolean;
};

export function useTestimonials(opts: { onlyActive?: boolean } = { onlyActive: true }) {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = async () => {
    setLoading(true);
    let q = supabase.from("testimonials").select("*").order("display_order", { ascending: true });
    if (opts.onlyActive) q = q.eq("active", true);
    const { data, error } = await q;
    if (error) setError(error.message);
    else {
      setTestimonials((data ?? []) as Testimonial[]);
      setError(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opts.onlyActive]);

  return { testimonials, loading, error, refetch };
}

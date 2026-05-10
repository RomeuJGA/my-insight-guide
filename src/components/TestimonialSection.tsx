import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import TestimonialForm from "./TestimonialForm";

const TestimonialSection = () => {
  const { user, loading: authLoading } = useAuth();
  const [hasReveals, setHasReveals] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (authLoading || !user) {
      setChecked(true);
      return;
    }
    supabase
      .from("message_reveals")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .then(({ count }) => {
        setHasReveals((count ?? 0) > 0);
        setChecked(true);
      });
  }, [user, authLoading]);

  if (!checked || !user || !hasReveals) return null;

  return (
    <section className="py-16 md:py-20 bg-background">
      <div className="container">
        <div className="max-w-xl mx-auto">
          <div className="text-center mb-8">
            <p className="text-sm font-medium text-primary uppercase tracking-wider mb-2">
              A sua opinião
            </p>
            <h2 className="font-serif text-2xl md:text-3xl">
              Partilhe a sua experiência
            </h2>
          </div>
          <TestimonialForm />
        </div>
      </div>
    </section>
  );
};

export default TestimonialSection;

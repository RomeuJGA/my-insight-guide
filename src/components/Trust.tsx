import { Star } from "lucide-react";
import { useTestimonials } from "@/hooks/useTestimonials";
import { Skeleton } from "@/components/ui/skeleton";

const Trust = () => {
  const { testimonials, loading } = useTestimonials({ onlyActive: true });

  return (
    <section className="relative py-28 md:py-36 bg-gradient-section overflow-hidden">
      <div className="container relative">
        <div className="max-w-2xl mx-auto text-center mb-20">
          <p className="text-xs font-medium text-accent mb-4 uppercase tracking-[0.18em]">Confiança</p>
          <h2 className="font-serif text-3xl md:text-5xl text-balance leading-[1.1]">
            Histórias de quem já experimentou
          </h2>
        </div>

        {loading && (
          <div className="grid gap-6 md:gap-7 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-9 rounded-3xl bg-gradient-card border border-border/60 space-y-4">
                <div className="flex gap-1">
                  {[1,2,3,4,5].map((s) => <Skeleton key={s} className="w-4 h-4 rounded-full" />)}
                </div>
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-5/6" />
                <Skeleton className="h-5 w-4/5" />
                <div className="pt-6 border-t border-border/60 space-y-2">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            ))}
          </div>
        )}
        {!loading && testimonials.length > 0 && (
          <div
            className={`grid gap-6 md:gap-7 ${
              testimonials.length >= 3
                ? "md:grid-cols-3"
                : testimonials.length === 2
                ? "md:grid-cols-2"
                : "md:grid-cols-1 max-w-2xl mx-auto"
            }`}
          >
            {testimonials.map((t) => (
              <figure
                key={t.id}
                className="p-9 rounded-3xl bg-gradient-card border border-border/60 shadow-soft hover:shadow-elegant hover:-translate-y-1 transition-smooth flex flex-col"
              >
                <div className="flex gap-0.5 mb-5">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-accent text-accent" />
                  ))}
                </div>
                <blockquote className="font-serif text-lg leading-[1.7] text-foreground/90 flex-1">
                  "{t.quote}"
                </blockquote>
                <figcaption className="mt-7 pt-6 border-t border-border/60">
                  <div className="font-medium text-sm">{t.author}</div>
                  {t.role && <div className="text-xs text-muted-foreground mt-0.5">{t.role}</div>}
                </figcaption>
              </figure>
            ))}
          </div>
        )}

        <div className="max-w-2xl mx-auto mt-20 p-7 rounded-2xl bg-card/60 backdrop-blur-sm border border-border/60 shadow-soft text-center">
          <p className="text-sm text-muted-foreground leading-[1.7]">
            Esta ferramenta destina-se a reflexão pessoal e{" "}
            <strong className="text-foreground">não substitui aconselhamento profissional</strong> —
            psicológico, médico, jurídico ou financeiro.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Trust;

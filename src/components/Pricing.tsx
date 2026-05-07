import { Check } from "lucide-react";
import { Link } from "react-router-dom";
import { useCreditPackages, formatEur } from "@/hooks/useCreditPackages";
import { Skeleton } from "@/components/ui/skeleton";
const Pricing = () => {
  const { packages, loading } = useCreditPackages({ onlyActive: true });

  return (
    <section id="pricing" className="py-24 md:py-32">
      <div className="container">
        <div className="max-w-2xl mx-auto text-center mb-16">
          <p className="text-sm font-medium text-foreground mb-3 uppercase tracking-wider">Créditos</p>
          <h2 className="font-serif text-3xl md:text-5xl text-balance mb-4 leading-[1.1]">
            Não precisa de todas as respostas.
            <br />
            <span className="italic">Precisa da certa.</span>
          </h2>
          <p className="text-muted-foreground">
            Sem subscrições.
          </p>
        </div>

        {loading ? (
          <div className="grid gap-6 max-w-5xl mx-auto md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-8 rounded-3xl border border-border/60 bg-card space-y-4">
                <Skeleton className="h-7 w-28" />
                <Skeleton className="h-12 w-36" />
                <Skeleton className="h-4 w-40" />
                <div className="space-y-3 pt-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-4/5" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
                <Skeleton className="h-11 w-full rounded-full mt-4" />
              </div>
            ))}
          </div>
        ) : (
          <div
            className={`grid gap-6 max-w-5xl mx-auto ${
              packages.length >= 3 ? "md:grid-cols-3" : packages.length === 2 ? "md:grid-cols-2" : "md:grid-cols-1"
            }`}
          >
            {packages.map((plan) => {
              const highlight = plan.badge?.toLowerCase() === "popular" || plan.badge?.toLowerCase().includes("valor");
              const perMsg = plan.price_eur / plan.credits;
              return (
                <div
                  key={plan.id}
                  className={`relative p-8 rounded-3xl border transition-smooth ${
                    highlight
                      ? "bg-gradient-primary text-primary-foreground border-primary shadow-elegant scale-[1.02]"
                      : "bg-card border-border/60 hover:border-primary/30 shadow-soft"
                  }`}
                >
                  {plan.badge && (
                    <div
                      className={`absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-medium ${
                        highlight ? "bg-accent-foreground text-primary" : "bg-primary text-primary-foreground"
                      }`}
                    >
                      {plan.badge}
                    </div>
                  )}

                  <h3 className="font-serif text-2xl mb-1">{plan.name}</h3>
                  {plan.description && (
                    <p className={`text-sm italic mb-4 ${highlight ? "text-primary-foreground/75" : "text-muted-foreground"}`}>
                      {plan.description}
                    </p>
                  )}
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="font-serif text-5xl">{formatEur(plan.price_eur)}</span>
                  </div>
                  <p
                    className={`text-sm mb-8 ${
                      highlight ? "text-primary-foreground/70" : "text-muted-foreground"
                    }`}
                  >
                    {perMsg.toFixed(2).replace(".", ",")} € por mensagem
                  </p>

                  <ul className="space-y-3 mb-8">
                    {[
                      `${plan.credits} mensagem${plan.credits === 1 ? "" : "s"} à sua escolha`,
                      "Histórico guardado",
                      "Sem validade",
                    ].map((f) => (
                      <li key={f} className="flex items-start gap-3 text-sm">
                        <Check
                          className={`w-4 h-4 mt-0.5 shrink-0 ${
                            highlight ? "text-primary-foreground" : "text-primary"
                          }`}
                        />
                        <span
                          className={highlight ? "text-primary-foreground/90" : "text-foreground/80"}
                        >
                          {f}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    to="/credits?buy=1"
                    className={`block text-center w-full py-3 rounded-full font-medium transition-smooth ${
                      highlight
                        ? "bg-primary-foreground text-primary hover:opacity-90"
                        : "bg-primary text-primary-foreground hover:opacity-90"
                    }`}
                  >
                    Escolher
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default Pricing;

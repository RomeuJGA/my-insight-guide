import { Check } from "lucide-react";
import { Link } from "react-router-dom";

const plans = [
  {
    name: "1 Mensagem",
    price: "1,99",
    perCredit: "Para começar",
    features: ["Acesso imediato", "Uma reflexão única", "Sem subscrição"],
    cta: "Começar",
    highlight: false,
  },
  {
    name: "5 Créditos",
    price: "7,99",
    perCredit: "Menos de 1,60 € por mensagem",
    features: ["5 mensagens à sua escolha", "Histórico guardado", "Sem validade"],
    cta: "Escolher",
    highlight: false,
    badge: "Popular",
  },
  {
    name: "20 Créditos",
    price: "24,99",
    perCredit: "Menos de 1 € por mensagem",
    features: ["20 mensagens à sua escolha", "Histórico guardado", "Sem validade", "Melhor valor"],
    cta: "Escolher",
    highlight: true,
    badge: "Melhor valor",
  },
];

const PricingA = () => {
  return (
    <section id="pricing" className="py-24 md:py-32">
      <div className="container">
        <div className="max-w-2xl mx-auto text-center mb-16">
          <p className="text-sm font-medium text-[hsl(165_35%_28%)] mb-3 uppercase tracking-wider">Créditos</p>
          <h2 className="font-serif text-3xl md:text-5xl text-balance mb-4 leading-[1.1]">
            Não precisa de todas as respostas.
            <br />
            <span className="italic text-[hsl(165_35%_28%)]">Precisa da certa.</span>
          </h2>
          <p className="text-muted-foreground">Pague apenas pelo que precisa. Sem subscrições.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative p-8 rounded-3xl border transition-smooth ${
                plan.highlight
                  ? "bg-[hsl(165_35%_28%)] text-[hsl(40_30%_98%)] border-[hsl(165_35%_28%)] shadow-elegant scale-[1.02]"
                  : "bg-card border-border/60 hover:border-[hsl(165_35%_28%/0.3)] shadow-soft"
              }`}
            >
              {plan.badge && (
                <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-medium ${
                  plan.highlight ? "bg-[hsl(40_30%_98%)] text-[hsl(165_35%_28%)]" : "bg-[hsl(165_35%_28%)] text-[hsl(40_30%_98%)]"
                }`}>
                  {plan.badge}
                </div>
              )}

              <h3 className="font-serif text-2xl mb-2">{plan.name}</h3>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="font-serif text-5xl">€{plan.price}</span>
              </div>
              <p className={`text-sm mb-8 ${plan.highlight ? "opacity-70" : "text-muted-foreground"}`}>
                {plan.perCredit}
              </p>

              <ul className="space-y-3 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm">
                    <Check className={`w-4 h-4 mt-0.5 shrink-0 ${plan.highlight ? "" : "text-[hsl(165_35%_28%)]"}`} />
                    <span className={plan.highlight ? "opacity-90" : "text-foreground/80"}>{f}</span>
                  </li>
                ))}
              </ul>

              <Link
                to="/credits?buy=1"
                className={`block text-center w-full py-3 rounded-full font-medium transition-smooth ${
                  plan.highlight
                    ? "bg-[hsl(40_30%_98%)] text-[hsl(165_35%_28%)] hover:opacity-90"
                    : "bg-[hsl(165_35%_28%)] text-[hsl(40_30%_98%)] hover:opacity-90"
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingA;

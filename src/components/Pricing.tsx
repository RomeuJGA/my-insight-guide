import { Check } from "lucide-react";

const plans = [
  {
    name: "1 Mensagem",
    price: "1,99",
    perCredit: "1,99 € por mensagem",
    features: ["Acesso imediato", "Uma reflexão única", "Sem subscrição"],
    cta: "Começar agora",
    highlight: false,
  },
  {
    name: "5 Créditos",
    price: "7,99",
    perCredit: "1,60 € por mensagem",
    features: ["5 mensagens à sua escolha", "Histórico guardado", "Sem validade"],
    cta: "Começar agora",
    highlight: false,
    badge: "Popular",
  },
  {
    name: "20 Créditos",
    price: "24,99",
    perCredit: "1,25 € por mensagem",
    features: ["20 mensagens à sua escolha", "Histórico guardado", "Sem validade", "Melhor valor"],
    cta: "Começar agora",
    highlight: true,
    badge: "Melhor valor",
  },
];

const Pricing = () => {
  return (
    <section id="pricing" className="py-24 md:py-32 bg-gradient-soft">
      <div className="container">
        <div className="max-w-2xl mx-auto text-center mb-16">
          <p className="text-sm font-medium text-primary mb-3 uppercase tracking-wider">Preços</p>
          <h2 className="font-serif text-3xl md:text-5xl text-balance mb-4">
            Comece pelo que faz sentido para si
          </h2>
          <p className="text-muted-foreground">Pague apenas pelo que precisa. Sem subscrições.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative p-8 rounded-3xl border transition-smooth ${
                plan.highlight
                  ? "bg-gradient-primary text-primary-foreground border-primary shadow-elegant scale-[1.02]"
                  : "bg-card border-border/60 hover:border-primary/30 shadow-soft"
              }`}
            >
              {plan.badge && (
                <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-medium ${
                  plan.highlight ? "bg-accent-foreground text-primary" : "bg-primary text-primary-foreground"
                }`}>
                  {plan.badge}
                </div>
              )}

              <h3 className="font-serif text-2xl mb-2">{plan.name}</h3>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="font-serif text-5xl">€{plan.price}</span>
              </div>
              <p className={`text-sm mb-8 ${plan.highlight ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                {plan.perCredit}
              </p>

              <ul className="space-y-3 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm">
                    <Check className={`w-4 h-4 mt-0.5 shrink-0 ${plan.highlight ? "text-primary-foreground" : "text-primary"}`} />
                    <span className={plan.highlight ? "text-primary-foreground/90" : "text-foreground/80"}>{f}</span>
                  </li>
                ))}
              </ul>

              <a
                href="#experience"
                className={`block text-center w-full py-3 rounded-full font-medium transition-smooth ${
                  plan.highlight
                    ? "bg-primary-foreground text-primary hover:opacity-90"
                    : "bg-primary text-primary-foreground hover:opacity-90"
                }`}
              >
                {plan.cta}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;

import { Check, Gift, Sparkles } from "lucide-react";

const FreeVsPaidA = () => {
  return (
    <section className="py-24 md:py-32">
      <div className="container">
        <div className="max-w-2xl mx-auto text-center mb-16">
          <p className="text-sm font-medium text-[hsl(165_35%_28%)] mb-3 uppercase tracking-wider">Duas formas de explorar</p>
          <h2 className="font-serif text-3xl md:text-5xl text-balance leading-[1.1]">
            Comece pelo ritmo que faz sentido para si
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <div className="p-8 md:p-10 rounded-3xl bg-card border border-border/60 shadow-soft">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-11 h-11 rounded-2xl bg-muted flex items-center justify-center">
                <Gift className="w-5 h-5 text-foreground/70" strokeWidth={1.75} />
              </div>
              <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Gratuito</span>
            </div>
            <h3 className="font-serif text-2xl mb-6">Mensagem diária</h3>
            <ul className="space-y-3.5">
              {[
                "1 mensagem por dia",
                "Aleatória — escolhida para si",
                "Um momento de reflexão diário",
              ].map((f) => (
                <li key={f} className="flex items-start gap-3 text-sm">
                  <Check className="w-4 h-4 mt-0.5 shrink-0 text-foreground/60" />
                  <span className="text-foreground/80 leading-relaxed">{f}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="relative p-8 md:p-10 rounded-3xl bg-[hsl(165_35%_28%)] text-[hsl(40_30%_98%)] border border-[hsl(165_35%_28%)] shadow-elegant">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-11 h-11 rounded-2xl bg-[hsl(40_30%_98%/0.15)] flex items-center justify-center">
                <Sparkles className="w-5 h-5" strokeWidth={1.75} />
              </div>
              <span className="text-xs uppercase tracking-wider opacity-80 font-medium">Com créditos</span>
            </div>
            <h3 className="font-serif text-2xl mb-6">Mensagem à sua escolha</h3>
            <ul className="space-y-3.5">
              {[
                "Escolhe o número que sentir",
                "Acesso permanente às mensagens reveladas",
                "Histórico pessoal guardado",
                "Créditos sem prazo — usa quando quiser",
              ].map((f) => (
                <li key={f} className="flex items-start gap-3 text-sm">
                  <Check className="w-4 h-4 mt-0.5 shrink-0" />
                  <span className="opacity-95 leading-relaxed">{f}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FreeVsPaidA;

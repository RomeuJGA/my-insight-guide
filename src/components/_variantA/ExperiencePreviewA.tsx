import { useState } from "react";
import { ArrowRight, Eye, Quote } from "lucide-react";
import Disclaimer from "../Disclaimer";

const ExperiencePreviewA = () => {
  const [revealed, setRevealed] = useState(false);

  return (
    <section id="preview" className="py-24 md:py-32 bg-gradient-soft">
      <div className="container">
        <div className="max-w-2xl mx-auto text-center mb-12">
          <p className="text-sm font-medium text-[hsl(165_35%_28%)] mb-3 uppercase tracking-wider">Experiência</p>
          <h2 className="font-serif text-3xl md:text-5xl text-balance mb-4 leading-[1.1]">
            Uma mensagem pode mudar a forma como vê tudo.
          </h2>
          <p className="text-muted-foreground text-base md:text-lg leading-relaxed">
            Leia com atenção. Não procure concordar ou discordar de imediato.
          </p>
        </div>

        <div className="max-w-xl mx-auto">
          <div className="relative p-10 md:p-14 rounded-3xl bg-gradient-message border border-border/60 shadow-elegant">
            <div className="flex items-center justify-between mb-8">
              <span className="font-serif text-4xl text-[hsl(165_35%_28%)]">237</span>
              <Quote className="w-6 h-6 text-[hsl(165_35%_28%/0.4)]" strokeWidth={1.5} />
            </div>

            <p
              className={`font-serif text-xl md:text-2xl leading-relaxed text-foreground/90 transition-all duration-700 ${
                revealed ? "blur-0 opacity-100" : "blur-md opacity-70 select-none"
              }`}
            >
              "A perspetiva que procura nem sempre é nova — apenas esteve adormecida à espera do seu olhar.
              Pare por um instante. Escute o que tem evitado ouvir."
            </p>

            <Disclaimer variant="inline" className="mt-6" />

            <div className="mt-6 pt-6 border-t border-border/60 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Mensagem · exemplo</span>
              {!revealed && (
                <button
                  onClick={() => setRevealed(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[hsl(165_35%_28%)] text-[hsl(40_30%_98%)] text-sm font-medium hover:opacity-90 transition-smooth shadow-soft"
                >
                  <Eye className="w-4 h-4" />
                  Ver exemplo
                </button>
              )}
            </div>
          </div>

          <div className="mt-8 text-center">
            <a
              href="#experience"
              className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-[hsl(165_35%_28%)] text-[hsl(40_30%_98%)] font-medium shadow-elegant hover:shadow-glow transition-smooth"
            >
              Receber a minha mensagem
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-smooth" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ExperiencePreviewA;

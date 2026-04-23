import { useState } from "react";
import { Eye, Quote } from "lucide-react";
import Disclaimer from "./Disclaimer";

const ExperiencePreview = () => {
  const [revealed, setRevealed] = useState(false);

  return (
    <section id="preview" className="py-24 md:py-32 bg-gradient-soft">
      <div className="container">
        <div className="max-w-2xl mx-auto text-center mb-12">
          <p className="text-sm font-medium text-primary mb-3 uppercase tracking-wider">Experiência</p>
          <h2 className="font-serif text-3xl md:text-5xl text-balance">
            Veja como uma mensagem se apresenta
          </h2>
        </div>

        <div className="max-w-xl mx-auto">
          <div className="relative p-10 md:p-14 rounded-3xl bg-gradient-message border border-border/60 shadow-elegant">
            <div className="flex items-center justify-between mb-8">
              <span className="font-serif text-4xl text-primary">237</span>
              <Quote className="w-6 h-6 text-primary/40" strokeWidth={1.5} />
            </div>

            <p
              className={`font-serif text-xl md:text-2xl leading-relaxed text-foreground/90 transition-all duration-700 ${
                revealed ? "blur-0 opacity-100" : "blur-md opacity-70 select-none"
              }`}
            >
              "Aquilo que procura fora de si já existe, em silêncio, dentro de si.
              Pare por um instante. Escute. A perspetiva que procura nem sempre é nova —
              apenas esteve adormecida à espera do seu olhar."
            </p>

            <Disclaimer variant="inline" className="mt-6" />

            <div className="mt-6 pt-6 border-t border-border/60 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Mensagem · exemplo</span>
              {!revealed && (
                <button
                  onClick={() => setRevealed(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-smooth shadow-soft"
                >
                  <Eye className="w-4 h-4" />
                  Ver exemplo
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ExperiencePreview;

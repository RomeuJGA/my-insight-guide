import { Star } from "lucide-react";

const testimonials = [
  {
    quote: "Uso como momento de pausa antes de decisões importantes. Ajuda-me a abrandar e a olhar para a situação com mais calma.",
    author: "Mariana S.",
    role: "Lisboa",
  },
  {
    quote: "Nem sempre concordo com a mensagem que recebo — mas faz-me pensar. E é precisamente esse o valor.",
    author: "André P.",
    role: "Porto",
  },
  {
    quote: "Tenho o livro físico há anos. Ter agora a versão digital tornou-se um pequeno ritual diário.",
    author: "Inês R.",
    role: "Coimbra",
  },
];

const Trust = () => {
  return (
    <section className="relative py-28 md:py-36 bg-gradient-section overflow-hidden">
      <div className="container relative">
        <div className="max-w-2xl mx-auto text-center mb-20">
          <p className="text-xs font-medium text-accent mb-4 uppercase tracking-[0.18em]">Confiança</p>
          <h2 className="font-serif text-3xl md:text-5xl text-balance leading-[1.1]">
            Histórias de quem já experimentou
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6 md:gap-7">
          {testimonials.map((t) => (
            <figure key={t.author} className="p-9 rounded-3xl bg-gradient-card border border-border/60 shadow-soft hover:shadow-elegant hover:-translate-y-1 transition-smooth flex flex-col">
              <div className="flex gap-0.5 mb-5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-accent text-accent" />
                ))}
              </div>
              <blockquote className="font-serif text-lg leading-[1.7] text-foreground/90 flex-1">
                "{t.quote}"
              </blockquote>
              <figcaption className="mt-7 pt-6 border-t border-border/60">
                <div className="font-medium text-sm">{t.author}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{t.role}</div>
              </figcaption>
            </figure>
          ))}
        </div>

        <div className="max-w-2xl mx-auto mt-20 p-7 rounded-2xl bg-card/60 backdrop-blur-sm border border-border/60 shadow-soft text-center">
          <p className="text-sm text-muted-foreground leading-[1.7]">
            Esta ferramenta destina-se a reflexão pessoal e <strong className="text-foreground">não substitui aconselhamento profissional</strong> — psicológico, médico, jurídico ou financeiro.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Trust;

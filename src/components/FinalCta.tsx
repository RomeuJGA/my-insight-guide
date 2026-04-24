import { ArrowRight } from "lucide-react";

const FinalCta = () => {
  return (
    <section className="py-24 md:py-32 bg-gradient-hero relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[40rem] rounded-full bg-primary-glow/20 blur-3xl" />
      </div>
      <div className="container relative">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-serif text-4xl md:text-6xl text-balance mb-6 leading-[1.05]">
            Pronto para ver com mais <span className="italic text-primary">clareza</span>?
          </h2>
          <p className="text-lg text-muted-foreground mb-10 leading-relaxed">
            Pause. Respire. Escolha um número.
          </p>
          <a
            href="#experience"
            className="group inline-flex items-center gap-2 px-8 py-4 rounded-full bg-primary text-primary-foreground font-medium shadow-elegant hover:shadow-glow transition-smooth"
          >
            Receber a minha mensagem
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-smooth" />
          </a>
        </div>
      </div>
    </section>
  );
};

export default FinalCta;

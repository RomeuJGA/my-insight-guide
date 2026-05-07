import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const FinalCta = () => {
  return (
    <section className="relative py-28 md:py-40 bg-gradient-hero bg-noise overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[44rem] h-[44rem] rounded-full bg-accent/[0.08] blur-3xl" />
      </div>
      <div className="container relative">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-serif text-4xl md:text-6xl text-balance mb-8 leading-[1.05]">
            Pronto para ver com mais <span className="italic text-accent">clareza</span>?
          </h2>
          <p className="text-lg text-muted-foreground mb-12 leading-relaxed">
            Pause. Respire. Escolha um número.
          </p>
          <Link
            to="/credits?buy=1"
            className="group inline-flex items-center gap-2 px-9 py-4 rounded-full bg-accent text-accent-foreground font-medium shadow-elegant hover:shadow-glow hover:-translate-y-0.5 transition-smooth"
          >
            Escolher o meu número
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-smooth" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FinalCta;

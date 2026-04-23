import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Footer from "./Footer";

interface LegalLayoutProps {
  title: string;
  updated?: string;
  children: React.ReactNode;
}

const LegalLayout = ({ title, updated = "Abril 2026", children }: LegalLayoutProps) => {
  return (
    <main className="min-h-screen bg-background">
      <div className="container max-w-3xl pt-20 pb-16">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-smooth mb-10"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Link>

        <header className="mb-10">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3">Legal</p>
          <h1 className="font-serif text-4xl md:text-5xl text-balance mb-3">{title}</h1>
          <p className="text-sm text-muted-foreground">Última atualização: {updated}</p>
        </header>

        <article className="prose-legal text-foreground/90 space-y-6 leading-relaxed">
          {children}
        </article>
      </div>
      <Footer />
    </main>
  );
};

export default LegalLayout;

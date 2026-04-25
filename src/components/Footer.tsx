import { Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import Disclaimer from "./Disclaimer";

const Footer = () => {
  return (
    <footer className="py-12 border-t border-border/60">
      <div className="container max-w-5xl">
        <div className="mb-8">
          <Disclaimer variant="compact" />
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <span className="font-serif text-xl tracking-tight">Ponto Cego</span>
          </div>
          <p className="text-xs text-muted-foreground text-center">
            © {new Date().getFullYear()} Ponto Cego · Ver com mais clareza por dentro
          </p>
          <div className="flex gap-6 text-xs text-muted-foreground">
            <Link to="/legal/termos" className="hover:text-foreground transition-smooth">
              Termos
            </Link>
            <Link to="/legal/privacidade" className="hover:text-foreground transition-smooth">
              Privacidade
            </Link>
            <Link to="/legal/reembolsos" className="hover:text-foreground transition-smooth">
              Reembolsos
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

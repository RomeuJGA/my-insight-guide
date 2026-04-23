import { Sparkles } from "lucide-react";

const Footer = () => {
  return (
    <footer className="py-12 border-t border-border/60">
      <div className="container">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-gradient-primary flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-primary-foreground" />
            </div>
            <span className="font-serif text-lg">Lumen</span>
          </div>
          <p className="text-xs text-muted-foreground text-center">
            © {new Date().getFullYear()} Lumen · Ferramenta de reflexão pessoal
          </p>
          <div className="flex gap-6 text-xs text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-smooth">Termos</a>
            <a href="#" className="hover:text-foreground transition-smooth">Privacidade</a>
            <a href="#" className="hover:text-foreground transition-smooth">Contacto</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

import { Sparkles } from "lucide-react";

const Navbar = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/70 backdrop-blur-xl border-b border-border/40">
      <nav className="container flex items-center justify-between h-16">
        <a href="#" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center shadow-soft">
            <Sparkles className="w-4 h-4 text-primary-foreground" strokeWidth={2} />
          </div>
          <span className="font-serif text-xl tracking-tight">Lumen</span>
        </a>
        <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
          <a href="#how" className="hover:text-foreground transition-smooth">Como funciona</a>
          <a href="#preview" className="hover:text-foreground transition-smooth">Experiência</a>
          <a href="#pricing" className="hover:text-foreground transition-smooth">Preços</a>
        </div>
        <a
          href="#experience"
          className="text-sm font-medium px-4 py-2 rounded-full bg-primary text-primary-foreground hover:opacity-90 transition-smooth shadow-soft"
        >
          Começar
        </a>
      </nav>
    </header>
  );
};

export default Navbar;

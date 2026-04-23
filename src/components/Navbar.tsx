import { Sparkles, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Navbar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Sessão terminada.");
  };

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
        {user ? (
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline text-xs text-muted-foreground truncate max-w-[140px]">
              {user.email}
            </span>
            <button
              onClick={handleSignOut}
              className="inline-flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-full border border-border hover:bg-muted transition-smooth"
            >
              <LogOut className="w-4 h-4" />
              Sair
            </button>
          </div>
        ) : (
          <Link
            to="/auth"
            className="text-sm font-medium px-4 py-2 rounded-full bg-primary text-primary-foreground hover:opacity-90 transition-smooth shadow-soft"
          >
            Entrar
          </Link>
        )}
      </nav>
    </header>
  );
};

export default Navbar;

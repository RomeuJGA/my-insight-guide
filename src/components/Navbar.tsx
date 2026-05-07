import { LogOut, Shield, Coins, BookMarked } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { useCredits } from "@/hooks/useCredits";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import logo from "@/assets/logo-umavatar.png";

const Navbar = () => {
  const { user } = useAuth();
  const { isAdmin } = useIsAdmin();
  const { credits, loading: creditsLoading } = useCredits();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Sessão terminada.");
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/70 backdrop-blur-xl border-b border-border/40">
      <nav className="container flex items-center justify-between h-16">
        <a href="/" className="flex items-center group" aria-label="Um Ävatar">
          <img src={logo} alt="Um Ävatar" className="h-7 md:h-8 w-auto" />
        </a>
        <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
          <a href="/#how" className="hover:text-foreground transition-smooth">Como funciona</a>
          <a href="/#preview" className="hover:text-foreground transition-smooth">Experiência</a>
          <a href="/#pricing" className="hover:text-foreground transition-smooth">Preços</a>
          <a href="/sobre" className="hover:text-foreground transition-smooth">Sobre</a>
        </div>
        {user ? (
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/credits"
              title="Histórico de créditos"
              className="inline-flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-full border border-primary/30 bg-primary/5 text-primary hover:bg-primary/10 transition-smooth"
            >
              <Coins className="w-4 h-4" />
              <span className="tabular-nums">
                {creditsLoading || credits === null ? "—" : credits}
              </span>
              <span className="hidden sm:inline">créditos</span>
            </Link>
            <Link
              to="/my-messages"
              title="As minhas mensagens"
              className="inline-flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-full border border-border hover:bg-muted transition-smooth"
            >
              <BookMarked className="w-4 h-4" />
              <span className="hidden sm:inline">Mensagens</span>
            </Link>
            {isAdmin && (
              <Link
                to="/admin"
                className="inline-flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-full border border-border hover:bg-muted transition-smooth"
              >
                <Shield className="w-4 h-4" />
                <span className="hidden sm:inline">Admin</span>
              </Link>
            )}
            <button
              onClick={handleSignOut}
              title="Sair"
              className="inline-flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-full border border-border hover:bg-muted transition-smooth"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sair</span>
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

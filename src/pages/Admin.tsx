import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import {
  AlertTriangle, Loader2,
  ShoppingCart, Package, Ticket, Users, Coins, BarChart2,
  Star, ArrowLeft, MessageSquare, Mail,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import AdminCredits from "@/components/AdminCredits";
import AdminUsers from "@/components/AdminUsers";
import AdminAnalytics from "@/components/AdminAnalytics";
import AdminPackages from "@/components/AdminPackages";
import AdminCoupons from "@/components/AdminCoupons";
import AdminTestimonials from "@/components/AdminTestimonials";
import AdminOrders from "@/components/AdminOrders";
import AdminMessages from "@/components/AdminMessages";
import AdminContacts from "@/components/AdminContacts";
import Footer from "@/components/Footer";

const Admin = () => {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: roleLoading } = useIsAdmin();
  const [active, setActive] = useState("encomendas");

  const sections = [
    { id: "encomendas",   label: "Encomendas",   Icon: ShoppingCart },
    { id: "utilizadores", label: "Utilizadores",  Icon: Users },
    { id: "creditos",     label: "Créditos",      Icon: Coins },
    { id: "packs",        label: "Packs",         Icon: Package },
    { id: "cupoes",       label: "Cupões",        Icon: Ticket },
    { id: "analytics",   label: "Analytics",     Icon: BarChart2 },
    { id: "testemunhos",  label: "Testemunhos",   Icon: Star },
    { id: "mensagens",    label: "Mensagens",     Icon: MessageSquare },
    { id: "contactos",    label: "Contactos",     Icon: Mail },
  ] as const;

  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="max-w-md text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-destructive/10 text-destructive mx-auto flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h1 className="font-serif text-2xl">Acesso restrito</h1>
            <p className="text-muted-foreground text-sm">
              Esta área é apenas para administradores.
            </p>
            <Link
              to="/"
              className="inline-block text-sm font-medium px-4 py-2 rounded-full bg-primary text-primary-foreground hover:opacity-90 transition-smooth"
            >
              Voltar ao início
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const activeLabel = sections.find((s) => s.id === active)?.label ?? "";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar */}
      <header className="fixed top-0 left-0 right-0 z-40 h-14 border-b border-border/60 bg-background/95 backdrop-blur flex items-center px-4 gap-4">
        <span className="font-serif text-lg text-primary tracking-tight">Ä</span>
        <span className="text-xs uppercase tracking-widest text-muted-foreground">Admin</span>
        <span className="text-border/60 select-none">·</span>
        <span className="text-sm font-medium">{activeLabel}</span>
        <Link
          to="/"
          className="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-smooth"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Sair
        </Link>
      </header>

      <div className="flex flex-1 pt-14">
        {/* Sidebar — desktop */}
        <aside className="hidden md:flex flex-col w-48 shrink-0 border-r border-border/60 fixed left-0 top-14 h-[calc(100vh-3.5rem)] overflow-y-auto py-4 px-2">
          <nav className="flex flex-col gap-0.5">
            {sections.map(({ id, label, Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setActive(id)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-left transition-smooth ${
                  active === id
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Mobile tab strip */}
        <div className="md:hidden fixed top-14 left-0 right-0 z-30 bg-background border-b border-border/60 overflow-x-auto">
          <div className="flex gap-1 px-3 py-2 min-w-max">
            {sections.map(({ id, label, Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setActive(id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs whitespace-nowrap transition-smooth ${
                  active === id
                    ? "bg-primary text-primary-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <main className="flex-1 md:ml-48 px-6 py-8 md:py-10 mt-10 md:mt-0 min-h-[calc(100vh-3.5rem)] max-w-4xl">
          {active === "encomendas"   && <AdminOrders />}
          {active === "utilizadores" && <AdminUsers />}
          {active === "creditos"     && <AdminCredits />}
          {active === "packs"        && <AdminPackages />}
          {active === "cupoes"       && <AdminCoupons />}
          {active === "analytics"    && <AdminAnalytics />}
          {active === "testemunhos"  && <AdminTestimonials />}
          {active === "mensagens"    && <AdminMessages />}
          {active === "contactos"    && <AdminContacts />}
        </main>
      </div>
    </div>
  );
};

export default Admin;

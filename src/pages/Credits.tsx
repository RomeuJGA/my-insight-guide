import { useEffect, useRef, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { Coins, Loader2, ArrowDownCircle, ArrowUpCircle, Gift, ShoppingCart, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useCredits } from "@/hooks/useCredits";
import Paywall from "@/components/Paywall";
import Footer from "@/components/Footer";

type Tx = {
  id: string;
  type: "purchase" | "usage" | "admin" | "welcome";
  amount: number;
  description: string | null;
  created_at: string;
};

const typeMeta: Record<Tx["type"], { label: string; Icon: typeof Coins }> = {
  purchase: { label: "Compra", Icon: ShoppingCart },
  usage: { label: "Uso", Icon: ArrowDownCircle },
  admin: { label: "Ajuste admin", Icon: Shield },
  welcome: { label: "Boas-vindas", Icon: Gift },
};

const Credits = () => {
  const { user, loading: authLoading } = useAuth();
  const { credits, loading: creditsLoading, setLocal } = useCredits();
  const [txs, setTxs] = useState<Tx[]>([]);
  const [loadingTxs, setLoadingTxs] = useState(true);
  const [showPaywall, setShowPaywall] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const paywallRef = useRef<HTMLDivElement | null>(null);

  // Auto-open paywall when arriving with ?buy=1
  useEffect(() => {
    if (!user) return;
    const params = new URLSearchParams(location.search);
    if (params.get("buy") === "1") {
      setShowPaywall(true);
      // Clean the URL so refresh doesn't re-trigger
      navigate("/credits", { replace: true });
      // Smooth scroll to paywall after it mounts
      setTimeout(() => {
        paywallRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 80);
    }
  }, [user, location.search, navigate]);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    setLoadingTxs(true);
    supabase
      .from("credit_transactions")
      .select("id, type, amount, description, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10)
      .then(({ data }) => {
        if (!cancelled) {
          setTxs((data as Tx[]) ?? []);
          setLoadingTxs(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [user, credits]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }
  if (!user) {
    const buy = new URLSearchParams(location.search).get("buy");
    return <Navigate to={buy === "1" ? "/auth" : "/auth"} replace state={{ from: `/credits${buy === "1" ? "?buy=1" : ""}` }} />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 pt-24 pb-16 px-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">Os seus créditos</p>
          <h1 className="font-serif text-3xl md:text-4xl tracking-tight">Saldo e histórico</h1>
        </div>

        <div className="rounded-3xl bg-gradient-message border border-border/60 p-8 mb-8 shadow-elegant flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Saldo atual</p>
            <p className="font-serif text-5xl text-primary tabular-nums">
              {creditsLoading || credits === null ? "—" : credits}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              crédito{credits === 1 ? "" : "s"} disponíveis
            </p>
          </div>
          <button
            onClick={() => setShowPaywall((s) => !s)}
            className="inline-flex items-center gap-1.5 text-sm font-medium px-5 py-2.5 rounded-full bg-primary text-primary-foreground shadow-soft hover:opacity-90 transition-smooth"
          >
            <Coins className="w-4 h-4" />
            {showPaywall ? "Fechar" : "Comprar"}
          </button>
        </div>

        {showPaywall && (
          <div className="mb-8" ref={paywallRef}>
            <Paywall
              onPurchased={(n) => {
                setLocal(n);
                setShowPaywall(false);
              }}
            />
          </div>
        )}

        <div className="rounded-2xl bg-card border border-border/60 overflow-hidden">
          <div className="px-5 py-3 border-b border-border/60 flex items-center justify-between">
            <h2 className="font-medium text-sm">Últimas 10 transações</h2>
          </div>

          {loadingTxs ? (
            <div className="p-8 flex justify-center">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          ) : txs.length === 0 ? (
            <p className="p-8 text-sm text-muted-foreground text-center">Sem transações ainda.</p>
          ) : (
            <ul className="divide-y divide-border/60">
              {txs.map((t) => {
                const meta = typeMeta[t.type];
                const Icon = meta.Icon;
                const positive = t.amount > 0;
                return (
                  <li key={t.id} className="px-5 py-4 flex items-center gap-4">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                        positive ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{t.description ?? meta.label}</p>
                      <p className="text-xs text-muted-foreground">
                        {meta.label} · {new Date(t.created_at).toLocaleString("pt-PT")}
                      </p>
                    </div>
                    <span
                      className={`font-medium tabular-nums text-sm ${
                        positive ? "text-primary" : "text-foreground/70"
                      }`}
                    >
                      {positive ? "+" : ""}
                      {t.amount}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="mt-8">
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-smooth">
            ← Voltar
          </Link>
        </div>
      </div>
      </div>
      <Footer />
    </div>
  );
};

export default Credits;

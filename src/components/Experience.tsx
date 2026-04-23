import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Quote, Shuffle, Sparkles, History, X, LogIn, Coins } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useCredits } from "@/hooks/useCredits";
import Paywall from "./Paywall";
import { toast } from "sonner";

type HistoryItem = { number: number; message: string; date: string };

const STORAGE_KEY = "lumen-history";
const TOTAL_MESSAGES = 534;

const Experience = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { credits, loading: creditsLoading, setLocal: setLocalCredits, refresh: refreshCredits } = useCredits();
  const [input, setInput] = useState<string>("");
  const [revealed, setRevealed] = useState<{ number: number; message: string } | null>(null);
  const [animating, setAnimating] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setHistory(JSON.parse(raw));
    } catch {}
  }, []);

  const reveal = async (n: number) => {
    if (animating) return;
    if (n < 1 || n > TOTAL_MESSAGES || !Number.isFinite(n)) {
      toast.error(`Escolha um número entre 1 e ${TOTAL_MESSAGES}.`);
      return;
    }
    if (!user) {
      toast.error("Inicie sessão para receber a sua mensagem.");
      navigate("/auth");
      return;
    }
    if ((credits ?? 0) <= 0) {
      setShowPaywall(true);
      return;
    }

    setAnimating(true);
    setRevealed(null);
    try {
      const { data, error } = await supabase.functions.invoke("get-message", {
        body: { id: n },
      });
      if (error) {
        // 402 from edge → no credits
        const msg = (error as any)?.context?.body || error.message || "";
        if (typeof msg === "string" && msg.includes("NO_CREDITS")) {
          setShowPaywall(true);
          return;
        }
        throw error;
      }
      if (!data?.content) throw new Error("Sem conteúdo recebido.");

      if (typeof data.credits === "number") setLocalCredits(data.credits);

      await new Promise((r) => setTimeout(r, 300));

      const item: HistoryItem = { number: n, message: data.content, date: new Date().toISOString() };
      setRevealed({ number: n, message: data.content });
      const next = [item, ...history].slice(0, 20);
      setHistory(next);
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message ?? "Erro ao obter a mensagem.");
      refreshCredits();
    } finally {
      setAnimating(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const n = parseInt(input, 10);
    reveal(n);
  };

  const handleShuffle = () => {
    const n = Math.floor(Math.random() * TOTAL_MESSAGES) + 1;
    setInput(String(n));
    reveal(n);
  };

  const handleReset = () => {
    setRevealed(null);
    setInput("");
  };

  return (
    <section id="experience" className="py-24 md:py-32 bg-gradient-soft">
      <div className="container">
        <div className="max-w-2xl mx-auto text-center mb-12">
          <p className="text-sm font-medium text-primary mb-3 uppercase tracking-wider">Experiência</p>
          <h2 className="font-serif text-3xl md:text-5xl text-balance mb-4">
            Escolha o seu número
          </h2>
          <p className="text-muted-foreground">
            Pause por um momento. Pense numa questão. Escolha o número que sentir.
          </p>
        </div>

        <div className="max-w-xl mx-auto">
          {!user && !authLoading && (
            <div className="mb-6 p-5 rounded-2xl bg-card border border-border/60 text-center">
              <p className="text-sm text-muted-foreground mb-3">
                Para receber a sua mensagem, inicie sessão.
              </p>
              <button
                onClick={() => navigate("/auth")}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-smooth"
              >
                <LogIn className="w-4 h-4" />
                Entrar / Criar conta
              </button>
            </div>
          )}

          {user && !creditsLoading && credits !== null && (
            <div className="mb-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Coins className="w-4 h-4 text-primary" />
              <span>
                Saldo: <strong className="text-foreground tabular-nums">{credits}</strong> crédito{credits === 1 ? "" : "s"}
              </span>
            </div>
          )}

          {showPaywall ? (
            <Paywall
              onPurchased={(newBalance) => {
                setLocalCredits(newBalance);
                setShowPaywall(false);
                toast.success("Saldo atualizado. Boa exploração.");
              }}
            />
          ) : !revealed ? (
            <form onSubmit={handleSubmit} className="p-8 md:p-10 rounded-3xl bg-card border border-border/60 shadow-elegant animate-fade-in-up">
              <label htmlFor="number" className="block text-sm font-medium text-foreground/80 mb-3">
                Número entre 1 e {TOTAL_MESSAGES}
              </label>
              <div className="flex gap-3">
                <input
                  id="number"
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={TOTAL_MESSAGES}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="ex.: 237"
                  className="flex-1 px-5 py-4 rounded-2xl border border-input bg-background font-serif text-2xl focus:outline-none focus:ring-2 focus:ring-ring/40 transition-smooth"
                />
                <button
                  type="button"
                  onClick={handleShuffle}
                  disabled={animating}
                  title="Escolher aleatoriamente"
                  className="px-4 py-4 rounded-2xl bg-secondary text-secondary-foreground hover:bg-accent transition-smooth disabled:opacity-60"
                >
                  <Shuffle className="w-5 h-5" />
                </button>
              </div>

              <button
                type="submit"
                disabled={animating}
                className="mt-5 w-full inline-flex items-center justify-center gap-2 py-4 rounded-2xl bg-primary text-primary-foreground font-medium shadow-soft hover:shadow-elegant transition-smooth disabled:opacity-60"
              >
                <Sparkles className="w-4 h-4" />
                {animating ? "A revelar…" : "Receber a minha mensagem"}
              </button>

              <button
                type="button"
                onClick={() => setShowHistory((s) => !s)}
                className="mt-5 w-full inline-flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-smooth"
              >
                <History className="w-4 h-4" />
                {showHistory ? "Ocultar histórico" : `Histórico (${history.length})`}
              </button>

              {showHistory && history.length > 0 && (
                <div className="mt-5 space-y-2 max-h-64 overflow-y-auto pr-1">
                  {history.map((h, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => reveal(h.number)}
                      className="w-full text-left p-3 rounded-xl bg-muted/60 hover:bg-muted transition-smooth flex items-center gap-3"
                    >
                      <span className="font-serif text-lg text-primary w-10 shrink-0">{h.number}</span>
                      <span className="text-sm text-muted-foreground line-clamp-1">{h.message}</span>
                    </button>
                  ))}
                </div>
              )}
              {showHistory && history.length === 0 && (
                <p className="mt-4 text-sm text-muted-foreground text-center">Ainda sem mensagens guardadas.</p>
              )}
            </form>
          ) : (
            <div className="relative animate-scale-in">
              <button
                onClick={handleReset}
                className="absolute -top-3 -right-3 z-10 w-9 h-9 rounded-full bg-card border border-border shadow-soft flex items-center justify-center hover:bg-muted transition-smooth"
                aria-label="Fechar"
              >
                <X className="w-4 h-4" />
              </button>

              <article className="p-10 md:p-14 rounded-3xl bg-gradient-message border border-border/60 shadow-elegant">
                <div className="flex items-center justify-between mb-8">
                  <span className="font-serif text-5xl text-primary">{revealed.number}</span>
                  <Quote className="w-7 h-7 text-primary/40" strokeWidth={1.5} />
                </div>
                <p className="font-serif text-xl md:text-2xl leading-relaxed text-foreground/90">
                  "{revealed.message}"
                </p>
                <div className="mt-10 pt-6 border-t border-border/60 flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleReset}
                    className="flex-1 py-3 rounded-full bg-card border border-border hover:bg-muted transition-smooth text-sm font-medium"
                  >
                    Escolher outro número
                  </button>
                  <button
                    onClick={() => {
                      const n = Math.floor(Math.random() * TOTAL_MESSAGES) + 1;
                      reveal(n);
                    }}
                    disabled={animating}
                    className="flex-1 inline-flex items-center justify-center gap-2 py-3 rounded-full bg-primary text-primary-foreground hover:opacity-90 transition-smooth text-sm font-medium disabled:opacity-60"
                  >
                    <Shuffle className="w-4 h-4" />
                    Mensagem aleatória
                  </button>
                </div>
              </article>
            </div>
          )}

          <p className="text-center text-xs text-muted-foreground mt-6">
            As mensagens estão guardadas de forma privada e segura. Cada pedido devolve apenas a sua mensagem.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Experience;

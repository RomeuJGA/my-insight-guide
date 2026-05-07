import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Quote, Shuffle, Sparkles, X, LogIn, Coins, MailCheck, BookMarked, PenLine, ChevronDown, Lock } from "lucide-react";
import Disclaimer from "./Disclaimer";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useCredits } from "@/hooks/useCredits";
import { useWelcomeCredit } from "@/hooks/useWelcomeCredit";
import Paywall from "./Paywall";
import ReflectionGuide from "./ReflectionGuide";
import { useAnalytics } from "@/hooks/useAnalytics";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/errors";
import { TOTAL_MESSAGES } from "@/lib/constants";

const Experience = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading: authLoading } = useAuth();
  const { credits, loading: creditsLoading, setLocal: setLocalCredits, refresh: refreshCredits } = useCredits();
  const [input, setInput] = useState<string>("");
  const [question, setQuestion] = useState("");
  const [questionOpen, setQuestionOpen] = useState(false);
  const [revealed, setRevealed] = useState<{ number: number; message: string; alreadyRevealed?: boolean; question?: string } | null>(null);
  const [animating, setAnimating] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [confirmRepeat, setConfirmRepeat] = useState<number | null>(null);
  const pendingRevealRef = useRef<number | null>(null);
  const { track } = useAnalytics();

  // Auto-grant welcome credit if email verified
  useWelcomeCredit((newBalance) => setLocalCredits(newBalance));

  // If arriving from Auth with a pending number (user was redirected mid-reveal), pre-fill and auto-reveal
  useEffect(() => {
    const state = location.state as { pendingNumber?: number } | null;
    const n = state?.pendingNumber;
    if (!n || !user || authLoading) return;
    setInput(String(n));
    // Clear the state so a page refresh doesn't re-trigger
    navigate(location.pathname + location.hash, { replace: true, state: null });
    setTimeout(() => reveal(n), 300);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading]);

  const emailUnverified = !!user && !user.email_confirmed_at;

  const reveal = async (n: number, force = false) => {
    if (animating) return;
    track("reveal_attempt", { metadata: { number: n, has_user: !!user } });
    if (!Number.isInteger(n) || n < 1 || n > TOTAL_MESSAGES) {
      toast.error(`Escolha um número entre 1 e ${TOTAL_MESSAGES}.`);
      return;
    }
    if (!user) {
      toast.error("Inicie sessão para receber a sua mensagem.");
      navigate("/auth", { state: { pendingNumber: n } });
      return;
    }
    if (emailUnverified) {
      toast.error("Confirme o seu email para continuar.");
      navigate("/auth");
      return;
    }
    if ((credits ?? 0) <= 0) {
      track("paywall_view", { metadata: { trigger: "no_credits_pre" } });
      pendingRevealRef.current = n;
      setShowPaywall(true);
      return;
    }

    setAnimating(true);
    setRevealed(null);
    try {
      const { data, error } = await supabase.functions.invoke("get-message", {
        body: { id: n, force },
      });
      if (error) {
        const ctxBody = (error as { context?: { body?: unknown } })?.context?.body;
        const msg = typeof ctxBody === "string" ? ctxBody : (error.message ?? "");
        if (msg.includes("NO_CREDITS")) {
          track("paywall_view", { metadata: { trigger: "no_credits_server" } });
          pendingRevealRef.current = n;
          setShowPaywall(true);
          return;
        }
        throw error;
      }

      // Server signals message was previously revealed — ask for confirmation
      if (data?.code === "ALREADY_REVEALED") {
        if (typeof data.credits === "number") setLocalCredits(data.credits);
        setConfirmRepeat(n);
        return;
      }

      if (!data?.content) throw new Error("Sem conteúdo recebido.");

      if (typeof data.credits === "number") setLocalCredits(data.credits);

      await new Promise((r) => setTimeout(r, 300));

      const trimmedQuestion = question.trim();
      setRevealed({
        number: n,
        message: data.content,
        alreadyRevealed: data.alreadyRevealed === true,
        question: trimmedQuestion || undefined,
      });

      // Persist question privately — fire-and-forget, non-blocking
      if (trimmedQuestion) {
        supabase
          .from("message_reveals")
          .update({ question: trimmedQuestion })
          .eq("user_id", user.id)
          .eq("message_id", n)
          .then(({ error: qErr }) => {
            if (qErr) console.error("Failed to save question:", qErr);
          });
      }
    } catch (err: unknown) {
      console.error(err);
      toast.error(getErrorMessage(err) || "Erro ao obter a mensagem.");
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
    setConfirmRepeat(null);
    setInput("");
    setQuestion("");
    setQuestionOpen(false);
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

          {emailUnverified && (
            <div className="mb-6 p-5 rounded-2xl bg-primary/5 border border-primary/30 text-center">
              <MailCheck className="w-6 h-6 text-primary mx-auto mb-2" />
              <p className="text-sm text-foreground mb-3">
                Confirme o seu email para receber o seu crédito gratuito.
              </p>
              <button
                onClick={() => navigate("/auth")}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-smooth"
              >
                Reenviar email de confirmação
              </button>
            </div>
          )}

          {user && !creditsLoading && credits !== null && !emailUnverified && (
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
                const pending = pendingRevealRef.current;
                pendingRevealRef.current = null;
                if (pending !== null) {
                  toast.success("Créditos adicionados! A revelar a sua mensagem…");
                  setTimeout(() => reveal(pending), 400);
                } else {
                  toast.success("Saldo atualizado. Boa exploração.");
                }
              }}
            />
          ) : confirmRepeat !== null ? (
            <div className="p-8 md:p-10 rounded-3xl bg-card border border-amber-200 shadow-elegant animate-fade-in-up text-center space-y-5">
              <p className="text-sm font-medium text-amber-700">
                Já revelou a mensagem {confirmRepeat} anteriormente.
              </p>
              <p className="text-sm text-muted-foreground">
                Revelar novamente gasta <strong>1 crédito</strong>. A mensagem ficará guardada no seu histórico com a questão que escreveu.
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  type="button"
                  onClick={() => setConfirmRepeat(null)}
                  className="px-5 py-2.5 rounded-full border border-border text-sm font-medium hover:bg-muted transition-smooth"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const n = confirmRepeat;
                    setConfirmRepeat(null);
                    reveal(n, true);
                  }}
                  className="px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-smooth"
                >
                  Revelar mesmo assim
                </button>
              </div>
            </div>
          ) : !revealed ? (
            <form onSubmit={handleSubmit} className="p-8 md:p-10 rounded-3xl bg-card border border-border/60 shadow-elegant animate-fade-in-up">
              {/* Optional question field */}
              <div className="mb-7">
                <button
                  type="button"
                  onClick={() => setQuestionOpen(!questionOpen)}
                  className="w-full flex items-center justify-between text-sm text-muted-foreground hover:text-foreground transition-smooth group"
                >
                  <span className="flex items-center gap-2">
                    <PenLine className="w-4 h-4" />
                    Formule a sua questão <span className="text-xs opacity-60">(opcional)</span>
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-200 ${questionOpen ? "rotate-180" : ""}`}
                  />
                </button>
                {questionOpen && (
                  <div className="mt-3 animate-fade-in">
                    <textarea
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      placeholder="Escreva a pergunta ou tema que quer ver respondido. Ficará guardado com a mensagem, para consultar mais tarde."
                      rows={3}
                      maxLength={500}
                      className="w-full px-4 py-3 rounded-2xl border border-input bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring/40 transition-smooth leading-relaxed"
                    />
                    <p className="mt-1.5 text-xs text-muted-foreground flex items-center gap-1.5">
                      <Lock className="w-3 h-3 shrink-0" />
                      Guardado apenas para si. Nenhum colaborador ou administrador consegue consultar as suas questões através desta plataforma.
                    </p>
                  </div>
                )}
              </div>

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

              {user && !emailUnverified && (
                <Link
                  to="/my-messages"
                  className="mt-5 w-full inline-flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-smooth"
                >
                  <BookMarked className="w-4 h-4" />
                  Ver as minhas mensagens reveladas
                </Link>
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
                {revealed.question && (
                  <div className="mb-7 pb-7 border-b border-border/60">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <PenLine className="w-3 h-3" />
                      A sua questão
                    </p>
                    <p className="text-sm text-foreground/80 italic leading-relaxed">
                      "{revealed.question}"
                    </p>
                  </div>
                )}
                <p className="font-serif text-xl md:text-2xl leading-relaxed text-foreground/90">
                  "{revealed.message}"
                </p>
                {revealed.alreadyRevealed && (
                  <p className="mt-6 text-xs text-muted-foreground italic">
                    Mensagem já revelada anteriormente — não foi consumido crédito.
                  </p>
                )}
                <Disclaimer variant="inline" className="mt-6" />
                <ReflectionGuide seed={revealed.number} questionCount={3} />
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

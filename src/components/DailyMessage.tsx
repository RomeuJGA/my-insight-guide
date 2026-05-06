import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Sun, Sparkles, Quote, Loader2, LogIn, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/errors";
import Disclaimer from "./Disclaimer";
import ReflectionGuide from "./ReflectionGuide";

const STORAGE_KEY = "lumen-daily-revealed";

const DailyMessage = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [content, setContent] = useState<string | null>(null);
  const [shownDate, setShownDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [autoRevealed, setAutoRevealed] = useState(false);

  // If user already opened the daily message today, auto-show it without
  // user action — the server is the source of truth, this is just UX polish.
  useEffect(() => {
    if (authLoading || !user) return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as { date: string; userId: string };
      const today = new Date().toISOString().slice(0, 10);
      if (parsed.userId === user.id && parsed.date === today && !autoRevealed) {
        setAutoRevealed(true);
        void reveal(true);
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading]);

  const reveal = async (silent = false) => {
    if (!user) {
      toast.error("Inicie sessão para receber a mensagem do dia.");
      navigate("/auth");
      return;
    }
    if (loading) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("get-daily-message");
      if (error) throw error;
      if (!data?.content) throw new Error("Sem conteúdo recebido.");
      setContent(data.content);
      setShownDate(data.shownDate ?? null);
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ date: new Date().toISOString().slice(0, 10), userId: user.id }),
        );
      } catch {}
    } catch (err: unknown) {
      if (!silent) toast.error(getErrorMessage(err) || "Erro ao obter a mensagem do dia.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="daily" className="py-20 md:py-28 bg-background">
      <div className="container">
        <div className="max-w-2xl mx-auto text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium uppercase tracking-wider mb-4">
            <Sun className="w-3.5 h-3.5" />
            Gratuito
          </div>
          <h2 className="font-serif text-3xl md:text-5xl text-balance mb-3">
            Mensagem do Dia
          </h2>
          <p className="text-muted-foreground">
            Receba uma inspiração gratuita para o seu dia.
          </p>
        </div>

        <div className="max-w-xl mx-auto">
          {!user && !authLoading ? (
            <div className="p-8 rounded-3xl bg-card border border-border/60 shadow-elegant text-center">
              <p className="text-sm text-muted-foreground mb-5">
                Inicie sessão para receber a sua mensagem do dia gratuita.
              </p>
              <button
                onClick={() => navigate("/auth")}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-smooth"
              >
                <LogIn className="w-4 h-4" />
                Entrar / Criar conta
              </button>
            </div>
          ) : !content ? (
            <div className="p-10 md:p-12 rounded-3xl bg-card border border-border/60 shadow-elegant text-center animate-fade-in-up">
              <div className="w-14 h-14 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-5">
                <Sun className="w-6 h-6 text-primary" strokeWidth={1.5} />
              </div>
              <p className="text-sm text-muted-foreground mb-6">
                Uma mensagem aleatória, escolhida para si, válida por hoje.
              </p>
              <button
                onClick={() => reveal()}
                disabled={loading}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground font-medium shadow-soft hover:shadow-elegant transition-smooth disabled:opacity-60"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                Revelar mensagem do dia
              </button>
            </div>
          ) : (
            <article className="p-10 md:p-14 rounded-3xl bg-gradient-message border border-border/60 shadow-elegant animate-scale-in">
              <div className="flex items-center justify-between mb-8">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[11px] font-medium uppercase tracking-wider">
                  <Sun className="w-3 h-3" />
                  Disponível gratuitamente hoje
                </span>
                <Quote className="w-7 h-7 text-primary/40" strokeWidth={1.5} />
              </div>
              <p className="font-serif text-xl md:text-2xl leading-relaxed text-foreground/90">
                "{content}"
              </p>
              <Disclaimer variant="inline" className="mt-6" />
              <ReflectionGuide seed={shownDate ?? content ?? "daily"} questionCount={3} />
              <p className="mt-6 pt-6 border-t border-border/60 text-xs text-muted-foreground">
                Volte amanhã para uma nova mensagem aleatória.
              </p>
            </article>
          )}

          {/* Bridge: only after message revealed */}
          {content && (
            <div className="mt-6 p-6 rounded-2xl bg-card border border-primary/20 shadow-soft">
              <p className="font-medium text-sm text-foreground mb-1">
                Há um número que sente chamar?
              </p>
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                A sua mensagem de hoje foi aleatória. Use 1 crédito para escolher o número que sentir — e receber a mensagem que lhe pertence.
              </p>
              <Link
                to="/#experience"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-smooth shadow-soft"
              >
                Escolher o meu número
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default DailyMessage;

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Quote, Sparkles, History, PenLine, NotebookPen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Disclaimer from "@/components/Disclaimer";
import ReflectionGuide from "@/components/ReflectionGuide";
import TestimonialForm from "@/components/TestimonialForm";
import { Skeleton } from "@/components/ui/skeleton";

type Reveal = { messageId: number; revealedAt: string; content: string; question?: string | null; notes?: string | null };

const MyMessages = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [items, setItems] = useState<Reveal[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<Reveal | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate("/auth");
      return;
    }
    (async () => {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke("list-reveals");
      if (error) {
        toast.error("Não foi possível carregar o histórico.");
      } else {
        setItems(data?.items ?? []);
      }
      setLoading(false);
    })();
  }, [user, authLoading, navigate]);

  const fmt = (iso: string) =>
    new Date(iso).toLocaleString("pt-PT", { dateStyle: "medium", timeStyle: "short" });

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <section className="pt-28 pb-20">
        <div className="container max-w-3xl">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-smooth mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Link>

          <header className="mb-10">
            <p className="text-sm font-medium text-primary uppercase tracking-wider mb-3">
              Histórico
            </p>
            <h1 className="font-serif text-3xl md:text-5xl mb-3">As minhas mensagens</h1>
            <p className="text-muted-foreground">
              Pode reabrir qualquer mensagem revelada anteriormente sem gastar créditos.
            </p>
          </header>

          {loading ? (
            <ul className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <li key={i} className="p-5 rounded-2xl bg-card border border-border/60 flex items-center gap-4">
                  <Skeleton className="w-14 h-10 rounded-lg shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-3.5 w-3/4" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-8 w-24 rounded-full shrink-0" />
                </li>
              ))}
            </ul>
          ) : items.length === 0 ? (
            <div className="text-center py-20 rounded-3xl bg-card border border-border/60">
              <History className="w-10 h-10 mx-auto text-muted-foreground/60 mb-4" />
              <p className="text-muted-foreground mb-6">Ainda não revelou nenhuma mensagem.</p>
              <Link
                to="/#experience"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-smooth"
              >
                <Sparkles className="w-4 h-4" />
                Receber primeira mensagem
              </Link>
            </div>
          ) : active ? (
            <div className="animate-fade-in-up">
              <button
                type="button"
                onClick={() => setActive(null)}
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-smooth mb-4"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar à lista
              </button>

              <article className="p-10 md:p-14 rounded-3xl bg-gradient-message border border-border/60 shadow-elegant">
                <div className="flex items-center justify-between mb-8">
                  <span className="font-serif text-5xl text-primary">{active.messageId}</span>
                  <Quote className="w-7 h-7 text-primary/40" strokeWidth={1.5} />
                </div>
                {active.question && (
                  <div className="mb-7 pb-7 border-b border-border/60">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <PenLine className="w-3 h-3" />
                      A sua questão
                    </p>
                    <p className="text-sm text-foreground/80 italic leading-relaxed">
                      "{active.question}"
                    </p>
                  </div>
                )}
                <p className="font-serif text-xl md:text-2xl leading-relaxed text-foreground/90">
                  "{active.content}"
                </p>
                <Disclaimer variant="inline" className="mt-6" />
                <p className="mt-6 pt-6 border-t border-border/60 text-xs text-muted-foreground">
                  Revelada a {fmt(active.revealedAt)}
                </p>
              </article>
              <ReflectionGuide seed={active.messageId} questionCount={3} />
              {active.notes && (
                <div className="mt-4 p-8 rounded-2xl bg-card border border-border/60">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <NotebookPen className="w-3 h-3" />
                    O que ficou consigo
                  </p>
                  <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">{active.notes}</p>
                </div>
              )}
            </div>
          ) : (
            <ul className="space-y-3">
              {items.map((it) => (
                <li
                  key={it.messageId}
                  className="p-5 rounded-2xl bg-card border border-border/60 hover:border-border transition-smooth flex items-center gap-4"
                >
                  <span className="font-serif text-3xl text-primary w-14 shrink-0 text-center tabular-nums">
                    {it.messageId}
                  </span>
                  <div className="min-w-0 flex-1">
                    {it.question && (
                      <p className="text-xs text-muted-foreground italic line-clamp-1 mb-1 flex items-center gap-1">
                        <PenLine className="w-3 h-3 shrink-0" />
                        {it.question}
                      </p>
                    )}
                    <p className="text-sm text-foreground line-clamp-2 mb-1">{it.content}</p>
                    <p className="text-xs text-muted-foreground">{fmt(it.revealedAt)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActive(it)}
                    className="shrink-0 px-4 py-2 rounded-full bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 transition-smooth"
                  >
                    Ver novamente
                  </button>
                </li>
              ))}
            </ul>
          )}
          {/* Testimonial form — only show when list is visible and has items */}
          {!loading && items.length > 0 && !active && (
            <div className="mt-12 pt-8 border-t border-border/60">
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">
                A tua opinião
              </p>
              <TestimonialForm />
            </div>
          )}
        </div>
      </section>
      <Footer />
    </main>
  );
};

export default MyMessages;

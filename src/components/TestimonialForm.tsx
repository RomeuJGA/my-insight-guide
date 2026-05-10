import { useState } from "react";
import { Star, Send, CheckCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const MAX_QUOTE = 350;

const TestimonialForm = () => {
  const { user } = useAuth();
  const defaultName = (user?.user_metadata?.full_name as string | undefined) ?? "";

  const [rating, setRating] = useState(5);
  const [hovered, setHovered] = useState(0);
  const [quote, setQuote] = useState("");
  const [author, setAuthor] = useState(defaultName);
  const [role, setRole] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!user) return null;

  if (submitted) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 flex flex-col items-center gap-3 text-center">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
          <CheckCircle className="w-6 h-6 text-primary" />
        </div>
        <p className="font-medium">Testemunho enviado!</p>
        <p className="text-sm text-muted-foreground">
          Ficará visível no site após aprovação do administrador. Obrigado pelo teu contributo.
        </p>
      </div>
    );
  }

  const handleSubmit = async () => {
    const q = quote.trim();
    const a = author.trim();
    if (!q) return toast.error("Escreve o teu testemunho antes de enviar.");
    if (!a) return toast.error("Indica o teu nome.");
    if (q.length > MAX_QUOTE) return toast.error(`Máximo ${MAX_QUOTE} caracteres.`);

    setSubmitting(true);
    const { error } = await supabase.from("testimonials").insert({
      user_id: user.id,
      quote: q,
      author: a,
      role: role.trim() || null,
      rating,
      display_order: 999,
      active: false,
      status: "pending",
    });
    setSubmitting(false);

    if (error) {
      toast.error("Erro ao enviar testemunho. Tenta novamente.");
      return;
    }
    setSubmitted(true);
  };

  const stars = rating || hovered;

  return (
    <div className="rounded-2xl border border-border bg-card p-6 space-y-5">
      <div>
        <h3 className="font-medium text-base">Partilha a tua experiência</h3>
        <p className="text-sm text-muted-foreground mt-0.5">
          O teu testemunho ficará visível após aprovação.
        </p>
      </div>

      {/* Stars */}
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setRating(n)}
            onMouseEnter={() => setHovered(n)}
            onMouseLeave={() => setHovered(0)}
            className="p-0.5 transition-transform hover:scale-110"
          >
            <Star
              className={`w-6 h-6 transition-colors ${
                n <= stars ? "text-accent fill-accent" : "text-muted-foreground"
              }`}
            />
          </button>
        ))}
        <span className="ml-2 text-sm text-muted-foreground">{stars} / 5</span>
      </div>

      {/* Quote */}
      <div className="space-y-1">
        <textarea
          value={quote}
          onChange={(e) => setQuote(e.target.value)}
          rows={4}
          maxLength={MAX_QUOTE + 20}
          placeholder="Conta como o Ävatar te ajudou…"
          className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm resize-none focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <p className={`text-xs text-right ${quote.length > MAX_QUOTE ? "text-destructive" : "text-muted-foreground"}`}>
          {quote.length} / {MAX_QUOTE}
        </p>
      </div>

      {/* Author + role */}
      <div className="grid sm:grid-cols-2 gap-2">
        <input
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          placeholder="O teu nome (ex.: Mariana S.)"
          className="px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <input
          value={role}
          onChange={(e) => setRole(e.target.value)}
          placeholder="Localização ou profissão (opcional)"
          className="px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={submitting || !quote.trim() || !author.trim() || quote.length > MAX_QUOTE}
        className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
      >
        {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        Enviar testemunho
      </button>
    </div>
  );
};

export default TestimonialForm;

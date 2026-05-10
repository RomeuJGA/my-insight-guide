import { useState } from "react";
import { Mail, Calendar, Send, CheckCircle, Loader2, MessageSquare } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Subject = "general" | "consultation";

const Contact = () => {
  const [subject, setSubject] = useState<Subject>("general");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error("Preencha todos os campos obrigatórios.");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("contact_requests").insert({
      name: name.trim(),
      email: email.trim(),
      subject,
      message: message.trim(),
    });
    setSubmitting(false);

    if (error) {
      toast.error("Erro ao enviar. Tente novamente ou contacte-nos diretamente por email.");
      return;
    }
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <main className="min-h-screen bg-gradient-soft flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center px-4 pt-16">
          <div className="max-w-md w-full text-center space-y-5 py-20">
            <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-primary" />
            </div>
            <h2 className="font-serif text-3xl">Mensagem recebida</h2>
            <p className="text-muted-foreground leading-relaxed">
              {subject === "consultation"
                ? "O seu pedido de consulta foi registado. Entraremos em contacto em breve para confirmar a disponibilidade."
                : "A sua mensagem foi recebida. Responderemos com a maior brevidade possível."}
            </p>
            <a
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-smooth"
            >
              Voltar ao início
            </a>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-soft flex flex-col">
      <Navbar />
      <div className="flex-1 pt-28 pb-20 px-4">
        <div className="max-w-2xl mx-auto">

          {/* Header */}
          <header className="mb-12">
            <p className="text-sm font-medium text-primary uppercase tracking-wider mb-3">Contacto</p>
            <h1 className="font-serif text-4xl md:text-5xl mb-4">Fale connosco</h1>
            <p className="text-muted-foreground leading-relaxed">
              Tem uma questão, sugestão ou deseja marcar uma consulta de orientação? Preencha o formulário e responderemos com brevidade.
            </p>
          </header>

          {/* Subject toggle */}
          <div className="grid grid-cols-2 gap-3 mb-8">
            <button
              type="button"
              onClick={() => setSubject("general")}
              className={`flex items-center gap-2.5 p-4 rounded-2xl border text-left transition-smooth ${
                subject === "general"
                  ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                  : "border-border bg-card hover:bg-muted"
              }`}
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${subject === "general" ? "bg-primary/10" : "bg-muted"}`}>
                <MessageSquare className={`w-4 h-4 ${subject === "general" ? "text-primary" : "text-muted-foreground"}`} />
              </div>
              <div>
                <p className="text-sm font-medium">Mensagem geral</p>
                <p className="text-xs text-muted-foreground">Questões e sugestões</p>
              </div>
            </button>
            <button
              type="button"
              onClick={() => setSubject("consultation")}
              className={`flex items-center gap-2.5 p-4 rounded-2xl border text-left transition-smooth ${
                subject === "consultation"
                  ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                  : "border-border bg-card hover:bg-muted"
              }`}
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${subject === "consultation" ? "bg-primary/10" : "bg-muted"}`}>
                <Calendar className={`w-4 h-4 ${subject === "consultation" ? "text-primary" : "text-muted-foreground"}`} />
              </div>
              <div>
                <p className="text-sm font-medium">Marcar consulta</p>
                <p className="text-xs text-muted-foreground">Sessão de orientação</p>
              </div>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="bg-card border border-border/60 rounded-3xl p-8 md:p-10 shadow-soft space-y-5">

            {subject === "consultation" && (
              <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20 text-sm text-foreground/80 leading-relaxed">
                <strong className="text-foreground">Consulta de orientação</strong> — sessão individual com Mónyca Dell Rey para reflexão e orientação pessoal. Deixe o seu contacto e entraremos em contacto para combinar a data e hora de acordo com a disponibilidade.
              </div>
            )}

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Nome <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="O seu nome"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/40 transition-smooth"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Email <span className="text-destructive">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="O seu email"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/40 transition-smooth"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {subject === "consultation" ? "Mensagem / Motivo da consulta" : "Mensagem"}{" "}
                <span className="text-destructive">*</span>
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={
                  subject === "consultation"
                    ? "Descreva brevemente o que o trouxe aqui e o que espera da sessão…"
                    : "Escreva a sua mensagem…"
                }
                rows={5}
                required
                maxLength={2000}
                className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring/40 transition-smooth leading-relaxed"
              />
              <p className="text-xs text-muted-foreground text-right">{message.length} / 2000</p>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full inline-flex items-center justify-center gap-2 py-4 rounded-2xl bg-primary text-primary-foreground font-medium shadow-soft hover:shadow-elegant transition-smooth disabled:opacity-60"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : subject === "consultation" ? (
                <Calendar className="w-4 h-4" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              {submitting
                ? "A enviar…"
                : subject === "consultation"
                ? "Pedir marcação de consulta"
                : "Enviar mensagem"}
            </button>
          </form>

          {/* Direct contact */}
          <div className="mt-8 flex items-center gap-3 p-5 rounded-2xl bg-card border border-border/60">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Mail className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">Contacto direto</p>
              <a
                href="mailto:geral@umavatar.pt"
                className="text-sm text-muted-foreground hover:text-primary transition-smooth"
              >
                geral@umavatar.pt
              </a>
            </div>
          </div>

        </div>
      </div>
      <Footer />
    </main>
  );
};

export default Contact;

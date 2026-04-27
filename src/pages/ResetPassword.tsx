import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { KeyRound, Loader2, CheckCircle2 } from "lucide-react";
import Footer from "@/components/Footer";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [hasRecoverySession, setHasRecoverySession] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    // Supabase auto-exchanges the recovery token in the URL hash and triggers PASSWORD_RECOVERY.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || (event === "SIGNED_IN" && session)) {
        setHasRecoverySession(true);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setHasRecoverySession(true);
      setReady(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) return toast.error("A palavra-passe deve ter pelo menos 6 caracteres.");
    if (password !== confirm) return toast.error("As palavras-passe não coincidem.");
    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setDone(true);
      toast.success("Palavra-passe atualizada.");
      // After a recovery flow the user is now signed in. Redirect home shortly.
      setTimeout(() => navigate("/", { replace: true }), 1500);
    } catch (err: any) {
      toast.error(err.message ?? "Erro ao atualizar palavra-passe.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-soft flex flex-col">
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <Link to="/" className="block text-center mb-8 font-serif text-3xl tracking-tight text-foreground">
            Ponto Cego
          </Link>
          <div className="p-8 md:p-10 rounded-3xl bg-card border border-border/60 shadow-elegant">
            <div className="w-14 h-14 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-5">
              {done ? (
                <CheckCircle2 className="w-6 h-6 text-primary" />
              ) : (
                <KeyRound className="w-6 h-6 text-primary" />
              )}
            </div>
            <h1 className="font-serif text-2xl md:text-3xl text-center mb-2">
              {done ? "Palavra-passe atualizada" : "Definir nova palavra-passe"}
            </h1>

            {!ready ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            ) : done ? (
              <p className="text-sm text-muted-foreground text-center mt-4">
                A redirecionar…
              </p>
            ) : !hasRecoverySession ? (
              <div className="text-center mt-4 space-y-4">
                <p className="text-sm text-muted-foreground">
                  Esta ligação parece inválida ou expirou. Solicite um novo email de reposição.
                </p>
                <Link
                  to="/auth"
                  className="inline-block text-sm font-medium px-5 py-2.5 rounded-full bg-primary text-primary-foreground hover:opacity-90 transition-smooth"
                >
                  Voltar ao início de sessão
                </Link>
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-4 mt-4">
                <div>
                  <label htmlFor="new-password" className="block text-sm font-medium mb-2">
                    Nova palavra-passe
                  </label>
                  <input
                    id="new-password"
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring/40"
                  />
                </div>
                <div>
                  <label htmlFor="confirm-password" className="block text-sm font-medium mb-2">
                    Confirmar palavra-passe
                  </label>
                  <input
                    id="confirm-password"
                    type="password"
                    required
                    minLength={6}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring/40"
                  />
                </div>
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-2xl bg-primary text-primary-foreground font-medium shadow-soft hover:shadow-elegant transition-smooth disabled:opacity-60"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
                  {saving ? "A guardar…" : "Guardar nova palavra-passe"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
};

export default ResetPassword;

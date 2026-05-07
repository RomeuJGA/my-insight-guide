import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/errors";
import { KeyRound, Loader2, CheckCircle2 } from "lucide-react";
import Footer from "@/components/Footer";
import PasswordField from "@/components/PasswordField";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [hasRecoverySession, setHasRecoverySession] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const waitForSession = async (attempts = 12) => {
      for (let i = 0; i < attempts; i += 1) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) return session;
        await new Promise((resolve) => window.setTimeout(resolve, 250));
      }
      return null;
    };

    const markRecoveryReady = () => {
      if (!cancelled) setHasRecoverySession(true);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || (event === "SIGNED_IN" && session)) {
        markRecoveryReady();
      }
    });

    (async () => {
      let recoveryReady = false;
      let lastError: string | null = null;
      const url = new URL(window.location.href);
      try {
        const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));

        const code = url.searchParams.get("code");
        const tokenHash = url.searchParams.get("token_hash") ?? hash.get("token_hash");
        const type = url.searchParams.get("type") ?? hash.get("type");
        const errorDesc = url.searchParams.get("error_description") ?? hash.get("error_description");
        const accessToken = hash.get("access_token");
        const refreshToken = hash.get("refresh_token");

        const existingSession = await waitForSession(4);
        if (existingSession) {
          recoveryReady = true;
          markRecoveryReady();
        } else if (errorDesc) {
          lastError = decodeURIComponent(errorDesc);
        } else if (code) {
          // PKCE flow: exchange ?code=... for a session
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) lastError = error.message;
          else {
            recoveryReady = true;
            markRecoveryReady();
          }
        } else if (tokenHash) {
          // OTP/token_hash flow
          const { error } = await supabase.auth.verifyOtp({
            type: (type as Parameters<typeof supabase.auth.verifyOtp>[0]["type"]) || "recovery",
            token_hash: tokenHash,
          });
          if (error) lastError = error.message;
          else {
            recoveryReady = true;
            markRecoveryReady();
          }
        } else if (accessToken && refreshToken) {
          // Implicit flow with tokens in hash
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (error) lastError = error.message;
          else {
            recoveryReady = true;
            markRecoveryReady();
          }
        }

        if (!recoveryReady) {
          // Fallback: Supabase may already have consumed the link and created the session.
          const session = await waitForSession();
          if (session) {
            recoveryReady = true;
            markRecoveryReady();
          } else if (lastError) {
            toast.error(lastError);
          }
        }

        // Clean URL only after success so refresh doesn't retry an already-consumed token.
        if (recoveryReady && (url.search || window.location.hash)) {
          window.history.replaceState({}, document.title, url.pathname);
        }
      } finally {
        if (!cancelled) setReady(true);
      }
    })();

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
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
    } catch (err: unknown) {
      toast.error(getErrorMessage(err) || "Erro ao atualizar palavra-passe.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-soft flex flex-col">
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <Link to="/" className="block text-center mb-8 font-serif text-3xl tracking-tight text-foreground">
            Um Ävatar
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
                  <PasswordField
                    id="new-password"
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
                  <PasswordField
                    id="confirm-password"
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

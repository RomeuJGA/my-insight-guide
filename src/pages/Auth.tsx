import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Sparkles, MailCheck, RefreshCw, LogOut } from "lucide-react";
import Footer from "@/components/Footer";

const Auth = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Pending verification state — shown after signup or when signing in with unverified email
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session?.user?.email_confirmed_at) {
        navigate("/#experience", { replace: true });
      }
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.email_confirmed_at) {
        navigate("/#experience", { replace: true });
      } else if (session?.user && !session.user.email_confirmed_at) {
        setPendingEmail(session.user.email ?? null);
      }
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/` },
        });
        if (error) throw error;
        // If email confirmation is required, the session will be null
        if (!data.session) {
          setPendingEmail(email);
          toast.success("Conta criada. Confirme o email para continuar.");
        } else {
          toast.success("Conta criada.");
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        if (data.user && !data.user.email_confirmed_at) {
          setPendingEmail(email);
        } else {
          toast.success("Sessão iniciada.");
        }
      }
    } catch (err: any) {
      toast.error(err.message ?? "Erro de autenticação.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/` },
    });
    if (error) toast.error(error.message);
  };

  const handleResend = async () => {
    if (!pendingEmail) return;
    setResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: pendingEmail,
        options: { emailRedirectTo: `${window.location.origin}/` },
      });
      if (error) throw error;
      toast.success("Email de confirmação reenviado.");
    } catch (err: any) {
      toast.error(err.message ?? "Erro ao reenviar email.");
    } finally {
      setResending(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setPendingEmail(null);
  };

  if (pendingEmail) {
    return (
      <main className="min-h-screen bg-gradient-soft flex flex-col">
        <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <Link to="/" className="block text-center mb-8 font-serif text-2xl text-primary">Lumen</Link>
          <div className="p-8 md:p-10 rounded-3xl bg-card border border-border/60 shadow-elegant text-center">
            <div className="w-14 h-14 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-5">
              <MailCheck className="w-6 h-6 text-primary" />
            </div>
            <h1 className="font-serif text-2xl md:text-3xl mb-3">
              Confirme o seu email
            </h1>
            <p className="text-sm text-muted-foreground mb-2">
              Enviámos uma ligação de confirmação para
            </p>
            <p className="font-medium text-foreground mb-6 break-all">{pendingEmail}</p>
            <p className="text-sm text-muted-foreground mb-8">
              Confirme o seu email para receber o seu crédito gratuito.
            </p>

            <button
              type="button"
              onClick={handleResend}
              disabled={resending}
              className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-2xl bg-primary text-primary-foreground font-medium shadow-soft hover:shadow-elegant transition-smooth disabled:opacity-60 mb-3"
            >
              <RefreshCw className={`w-4 h-4 ${resending ? "animate-spin" : ""}`} />
              {resending ? "A reenviar…" : "Reenviar email de confirmação"}
            </button>

            <button
              type="button"
              onClick={handleSignOut}
              className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-2xl bg-card border border-border text-sm hover:bg-muted transition-smooth"
            >
              <LogOut className="w-4 h-4" />
              Usar outra conta
            </button>
          </div>
        </div>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-soft flex flex-col">
      <div className="flex-1 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <Link to="/" className="block text-center mb-8 font-serif text-2xl text-primary">Lumen</Link>

        <div className="p-8 md:p-10 rounded-3xl bg-card border border-border/60 shadow-elegant">
          <h1 className="font-serif text-3xl text-center mb-2">
            {mode === "signin" ? "Bem-vindo de volta" : "Criar conta"}
          </h1>
          <p className="text-center text-sm text-muted-foreground mb-8">
            {mode === "signin" ? "Inicie sessão para receber a sua mensagem." : "Crie a sua conta para começar."}
          </p>

          <button
            type="button"
            onClick={handleGoogle}
            className="w-full mb-5 py-3 rounded-2xl border border-border bg-background hover:bg-muted transition-smooth text-sm font-medium"
          >
            Continuar com Google
          </button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
            <div className="relative flex justify-center text-xs uppercase tracking-wider">
              <span className="bg-card px-3 text-muted-foreground">ou</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">Email</label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring/40 transition-smooth"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">Palavra-passe</label>
              <input
                id="password"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring/40 transition-smooth"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-2xl bg-primary text-primary-foreground font-medium shadow-soft hover:shadow-elegant transition-smooth disabled:opacity-60"
            >
              <Sparkles className="w-4 h-4" />
              {loading ? "A processar…" : mode === "signin" ? "Entrar" : "Criar conta"}
            </button>
          </form>

          <button
            type="button"
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            className="mt-6 w-full text-sm text-muted-foreground hover:text-foreground transition-smooth"
          >
            {mode === "signin" ? "Ainda não tem conta? Criar conta" : "Já tem conta? Entrar"}
          </button>
        </div>
      </div>
      </div>
      <Footer />
    </main>
  );
};

export default Auth;

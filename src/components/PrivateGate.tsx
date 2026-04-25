import { useEffect, useState, FormEvent, ReactNode } from "react";
import { Lock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  isPrivateMode,
  GATE_PASSWORD,
  GATE_STORAGE_KEY,
  GATE_PREVIEW_PARAM,
} from "@/config/privateMode";

const hasPreviewParam = (): boolean => {
  if (typeof window === "undefined") return false;
  try {
    const params = new URLSearchParams(window.location.search);
    return params.get(GATE_PREVIEW_PARAM) === "1";
  } catch {
    return false;
  }
};

const readStoredAccess = (): boolean => {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(GATE_STORAGE_KEY) === "granted";
  } catch {
    return false;
  }
};

interface PrivateGateProps {
  children: ReactNode;
}

const PrivateGate = ({ children }: PrivateGateProps) => {
  const [granted, setGranted] = useState<boolean>(() => {
    if (!isPrivateMode) return true;
    return hasPreviewParam() || readStoredAccess();
  });
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Add noindex meta + persist preview bypass
  useEffect(() => {
    if (!isPrivateMode) return;

    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex, nofollow";
    meta.dataset.privateGate = "true";
    document.head.appendChild(meta);

    if (hasPreviewParam()) {
      try {
        window.localStorage.setItem(GATE_STORAGE_KEY, "granted");
      } catch {
        /* ignore */
      }
    }

    return () => {
      meta.remove();
    };
  }, []);

  if (!isPrivateMode || granted) {
    return <>{children}</>;
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    if (password.trim() === GATE_PASSWORD) {
      try {
        window.localStorage.setItem(GATE_STORAGE_KEY, "granted");
      } catch {
        /* ignore */
      }
      setGranted(true);
    } else {
      setError("Palavra-passe incorreta.");
    }
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background px-4">
      {/* Subtle ambient depth */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          background:
            "radial-gradient(ellipse at top, hsl(var(--primary-glow) / 0.08), transparent 60%)",
        }}
      />

      <div className="relative w-full max-w-sm">
        <div className="rounded-2xl border border-border/60 bg-card/80 backdrop-blur-xl shadow-soft p-8 sm:p-10">
          <div className="flex justify-center mb-6">
            <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
              <Lock className="w-5 h-5 text-foreground/70" aria-hidden />
            </div>
          </div>

          <h1 className="text-center font-serif text-2xl text-foreground tracking-tight">
            Acesso restrito
          </h1>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Website em desenvolvimento
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <label htmlFor="gate-password" className="sr-only">
                Palavra-passe
              </label>
              <Input
                id="gate-password"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="Palavra-passe"
                autoFocus
                autoComplete="current-password"
                aria-invalid={!!error}
                aria-describedby={error ? "gate-error" : undefined}
                className="h-11 text-center"
              />
              {error && (
                <p
                  id="gate-error"
                  className="mt-2 text-xs text-destructive text-center"
                  role="alert"
                >
                  {error}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-11"
              disabled={submitting || password.length === 0}
            >
              Entrar
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground/70">
          Ponto Cego — área privada
        </p>
      </div>
    </div>
  );
};

export default PrivateGate;

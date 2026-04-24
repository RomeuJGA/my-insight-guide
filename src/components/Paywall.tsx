import { useEffect, useRef, useState } from "react";
import {
  Sparkles,
  Loader2,
  Copy,
  RefreshCw,
  ArrowLeft,
  Landmark,
  ShieldCheck,
  Check,
  Clock,
} from "lucide-react";
import Disclaimer from "./Disclaimer";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type PkgId = "five" | "ten" | "twenty";
type Badge = "popular" | "value";
type Pkg = {
  id: PkgId;
  credits: number;
  label: string;
  price: string;
  tagline: string;
  badge?: Badge;
};

// Order matters: 10 first (most popular), then 20 (best value), then 5.
const PACKAGES: Pkg[] = [
  {
    id: "ten",
    credits: 10,
    label: "10 créditos",
    price: "8,90 €",
    tagline: "Para quem quer aprofundar",
    badge: "popular",
  },
  {
    id: "twenty",
    credits: 20,
    label: "20 créditos",
    price: "14,90 €",
    tagline: "Para integrar com consistência",
    badge: "value",
  },
  {
    id: "five",
    credits: 5,
    label: "5 créditos",
    price: "4,90 €",
    tagline: "Para experimentar com intenção",
  },
];

const BADGE_LABEL: Record<Badge, string> = {
  popular: "Mais escolhido",
  value: "Melhor valor",
};

type PaymentRef = {
  orderId: string;
  entity: string;
  reference: string;
  amount: string;
  expiryDate?: string;
  sandbox?: boolean;
};

interface PaywallProps {
  onPurchased: (newBalance: number) => void;
}

const Paywall = ({ onPurchased }: PaywallProps) => {
  const [selected, setSelected] = useState<PkgId | null>(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [creating, setCreating] = useState(false);
  const [payment, setPayment] = useState<PaymentRef | null>(null);
  const [checking, setChecking] = useState(false);
  const pollRef = useRef<number | null>(null);
  const pollCountRef = useRef(0);

  const stopPolling = () => {
    if (pollRef.current) {
      window.clearInterval(pollRef.current);
      pollRef.current = null;
    }
  };

  useEffect(() => () => stopPolling(), []);

  const formatRef = (r: string) =>
    r?.replace(/\D/g, "").padStart(9, "0").replace(/(\d{3})(?=\d)/g, "$1 ").trim();

  const copy = async (label: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value.replace(/\s/g, ""));
      toast.success(`${label} copiado.`);
    } catch {
      toast.error("Não foi possível copiar.");
    }
  };

  const checkStatus = async (orderId: string, silent = false) => {
    if (!silent) setChecking(true);
    try {
      const { data, error } = await supabase.functions.invoke("check-payment-status", {
        body: { orderId },
      });
      if (error) throw error;
      if (data?.status === "paid") {
        stopPolling();
        toast.success("Pagamento confirmado. Os seus créditos foram adicionados.");
        if (typeof data.balance === "number") onPurchased(data.balance);
        return true;
      }
      if (!silent) toast.message("Ainda a aguardar pagamento.");
      return false;
    } catch (e: any) {
      if (!silent) toast.error(e?.message ?? "Erro ao verificar estado.");
      return false;
    } finally {
      if (!silent) setChecking(false);
    }
  };

  const startPolling = (orderId: string) => {
    stopPolling();
    pollCountRef.current = 0;
    pollRef.current = window.setInterval(async () => {
      pollCountRef.current += 1;
      const done = await checkStatus(orderId, true);
      if (done || pollCountRef.current >= 12) stopPolling(); // 12 × 10s = 2min
    }, 10000);
  };

  const create = async () => {
    if (!selected) return toast.error("Escolha um pacote.");
    if (!acceptedTerms) return toast.error("Aceite os Termos para continuar.");
    setCreating(true);
    try {
      console.log("[Paywall] invoking create-multibanco-payment", { package: selected });
      const { data, error } = await supabase.functions.invoke("create-multibanco-payment", {
        body: { package: selected, acceptedTerms: true },
      });
      console.log("[Paywall] response", { data, error });
      if (error) {
        const ctxBody = (error as any)?.context?.body;
        const msg = typeof ctxBody === "string" ? ctxBody : error.message;
        throw new Error(msg || "Erro ao contactar o servidor.");
      }
      if (!data?.entity || !data?.reference) throw new Error("Resposta inválida do gateway.");
      setPayment(data as PaymentRef);
      startPolling(data.orderId);
    } catch (e: any) {
      console.error("[Paywall] create error", e);
      toast.error(e?.message ?? "Erro ao gerar referência.");
    } finally {
      setCreating(false);
    }
  };

  const reset = () => {
    stopPolling();
    setPayment(null);
    setSelected(null);
    setAcceptedTerms(false);
  };

  // ---- View: Multibanco reference details ----
  if (payment) {
    return (
      <div className="p-8 md:p-10 rounded-3xl bg-card border border-border/60 shadow-elegant animate-fade-in-up">
        <div className="text-center mb-6">
          <div className="w-12 h-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Landmark className="w-5 h-5 text-primary" />
          </div>
          <h3 className="font-serif text-2xl md:text-3xl mb-2">Pagamento por Multibanco</h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            Use os dados abaixo no seu homebanking ou numa caixa Multibanco.
          </p>
          {payment.sandbox && (
            <p className="mt-3 inline-block px-2 py-0.5 rounded-full bg-muted text-[11px] uppercase tracking-wider text-muted-foreground">
              Modo de testes — sem cobrança real
            </p>
          )}
        </div>

        <dl className="space-y-3">
          {[
            { label: "Entidade", value: payment.entity },
            { label: "Referência", value: formatRef(payment.reference) },
            { label: "Montante", value: `${Number(payment.amount).toFixed(2).replace(".", ",")} €` },
          ].map((row) => (
            <div
              key={row.label}
              className="flex items-center justify-between gap-3 px-4 py-3 rounded-2xl bg-muted/60 border border-border/60"
            >
              <div className="min-w-0">
                <dt className="text-[11px] uppercase tracking-wider text-muted-foreground">{row.label}</dt>
                <dd className="font-serif text-xl tabular-nums truncate">{row.value}</dd>
              </div>
              <button
                type="button"
                onClick={() => copy(row.label, row.value)}
                className="shrink-0 p-2 rounded-full hover:bg-background transition-smooth"
                aria-label={`Copiar ${row.label}`}
              >
                <Copy className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          ))}
        </dl>

        {payment.expiryDate && (
          <p className="mt-4 text-xs text-muted-foreground text-center">
            Válido até <strong className="text-foreground">{payment.expiryDate}</strong>
          </p>
        )}

        <div className="mt-6 p-4 rounded-2xl bg-primary/5 border border-primary/20">
          <div className="flex items-center gap-2 text-sm">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
            <span className="text-foreground/80">A aguardar pagamento…</span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Os créditos são adicionados automaticamente assim que o pagamento for confirmado pelo banco.
          </p>
        </div>

        <div className="mt-6 grid sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => checkStatus(payment.orderId)}
            disabled={checking}
            className="inline-flex items-center justify-center gap-2 py-3 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-smooth disabled:opacity-60"
          >
            {checking ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            Já paguei, verificar estado
          </button>
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 py-3 rounded-full bg-card border border-border text-sm font-medium hover:bg-muted transition-smooth"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </button>
        </div>
      </div>
    );
  }

  // ---- View: Package selection ----
  return (
    <div className="p-8 md:p-10 rounded-3xl bg-card border border-border/60 shadow-elegant animate-fade-in-up">
      <div className="text-center mb-8">
        <div className="w-12 h-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <Sparkles className="w-5 h-5 text-primary" />
        </div>
        <h3 className="font-serif text-2xl md:text-3xl mb-2">Sem créditos disponíveis</h3>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
          Escolha um pacote e pague de forma segura por Multibanco.
        </p>
      </div>

      <div className="grid sm:grid-cols-3 gap-3">
        {PACKAGES.map((pkg) => {
          const active = selected === pkg.id;
          return (
            <button
              key={pkg.id}
              type="button"
              onClick={() => setSelected(pkg.id)}
              className={`relative text-left rounded-2xl border p-5 transition-smooth ${
                active
                  ? "border-primary bg-primary/10 ring-2 ring-primary/30"
                  : pkg.popular
                  ? "border-primary/50 bg-primary/5 hover:bg-primary/10"
                  : "border-border bg-background hover:bg-muted"
              }`}
            >
              {pkg.popular && (
                <span className="absolute -top-2.5 left-5 px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px] font-medium uppercase tracking-wider">
                  Mais popular
                </span>
              )}
              <div className="flex items-baseline justify-between mb-1">
                <span className="font-serif text-2xl">{pkg.credits}</span>
                <span className="text-sm font-medium">{pkg.price}</span>
              </div>
              <p className="text-xs text-muted-foreground">{pkg.label}</p>
            </button>
          );
        })}
      </div>

      <Disclaimer variant="compact" className="mt-6" />

      <label className="mt-3 flex items-start gap-3 p-4 rounded-2xl bg-muted/40 border border-border/60 cursor-pointer">
        <input
          type="checkbox"
          checked={acceptedTerms}
          onChange={(e) => setAcceptedTerms(e.target.checked)}
          className="mt-0.5 w-4 h-4 accent-primary"
        />
        <span className="text-xs text-muted-foreground leading-relaxed">
          Li e aceito os{" "}
          <a href="/legal/termos" target="_blank" className="underline hover:text-foreground">Termos</a>,{" "}
          <a href="/legal/privacidade" target="_blank" className="underline hover:text-foreground">Política de Privacidade</a>{" "}
          e{" "}
          <a href="/legal/reembolsos" target="_blank" className="underline hover:text-foreground">Política de Reembolso</a>.
        </span>
      </label>

      <button
        type="button"
        onClick={create}
        disabled={!selected || !acceptedTerms || creating}
        className="mt-5 w-full inline-flex items-center justify-center gap-2 py-4 rounded-2xl bg-primary text-primary-foreground font-medium shadow-soft hover:shadow-elegant transition-smooth disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {creating ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            A gerar referência…
          </>
        ) : (
          <>
            <Landmark className="w-4 h-4" />
            Pagar por Multibanco
          </>
        )}
      </button>

      <p className="text-center text-xs text-muted-foreground mt-6">
        Pagamento processado pela IfthenPay. Os créditos são adicionados após confirmação do banco.
      </p>
    </div>
  );
};

export default Paywall;

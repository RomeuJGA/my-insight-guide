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
  Ticket,
  X,
} from "lucide-react";
import Disclaimer from "./Disclaimer";
import { supabase } from "@/integrations/supabase/client";
import { useAnalytics } from "@/hooks/useAnalytics";
import { toast } from "sonner";
import { useCreditPackages, formatEur } from "@/hooks/useCreditPackages";

type PaymentRef = {
  orderId: string;
  entity: string;
  reference: string;
  amount: string;
  expiryDate?: string;
  sandbox?: boolean;
};

type AppliedCoupon = {
  code: string;
  couponId: string;
  discountType: "percent" | "fixed";
  discountValue: number;
  finalPrice: number;
};

interface PaywallProps {
  onPurchased: (newBalance: number) => void;
}

const Paywall = ({ onPurchased }: PaywallProps) => {
  const { packages, loading: loadingPkgs } = useCreditPackages({ onlyActive: true });
  const [selected, setSelected] = useState<string | null>(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [creating, setCreating] = useState(false);
  const [payment, setPayment] = useState<PaymentRef | null>(null);
  const [checking, setChecking] = useState(false);

  // Coupon
  const [couponCode, setCouponCode] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [coupon, setCoupon] = useState<AppliedCoupon | null>(null);

  const pollRef = useRef<number | null>(null);
  const pollCountRef = useRef(0);
  const { track } = useAnalytics();

  useEffect(() => {
    track("paywall_view");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedPkg = packages.find((p) => p.id === selected) ?? null;

  const handleSelect = (id: string) => {
    setSelected(id);
    setCoupon(null); // reset coupon when changing pack
    track("package_selected", { package: id });
  };

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

  const applyCoupon = async () => {
    const code = couponCode.trim();
    if (!code) return;
    if (!selected) return toast.error("Escolha primeiro um pack.");
    setCouponLoading(true);
    try {
      const { data, error } = await supabase.rpc("validate_coupon", {
        _code: code,
        _user_id: (await supabase.auth.getUser()).data.user?.id ?? "",
        _package_id: selected,
      });
      if (error) throw error;
      const row = Array.isArray(data) ? data[0] : data;
      if (!row?.valid) {
        const reasonMap: Record<string, string> = {
          invalid: "Cupão inválido.",
          expired: "Cupão expirado.",
          not_yet_valid: "Cupão ainda não está ativo.",
          exhausted: "Cupão esgotado.",
          user_limit: "Já usou este cupão o número máximo de vezes.",
          not_applicable: "Este cupão não se aplica ao pack escolhido.",
          package_invalid: "Pack inválido.",
        };
        toast.error(reasonMap[row?.reason ?? ""] ?? "Cupão não aplicável.");
        setCoupon(null);
        return;
      }
      setCoupon({
        code: code.toUpperCase(),
        couponId: row.coupon_id,
        discountType: row.discount_type,
        discountValue: Number(row.discount_value),
        finalPrice: Number(row.final_price),
      });
      toast.success("Cupão aplicado.");
    } catch (e: any) {
      toast.error(e?.message ?? "Erro ao validar cupão.");
    } finally {
      setCouponLoading(false);
    }
  };

  const removeCoupon = () => {
    setCoupon(null);
    setCouponCode("");
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
        track("purchase_success", { package: selected, metadata: { order_id: orderId } });
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
      if (done || pollCountRef.current >= 12) stopPolling();
    }, 10000);
  };

  const create = async () => {
    if (!selected) return toast.error("Escolha um pacote.");
    if (!acceptedTerms) return toast.error("Aceite os Termos para continuar.");
    track("purchase_attempt", { package: selected });
    setCreating(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-multibanco-payment", {
        body: {
          packageId: selected,
          acceptedTerms: true,
          couponCode: coupon?.code ?? null,
        },
      });
      if (error) {
        const ctxBody = (error as any)?.context?.body;
        const msg = typeof ctxBody === "string" ? ctxBody : error.message;
        throw new Error(msg || "Erro ao contactar o servidor.");
      }
      if (!data?.entity || !data?.reference) throw new Error("Resposta inválida do gateway.");
      setPayment(data as PaymentRef);
      startPolling(data.orderId);
    } catch (e: any) {
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
    setCoupon(null);
    setCouponCode("");
  };

  // ---- Multibanco reference details ----
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

  // ---- Package selection ----
  return (
    <div className="p-6 sm:p-8 md:p-10 rounded-3xl bg-card border border-border/60 shadow-elegant animate-fade-in-up">
      <div className="text-center mb-8">
        <div className="w-12 h-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <Sparkles className="w-5 h-5 text-primary" />
        </div>
        <h3 className="font-serif text-2xl md:text-3xl mb-2 tracking-tight">
          Receba a sua mensagem agora
        </h3>
        <p className="text-sm md:text-[15px] text-muted-foreground max-w-md mx-auto leading-relaxed">
          Não precisa de todas as respostas. Precisa da certa — no momento certo.
        </p>
      </div>

      {/* Packages */}
      {loadingPkgs ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      ) : packages.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">
          De momento não há packs disponíveis. Volte mais tarde.
        </p>
      ) : (
        <div className={`grid gap-3 sm:gap-4 ${packages.length >= 3 ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}>
          {packages.map((pkg) => {
            const active = selected === pkg.id;
            const isPopular = pkg.badge?.toLowerCase() === "popular";
            return (
              <button
                key={pkg.id}
                type="button"
                onClick={() => handleSelect(pkg.id)}
                className={`relative text-left rounded-2xl border p-5 transition-smooth flex flex-col ${
                  isPopular ? "sm:scale-[1.03] sm:py-6" : ""
                } ${
                  active
                    ? "border-primary bg-primary/10 ring-2 ring-primary/30 shadow-elegant"
                    : isPopular
                    ? "border-primary/60 bg-primary/5 hover:bg-primary/10 shadow-soft"
                    : "border-border bg-background hover:bg-muted"
                }`}
              >
                {pkg.badge && (
                  <span
                    className={`absolute -top-2.5 left-5 px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider ${
                      isPopular ? "bg-primary text-primary-foreground" : "bg-foreground text-background"
                    }`}
                  >
                    {pkg.badge}
                  </span>
                )}
                <div className="flex items-baseline justify-between mb-1.5">
                  <span className="font-serif text-3xl leading-none">{pkg.credits}</span>
                  <span className="text-sm font-medium tabular-nums">{formatEur(pkg.price_eur)}</span>
                </div>
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">
                  {pkg.name}
                </p>
                <p className="text-xs text-foreground/75 leading-relaxed mt-auto">
                  {(pkg.price_eur / pkg.credits).toFixed(2).replace(".", ",")} € por mensagem
                </p>
                {active && (
                  <span className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                    <Check className="w-3 h-3" strokeWidth={3} />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Coupon */}
      {selected && (
        <div className="mt-5 p-4 rounded-2xl bg-muted/40 border border-border/60">
          <div className="flex items-center gap-2 mb-2 text-[11px] uppercase tracking-wider text-muted-foreground">
            <Ticket className="w-3.5 h-3.5" />
            Cupão de desconto
          </div>
          {coupon ? (
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm">
                <span className="font-mono font-medium">{coupon.code}</span>
                <span className="text-muted-foreground ml-2">
                  {coupon.discountType === "percent"
                    ? `-${coupon.discountValue}%`
                    : `-${formatEur(coupon.discountValue)}`}{" "}
                  · Total:{" "}
                  <strong className="text-foreground tabular-nums">{formatEur(coupon.finalPrice)}</strong>
                  {selectedPkg && (
                    <span className="ml-1 line-through opacity-60">{formatEur(selectedPkg.price_eur)}</span>
                  )}
                </span>
              </div>
              <button
                onClick={removeCoupon}
                className="p-1.5 rounded-full hover:bg-background"
                aria-label="Remover cupão"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                placeholder="Insira o código"
                className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-sm font-mono uppercase"
                onKeyDown={(e) => e.key === "Enter" && applyCoupon()}
              />
              <button
                onClick={applyCoupon}
                disabled={couponLoading || !couponCode.trim()}
                className="px-4 py-2 rounded-lg bg-foreground text-background text-sm font-medium hover:opacity-90 disabled:opacity-50"
              >
                {couponLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Aplicar"}
              </button>
            </div>
          )}
        </div>
      )}

      <p className="mt-5 flex items-start gap-2 text-xs text-muted-foreground leading-relaxed">
        <Clock className="w-3.5 h-3.5 shrink-0 mt-0.5 text-primary/70" />
        <span>
          Pode esperar pela mensagem gratuita de amanhã… ou receber já a orientação que procura.
        </span>
      </p>

      <Disclaimer variant="compact" className="mt-5" />

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
            Receber a minha mensagem agora
            {coupon && selectedPkg && (
              <span className="text-xs opacity-80">· {formatEur(coupon.finalPrice)}</span>
            )}
          </>
        )}
      </button>

      <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
        <ShieldCheck className="w-3.5 h-3.5 text-primary/70" />
        Pagamento seguro por Multibanco · IfthenPay
      </p>
    </div>
  );
};

export default Paywall;

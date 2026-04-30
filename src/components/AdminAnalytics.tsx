import { useEffect, useState } from "react";
import {
  Loader2,
  TrendingUp,
  Users,
  Eye,
  MousePointerClick,
  ShoppingCart,
  CheckCircle2,
  Target,
  Package,
  FlaskConical,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type Stats = {
  total_users: number;
  landing_views: number;
  click_receive_message: number;
  reveal_attempts: number;
  paywall_views: number;
  package_selected: number;
  purchase_attempts: number;
  purchase_success: number;
  top_package: string | null;
  top_package_count: number;
};

type VariantStats = Stats & { variant: string };

type Range = 1 | 7 | 30;

const PACKAGE_LABELS: Record<string, string> = {
  five: "5 créditos",
  ten: "10 créditos",
  twenty: "20 créditos",
};

const VARIANT_LABEL: Record<string, string> = {
  a: "Variante A · versão anterior",
  b: "Variante B · versão atual",
  unknown: "Sem variante",
};

const pct = (a: number, b: number) =>
  b > 0 ? `${((a / b) * 100).toFixed(1)}%` : "—";

const AdminAnalytics = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [byVariant, setByVariant] = useState<VariantStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<Range>(30);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    const since = new Date(Date.now() - range * 24 * 60 * 60 * 1000).toISOString();

    Promise.all([
      supabase.rpc("get_funnel_stats", { _since: since }),
      supabase.rpc("get_funnel_stats_by_variant", { _since: since }),
    ])
      .then(([overall, perVariant]) => {
        if (cancelled) return;
        if (overall.error) {
          setError(overall.error.message);
          setStats(null);
        } else {
          const row = Array.isArray(overall.data) ? overall.data[0] : overall.data;
          setStats((row as Stats) ?? null);
        }
        if (perVariant.error) {
          setByVariant([]);
        } else {
          const rows = (perVariant.data as VariantStats[] | null) ?? [];
          // Show known variants first, then unknown
          rows.sort((a, b) => {
            const order: Record<string, number> = { a: 0, b: 1, unknown: 2 };
            return (order[a.variant] ?? 99) - (order[b.variant] ?? 99);
          });
          setByVariant(rows);
        }
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [range]);

  const conversion = stats
    ? pct(stats.purchase_success, stats.paywall_views)
    : "—";

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-serif text-xl">Funil de conversão</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Eventos registados nos últimos {range} dia{range === 1 ? "" : "s"}.
            </p>
          </div>
          <div className="inline-flex rounded-full bg-muted/60 p-1 text-xs">
            {([1, 7, 30] as Range[]).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRange(r)}
                className={`px-3 py-1.5 rounded-full transition-smooth ${
                  range === r
                    ? "bg-background shadow-soft text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {r === 1 ? "24h" : `${r}d`}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="p-10 flex justify-center">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <p className="p-6 text-sm text-destructive">Erro: {error}</p>
        ) : !stats ? (
          <p className="p-6 text-sm text-muted-foreground">Sem dados ainda.</p>
        ) : (
          <div className="p-5 space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Kpi icon={<Users className="w-4 h-4" />} label="Utilizadores" value={stats.total_users} hint="únicos com sessão" />
              <Kpi icon={<Eye className="w-4 h-4" />} label="Paywall views" value={stats.paywall_views} />
              <Kpi icon={<ShoppingCart className="w-4 h-4" />} label="Compras" value={stats.purchase_success} />
              <Kpi icon={<Target className="w-4 h-4" />} label="Conversão" value={conversion} hint="compras / paywall views" accent />
            </div>

            <div>
              <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-3">
                Funil completo (todas as variantes)
              </p>
              <div className="space-y-2">
                <FunnelRow icon={<Eye className="w-3.5 h-3.5" />} label="Landing views" value={stats.landing_views} base={stats.landing_views} />
                <FunnelRow icon={<MousePointerClick className="w-3.5 h-3.5" />} label="Cliques “Receber mensagem”" value={stats.click_receive_message} base={stats.landing_views} />
                <FunnelRow icon={<TrendingUp className="w-3.5 h-3.5" />} label="Tentativas de revelar" value={stats.reveal_attempts} base={stats.landing_views} />
                <FunnelRow icon={<Eye className="w-3.5 h-3.5" />} label="Paywall views" value={stats.paywall_views} base={stats.landing_views} />
                <FunnelRow icon={<Package className="w-3.5 h-3.5" />} label="Pacotes selecionados" value={stats.package_selected} base={stats.landing_views} />
                <FunnelRow icon={<ShoppingCart className="w-3.5 h-3.5" />} label="Tentativas de compra" value={stats.purchase_attempts} base={stats.landing_views} />
                <FunnelRow icon={<CheckCircle2 className="w-3.5 h-3.5" />} label="Compras concluídas" value={stats.purchase_success} base={stats.landing_views} highlight />
              </div>
            </div>

            <div className="rounded-xl bg-muted/40 border border-border p-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Pacote mais selecionado</p>
                <p className="font-serif text-lg mt-0.5">
                  {stats.top_package ? PACKAGE_LABELS[stats.top_package] ?? stats.top_package : "—"}
                </p>
              </div>
              <span className="font-medium tabular-nums text-sm text-foreground/80">
                {stats.top_package_count} seleções
              </span>
            </div>
          </div>
        )}
      </section>

      {/* A/B comparison */}
      <section className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center gap-3">
          <FlaskConical className="w-4 h-4 text-primary" />
          <div>
            <h2 className="font-serif text-xl">Teste A/B · variantes</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Funil completo de cada variante. A vencedora é a que tem maior taxa de compras / paywall views.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="p-10 flex justify-center">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : byVariant.length === 0 ? (
          <p className="p-6 text-sm text-muted-foreground">
            Ainda não há eventos por variante. Aguarde tráfego ou abra a homepage com <code>?v=a</code> e <code>?v=b</code>.
          </p>
        ) : (
          <div className="grid md:grid-cols-2 gap-px bg-border">
            {byVariant
              .filter((v) => v.variant === "a" || v.variant === "b" || v.landing_views > 0)
              .map((v) => {
                const conv = pct(v.purchase_success, v.paywall_views);
                const ctr = pct(v.click_receive_message, v.landing_views);
                return (
                  <div key={v.variant} className="p-5 bg-card space-y-4">
                    <div className="flex items-center justify-between">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider ${
                          v.variant === "a"
                            ? "bg-[hsl(165_35%_28%/0.12)] text-[hsl(165_35%_28%)]"
                            : v.variant === "b"
                            ? "bg-foreground text-background"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {v.variant.toUpperCase()}
                      </span>
                      <span className="text-xs text-muted-foreground">{VARIANT_LABEL[v.variant] ?? v.variant}</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <MiniStat label="Visitas" value={v.landing_views} />
                      <MiniStat label="CTR" value={ctr} hint="cliques / visitas" />
                      <MiniStat label="Conversão" value={conv} hint="compras / paywall" accent />
                    </div>

                    <div className="space-y-1.5">
                      <FunnelRow icon={<Eye className="w-3.5 h-3.5" />} label="Landing" value={v.landing_views} base={v.landing_views} />
                      <FunnelRow icon={<MousePointerClick className="w-3.5 h-3.5" />} label="Click CTA" value={v.click_receive_message} base={v.landing_views} />
                      <FunnelRow icon={<Eye className="w-3.5 h-3.5" />} label="Paywall" value={v.paywall_views} base={v.landing_views} />
                      <FunnelRow icon={<Package className="w-3.5 h-3.5" />} label="Pacote selecionado" value={v.package_selected} base={v.landing_views} />
                      <FunnelRow icon={<CheckCircle2 className="w-3.5 h-3.5" />} label="Compras" value={v.purchase_success} base={v.landing_views} highlight />
                    </div>

                    {v.top_package && (
                      <p className="text-[11px] text-muted-foreground">
                        Pacote favorito:{" "}
                        <span className="text-foreground font-medium">
                          {PACKAGE_LABELS[v.top_package] ?? v.top_package}
                        </span>{" "}
                        · {v.top_package_count} seleções
                      </p>
                    )}
                  </div>
                );
              })}
          </div>
        )}

        <div className="px-5 py-3 border-t border-border bg-muted/20 text-[11px] text-muted-foreground">
          Forçar uma variante para QA: adicione <code className="text-foreground">?v=a</code> ou{" "}
          <code className="text-foreground">?v=b</code> ao URL da homepage.
        </div>
      </section>
    </div>
  );
};

const Kpi = ({
  icon, label, value, hint, accent,
}: {
  icon: React.ReactNode; label: string; value: number | string; hint?: string; accent?: boolean;
}) => (
  <div className={`rounded-xl p-4 border ${accent ? "bg-primary/5 border-primary/30" : "bg-background border-border"}`}>
    <div className="flex items-center gap-1.5 text-muted-foreground text-[11px] uppercase tracking-wider">
      {icon}{label}
    </div>
    <p className={`mt-1.5 font-serif text-2xl tabular-nums ${accent ? "text-primary" : ""}`}>{value}</p>
    {hint && <p className="text-[10px] text-muted-foreground mt-1">{hint}</p>}
  </div>
);

const MiniStat = ({
  label, value, hint, accent,
}: { label: string; value: number | string; hint?: string; accent?: boolean }) => (
  <div className={`rounded-lg p-2.5 border text-center ${accent ? "bg-primary/5 border-primary/30" : "bg-background border-border"}`}>
    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
    <p className={`mt-0.5 font-serif text-lg tabular-nums ${accent ? "text-primary" : ""}`}>{value}</p>
    {hint && <p className="text-[9px] text-muted-foreground/80 mt-0.5">{hint}</p>}
  </div>
);

const FunnelRow = ({
  icon, label, value, base, highlight,
}: {
  icon: React.ReactNode; label: string; value: number; base: number; highlight?: boolean;
}) => {
  const ratio = base > 0 ? Math.min(100, (value / base) * 100) : 0;
  return (
    <div className="grid grid-cols-[1fr_auto] gap-x-3 items-center text-sm">
      <div>
        <div className="flex items-center justify-between mb-1 text-xs">
          <span className="flex items-center gap-2 text-foreground/85">
            <span className="text-muted-foreground">{icon}</span>
            {label}
          </span>
          <span className="text-muted-foreground tabular-nums">{pct(value, base)}</span>
        </div>
        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${highlight ? "bg-primary" : "bg-primary/60"}`}
            style={{ width: `${ratio}%` }}
          />
        </div>
      </div>
      <span className="font-medium tabular-nums text-sm">{value}</span>
    </div>
  );
};

export default AdminAnalytics;

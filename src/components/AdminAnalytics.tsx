import { useEffect, useState } from "react";
import { Loader2, TrendingUp, Users, Eye, MousePointerClick, ShoppingCart, CheckCircle2, Target, Package } from "lucide-react";
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

type Range = 1 | 7 | 30;

const PACKAGE_LABELS: Record<string, string> = {
  five: "5 créditos",
  ten: "10 créditos",
  twenty: "20 créditos",
};

const pct = (a: number, b: number) =>
  b > 0 ? `${((a / b) * 100).toFixed(1)}%` : "—";

const AdminAnalytics = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<Range>(30);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    const since = new Date(Date.now() - range * 24 * 60 * 60 * 1000).toISOString();

    supabase
      .rpc("get_funnel_stats", { _since: since })
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) {
          setError(error.message);
          setStats(null);
        } else {
          const row = Array.isArray(data) ? data[0] : data;
          setStats((row as Stats) ?? null);
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
    <section className="rounded-2xl border border-border bg-card overflow-hidden">
      {/* Header */}
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
          {/* Top KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Kpi
              icon={<Users className="w-4 h-4" />}
              label="Utilizadores"
              value={stats.total_users}
              hint="únicos com sessão"
            />
            <Kpi
              icon={<Eye className="w-4 h-4" />}
              label="Paywall views"
              value={stats.paywall_views}
            />
            <Kpi
              icon={<ShoppingCart className="w-4 h-4" />}
              label="Compras"
              value={stats.purchase_success}
            />
            <Kpi
              icon={<Target className="w-4 h-4" />}
              label="Conversão"
              value={conversion}
              hint="compras / paywall views"
              accent
            />
          </div>

          {/* Funnel */}
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-3">
              Funil completo
            </p>
            <div className="space-y-2">
              <FunnelRow
                icon={<Eye className="w-3.5 h-3.5" />}
                label="Landing views"
                value={stats.landing_views}
                base={stats.landing_views}
              />
              <FunnelRow
                icon={<MousePointerClick className="w-3.5 h-3.5" />}
                label="Cliques “Receber mensagem”"
                value={stats.click_receive_message}
                base={stats.landing_views}
              />
              <FunnelRow
                icon={<TrendingUp className="w-3.5 h-3.5" />}
                label="Tentativas de revelar"
                value={stats.reveal_attempts}
                base={stats.landing_views}
              />
              <FunnelRow
                icon={<Eye className="w-3.5 h-3.5" />}
                label="Paywall views"
                value={stats.paywall_views}
                base={stats.landing_views}
              />
              <FunnelRow
                icon={<Package className="w-3.5 h-3.5" />}
                label="Pacotes selecionados"
                value={stats.package_selected}
                base={stats.landing_views}
              />
              <FunnelRow
                icon={<ShoppingCart className="w-3.5 h-3.5" />}
                label="Tentativas de compra"
                value={stats.purchase_attempts}
                base={stats.landing_views}
              />
              <FunnelRow
                icon={<CheckCircle2 className="w-3.5 h-3.5" />}
                label="Compras concluídas"
                value={stats.purchase_success}
                base={stats.landing_views}
                highlight
              />
            </div>
          </div>

          {/* Top package */}
          <div className="rounded-xl bg-muted/40 border border-border p-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                Pacote mais selecionado
              </p>
              <p className="font-serif text-lg mt-0.5">
                {stats.top_package
                  ? PACKAGE_LABELS[stats.top_package] ?? stats.top_package
                  : "—"}
              </p>
            </div>
            <span className="font-medium tabular-nums text-sm text-foreground/80">
              {stats.top_package_count} seleções
            </span>
          </div>
        </div>
      )}
    </section>
  );
};

const Kpi = ({
  icon,
  label,
  value,
  hint,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  hint?: string;
  accent?: boolean;
}) => (
  <div
    className={`rounded-xl p-4 border ${
      accent ? "bg-primary/5 border-primary/30" : "bg-background border-border"
    }`}
  >
    <div className="flex items-center gap-1.5 text-muted-foreground text-[11px] uppercase tracking-wider">
      {icon}
      {label}
    </div>
    <p className={`mt-1.5 font-serif text-2xl tabular-nums ${accent ? "text-primary" : ""}`}>
      {value}
    </p>
    {hint && <p className="text-[10px] text-muted-foreground mt-1">{hint}</p>}
  </div>
);

const FunnelRow = ({
  icon,
  label,
  value,
  base,
  highlight,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  base: number;
  highlight?: boolean;
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
            className={`h-full rounded-full transition-all ${
              highlight ? "bg-primary" : "bg-primary/60"
            }`}
            style={{ width: `${ratio}%` }}
          />
        </div>
      </div>
      <span className="font-medium tabular-nums text-sm">{value}</span>
    </div>
  );
};

export default AdminAnalytics;

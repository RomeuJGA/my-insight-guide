import { useEffect, useState } from "react";
import {
  Loader2,
  ShoppingCart,
  RefreshCw,
  Receipt,
  Copy,
  Download,
  Filter,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Order = {
  id: string;
  order_id: string;
  user_id: string;
  payment_method: string;
  package: string;
  credits: number;
  amount: string;
  status: string;
  billing_name: string | null;
  billing_nif: string | null;
  billing_address: string | null;
  created_at: string;
  paid_at: string | null;
};

type UserMap = Record<string, string>; // user_id → email

const STATUS_LABEL: Record<string, { label: string; classes: string }> = {
  paid: { label: "Pago", classes: "bg-green-100 text-green-800" },
  pending: { label: "Pendente", classes: "bg-amber-100 text-amber-800" },
  failed: { label: "Falhado", classes: "bg-red-100 text-red-800" },
};

function fmtDate(s: string) {
  return new Date(s).toLocaleString("pt-PT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function fmtAmount(a: string) {
  return `${Number(a).toFixed(2).replace(".", ",")} €`;
}

function exportCsv(orders: Order[], users: UserMap) {
  const header = ["Data", "Encomenda", "Email", "Pacote", "Montante", "Método", "Estado", "Nome Fatura", "NIF", "Morada"];
  const rows = orders.map((o) => [
    fmtDate(o.created_at),
    o.order_id,
    users[o.user_id] ?? o.user_id,
    o.package,
    fmtAmount(o.amount),
    o.payment_method,
    STATUS_LABEL[o.status]?.label ?? o.status,
    o.billing_name ?? "",
    o.billing_nif ?? "",
    o.billing_address ?? "",
  ]);
  const csv = [header, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `encomendas-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<UserMap>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [onlyBilling, setOnlyBilling] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [ordersRes, usersRes] = await Promise.all([
        supabase
          .from("payment_orders")
          .select("id, order_id, user_id, payment_method, package, credits, amount, status, billing_name, billing_nif, billing_address, created_at, paid_at")
          .order("created_at", { ascending: false })
          .limit(200),
        supabase.functions.invoke("admin-list-users"),
      ]);

      if (ordersRes.error) throw ordersRes.error;
      setOrders((ordersRes.data ?? []) as Order[]);

      if (!usersRes.error && usersRes.data?.users) {
        const map: UserMap = {};
        for (const u of usersRes.data.users) map[u.id] = u.email;
        setUsers(map);
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erro ao carregar encomendas.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  const copy = async (value: string, label: string) => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success(`${label} copiado.`);
    } catch {
      toast.error("Não foi possível copiar.");
    }
  };

  const visible = onlyBilling ? orders.filter((o) => o.billing_nif) : orders;
  const billingCount = orders.filter((o) => o.billing_nif).length;

  return (
    <div className="rounded-2xl border border-border/60 bg-card overflow-hidden">
      <div className="px-5 py-4 border-b border-border/60 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ShoppingCart className="w-4 h-4 text-muted-foreground" />
          <h2 className="font-medium text-sm">Encomendas</h2>
          {billingCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium flex items-center gap-1">
              <Receipt className="w-3 h-3" />
              {billingCount} com NIF
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setOnlyBilling((v) => !v)}
            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-smooth ${
              onlyBilling
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            <Filter className="w-3 h-3" />
            Só com NIF
          </button>
          {visible.length > 0 && (
            <button
              onClick={() => exportCsv(visible, users)}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border border-border text-muted-foreground hover:text-foreground transition-smooth"
            >
              <Download className="w-3 h-3" />
              Exportar CSV
            </button>
          )}
          <button
            onClick={load}
            disabled={loading}
            className="p-1.5 rounded-full hover:bg-muted transition-smooth disabled:opacity-50"
            aria-label="Recarregar"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-muted-foreground ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      ) : error ? (
        <p className="px-5 py-8 text-sm text-destructive text-center">{error}</p>
      ) : visible.length === 0 ? (
        <p className="px-5 py-8 text-sm text-muted-foreground text-center">
          {onlyBilling ? "Sem encomendas com pedido de fatura." : "Sem encomendas ainda."}
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead>
              <tr className="border-b border-border/60 bg-muted/30">
                {["Data", "Encomenda", "Utilizador", "Pacote", "Montante", "Estado", "Fatura"].map((h) => (
                  <th key={h} className="px-4 py-2.5 text-left text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visible.map((o) => {
                const status = STATUS_LABEL[o.status] ?? { label: o.status, classes: "bg-muted text-muted-foreground" };
                const hasBilling = !!(o.billing_nif || o.billing_name);
                return (
                  <tr key={o.id} className={`border-t border-border/40 hover:bg-muted/20 transition-smooth ${hasBilling ? "bg-primary/[0.03]" : ""}`}>
                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                      {fmtDate(o.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs">{o.order_id}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground max-w-[160px] truncate">
                      {users[o.user_id] ?? <span className="opacity-40 font-mono">{o.user_id.slice(0, 8)}…</span>}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      <span className="font-medium">{o.package}</span>
                      <span className="ml-1 text-muted-foreground">· {o.credits}cr</span>
                    </td>
                    <td className="px-4 py-3 tabular-nums font-medium text-xs whitespace-nowrap">
                      {fmtAmount(o.amount)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${status.classes}`}>
                        {status.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {hasBilling ? (
                        <div className="space-y-0.5">
                          {o.billing_name && (
                            <p className="text-xs font-medium truncate max-w-[180px]">{o.billing_name}</p>
                          )}
                          {o.billing_nif && (
                            <button
                              onClick={() => copy(o.billing_nif!, "NIF")}
                              className="flex items-center gap-1 text-xs text-primary hover:opacity-70 transition-smooth font-mono"
                            >
                              <Copy className="w-3 h-3 shrink-0" />
                              {o.billing_nif}
                            </button>
                          )}
                          {o.billing_address && (
                            <p className="text-xs text-muted-foreground truncate max-w-[180px]" title={o.billing_address}>
                              {o.billing_address}
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground/40">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;

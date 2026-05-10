import { useEffect, useMemo, useState } from "react";
import {
  Loader2, ShoppingCart, RefreshCw, Receipt,
  Copy, Download, X, Search, Trash2, AlertTriangle,
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

type UserMap = Record<string, string>;

const STATUS_LABEL: Record<string, { label: string; classes: string }> = {
  paid:    { label: "Pago",     classes: "bg-green-100 text-green-800" },
  pending: { label: "Pendente", classes: "bg-amber-100 text-amber-800" },
  failed:  { label: "Falhado",  classes: "bg-red-100 text-red-800" },
};

const METHOD_LABEL: Record<string, string> = {
  multibanco: "Multibanco",
  mbway: "MB WAY",
};

function fmtDate(s: string) {
  return new Date(s).toLocaleString("pt-PT", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function fmtAmount(a: string) {
  return `${Number(a).toFixed(2).replace(".", ",")} €`;
}

function toInputDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

function exportCsv(orders: Order[], users: UserMap) {
  const header = ["Data", "Encomenda", "Email", "Pacote", "Créditos", "Montante", "Método", "Estado", "Nome Fatura", "NIF", "Morada"];
  const rows = orders.map((o) => [
    fmtDate(o.created_at),
    o.order_id,
    users[o.user_id] ?? o.user_id,
    o.package,
    String(o.credits),
    fmtAmount(o.amount),
    METHOD_LABEL[o.payment_method] ?? o.payment_method,
    STATUS_LABEL[o.status]?.label ?? o.status,
    o.billing_name ?? "",
    o.billing_nif ?? "",
    o.billing_address ?? "",
  ]);
  const csv = [header, ...rows]
    .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `encomendas-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

const EMPTY_FILTERS = {
  search: "",
  status: "",
  method: "",
  billing: "",
  dateFrom: "",
  dateTo: "",
};

const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<UserMap>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [ordersRes, usersRes] = await Promise.all([
        supabase
          .from("payment_orders")
          .select("id, order_id, user_id, payment_method, package, credits, amount, status, billing_name, billing_nif, billing_address, created_at, paid_at")
          .order("created_at", { ascending: false })
          .limit(500),
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

  const set = (key: keyof typeof EMPTY_FILTERS, value: string) =>
    setFilters((f) => ({ ...f, [key]: value }));

  const clearFilters = () => setFilters(EMPTY_FILTERS);

  const hasFilters = Object.values(filters).some(Boolean);

  // Selection helpers — only pending orders can be selected
  const pendingVisible = useMemo(() => visible.filter((o) => o.status === "pending"), [visible]);
  const allPendingSelected = pendingVisible.length > 0 && pendingVisible.every((o) => selected.has(o.id));

  const toggleOrder = (id: string) =>
    setSelected((prev) => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });

  const toggleAllPending = () =>
    setSelected(allPendingSelected ? new Set() : new Set(pendingVisible.map((o) => o.id)));

  const deleteSelected = async () => {
    if (selected.size === 0) return;
    setDeleting(true);
    try {
      const ids = [...selected];
      const { error } = await supabase
        .from("payment_orders")
        .delete()
        .in("id", ids)
        .eq("status", "pending");
      if (error) throw error;
      toast.success(`${ids.length} encomenda${ids.length !== 1 ? "s" : ""} eliminada${ids.length !== 1 ? "s" : ""}.`);
      setSelected(new Set());
      setOrders((prev) => prev.filter((o) => !ids.includes(o.id)));
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Erro ao eliminar encomendas.");
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  const visible = useMemo(() => {
    const search = filters.search.toLowerCase().trim();
    const from = filters.dateFrom ? new Date(filters.dateFrom + "T00:00:00") : null;
    const to   = filters.dateTo   ? new Date(filters.dateTo   + "T23:59:59") : null;

    return orders.filter((o) => {
      if (filters.status && o.status !== filters.status) return false;
      if (filters.method && o.payment_method !== filters.method) return false;
      if (filters.billing === "yes" && !o.billing_nif) return false;
      if (filters.billing === "no"  &&  o.billing_nif) return false;
      if (from && new Date(o.created_at) < from) return false;
      if (to   && new Date(o.created_at) > to)   return false;
      if (search) {
        const email = (users[o.user_id] ?? "").toLowerCase();
        const hay = [o.order_id, email, o.billing_name ?? "", o.billing_nif ?? "", o.package].join(" ").toLowerCase();
        if (!hay.includes(search)) return false;
      }
      return true;
    });
  }, [orders, users, filters]);

  const copy = async (value: string, label: string) => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success(`${label} copiado.`);
    } catch {
      toast.error("Não foi possível copiar.");
    }
  };

  const billingCount = orders.filter((o) => o.billing_nif).length;
  const paidTotal = visible
    .filter((o) => o.status === "paid")
    .reduce((sum, o) => sum + Number(o.amount), 0);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h2 className="font-serif text-2xl md:text-3xl tracking-tight">Encomendas</h2>
          {billingCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium flex items-center gap-1">
              <Receipt className="w-3 h-3" />
              {billingCount} com NIF
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {selected.size > 0 && (
            <button
              onClick={() => setConfirmDelete(true)}
              disabled={deleting}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-destructive text-destructive-foreground hover:opacity-90 transition-smooth disabled:opacity-50"
            >
              <Trash2 className="w-3 h-3" />
              Eliminar {selected.size} selecionada{selected.size !== 1 ? "s" : ""}
            </button>
          )}
          {visible.length > 0 && (
            <button
              onClick={() => exportCsv(visible, users)}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border border-border text-muted-foreground hover:text-foreground transition-smooth"
            >
              <Download className="w-3 h-3" />
              Exportar CSV ({visible.length})
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

      {/* Filters */}
      <div className="rounded-2xl border border-border/60 bg-card p-4 space-y-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => set("search", e.target.value)}
            placeholder="Pesquisar por encomenda, email, nome, NIF ou pacote…"
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-border bg-background text-sm placeholder:text-muted-foreground/60"
          />
        </div>

        {/* Row 2 — selects + dates */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          <select
            value={filters.status}
            onChange={(e) => set("status", e.target.value)}
            className="px-3 py-2 rounded-xl border border-border bg-background text-sm text-foreground"
          >
            <option value="">Todos os estados</option>
            <option value="paid">Pago</option>
            <option value="pending">Pendente</option>
            <option value="failed">Falhado</option>
          </select>

          <select
            value={filters.method}
            onChange={(e) => set("method", e.target.value)}
            className="px-3 py-2 rounded-xl border border-border bg-background text-sm text-foreground"
          >
            <option value="">Todos os métodos</option>
            <option value="multibanco">Multibanco</option>
            <option value="mbway">MB WAY</option>
          </select>

          <select
            value={filters.billing}
            onChange={(e) => set("billing", e.target.value)}
            className="px-3 py-2 rounded-xl border border-border bg-background text-sm text-foreground"
          >
            <option value="">Fatura: todas</option>
            <option value="yes">Com NIF</option>
            <option value="no">Sem NIF</option>
          </select>

          <div className="relative">
            <label className="absolute -top-2 left-2.5 text-[10px] bg-background px-1 text-muted-foreground">De</label>
            <input
              type="date"
              value={filters.dateFrom}
              max={filters.dateTo || toInputDate(new Date())}
              onChange={(e) => set("dateFrom", e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm"
            />
          </div>

          <div className="relative">
            <label className="absolute -top-2 left-2.5 text-[10px] bg-background px-1 text-muted-foreground">Até</label>
            <input
              type="date"
              value={filters.dateTo}
              min={filters.dateFrom || undefined}
              max={toInputDate(new Date())}
              onChange={(e) => set("dateTo", e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm"
            />
          </div>
        </div>

        {/* Active filter summary + clear */}
        {hasFilters && (
          <div className="flex items-center justify-between pt-1">
            <p className="text-xs text-muted-foreground">
              {visible.length} resultado{visible.length !== 1 ? "s" : ""}
              {visible.some((o) => o.status === "paid") && (
                <span className="ml-2 text-primary font-medium">
                  · {fmtAmount(String(paidTotal))} pagos
                </span>
              )}
            </p>
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-smooth"
            >
              <X className="w-3 h-3" />
              Limpar filtros
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-border/60 bg-card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <p className="px-5 py-8 text-sm text-destructive text-center">{error}</p>
        ) : visible.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <ShoppingCart className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              {hasFilters ? "Nenhuma encomenda corresponde aos filtros." : "Sem encomendas ainda."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[720px]">
              <thead>
                <tr className="border-b border-border/60 bg-muted/30">
                  <th className="pl-4 pr-2 py-2.5 w-8">
                    {pendingVisible.length > 0 && (
                      <input
                        type="checkbox"
                        checked={allPendingSelected}
                        onChange={toggleAllPending}
                        title="Selecionar todos os pendentes"
                        className="accent-primary cursor-pointer"
                      />
                    )}
                  </th>
                  {["Data", "Encomenda", "Utilizador", "Pacote", "Montante", "Método", "Estado", "Fatura"].map((h) => (
                    <th key={h} className="px-4 py-2.5 text-left text-[11px] uppercase tracking-wider text-muted-foreground font-medium whitespace-nowrap">
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
                    <tr
                      key={o.id}
                      className={`border-t border-border/40 hover:bg-muted/20 transition-smooth ${selected.has(o.id) ? "bg-destructive/5" : hasBilling ? "bg-primary/[0.025]" : ""}`}
                    >
                      <td className="pl-4 pr-2 py-3">
                        {o.status === "pending" && (
                          <input
                            type="checkbox"
                            checked={selected.has(o.id)}
                            onChange={() => toggleOrder(o.id)}
                            className="accent-primary cursor-pointer"
                          />
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                        {fmtDate(o.created_at)}
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs">{o.order_id}</span>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground max-w-[150px] truncate">
                        {users[o.user_id] ?? (
                          <span className="opacity-40 font-mono">{o.user_id.slice(0, 8)}…</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs whitespace-nowrap">
                        <span className="font-medium">{o.package}</span>
                        <span className="ml-1 text-muted-foreground">· {o.credits}cr</span>
                      </td>
                      <td className="px-4 py-3 tabular-nums font-medium text-xs whitespace-nowrap">
                        {fmtAmount(o.amount)}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                        {METHOD_LABEL[o.payment_method] ?? o.payment_method}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium whitespace-nowrap ${status.classes}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 min-w-[150px]">
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

        {/* Footer summary */}
        {!loading && !error && visible.length > 0 && (
          <div className="px-5 py-3 border-t border-border/60 flex flex-wrap items-center justify-between gap-2 bg-muted/20">
            <p className="text-xs text-muted-foreground">
              {visible.length} encomenda{visible.length !== 1 ? "s" : ""}
              {hasFilters ? ` (filtradas de ${orders.length})` : ""}
            </p>
            <p className="text-xs text-muted-foreground">
              Pagos:{" "}
              <span className="font-medium text-foreground">
                {fmtAmount(String(paidTotal))}
              </span>
              {" · "}Pendentes:{" "}
              <span className="font-medium text-foreground">
                {visible.filter((o) => o.status === "pending").length}
              </span>
            </p>
          </div>
        )}
      </div>
      {/* Confirm delete dialog */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-2xl shadow-elegant max-w-sm w-full p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-4 h-4 text-destructive" />
              </div>
              <div>
                <h3 className="font-medium text-sm">Eliminar encomendas pendentes</h3>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                  Vai eliminar{" "}
                  <strong className="text-foreground">{selected.size}</strong>{" "}
                  encomenda{selected.size !== 1 ? "s" : ""} com estado <em>Pendente</em>. Esta ação não pode ser desfeita.
                </p>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setConfirmDelete(false)}
                disabled={deleting}
                className="px-4 py-2 rounded-full border border-border text-sm text-muted-foreground hover:text-foreground transition-smooth disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={deleteSelected}
                disabled={deleting}
                className="px-4 py-2 rounded-full bg-destructive text-destructive-foreground text-sm font-medium hover:opacity-90 transition-smooth disabled:opacity-50 flex items-center gap-2"
              >
                {deleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;

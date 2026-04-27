import { useEffect, useState } from "react";
import { Loader2, Plus, Trash2, Ticket } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useCreditPackages } from "@/hooks/useCreditPackages";

type Coupon = {
  id: string;
  code: string;
  discount_type: "percent" | "fixed";
  discount_value: number;
  starts_at: string | null;
  ends_at: string | null;
  max_uses: number | null;
  max_uses_per_user: number | null;
  allowed_package_ids: string[];
  uses_count: number;
  active: boolean;
  notes: string | null;
};

const emptyDraft = {
  code: "",
  discount_type: "percent" as "percent" | "fixed",
  discount_value: 10,
  starts_at: "",
  ends_at: "",
  max_uses: "",
  max_uses_per_user: "1",
  allowed_package_ids: [] as string[],
  active: true,
  notes: "",
};

const toLocalDtInput = (iso: string | null) => {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const fromLocalDtInput = (s: string) => (s ? new Date(s).toISOString() : null);

const AdminCoupons = () => {
  const { packages } = useCreditPackages({ onlyActive: false });
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState(emptyDraft);
  const [creating, setCreating] = useState(false);

  const refetch = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("discount_coupons")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    else setCoupons((data ?? []) as any);
    setLoading(false);
  };

  useEffect(() => {
    refetch();
  }, []);

  const togglePkg = (id: string) => {
    setDraft((d) => ({
      ...d,
      allowed_package_ids: d.allowed_package_ids.includes(id)
        ? d.allowed_package_ids.filter((x) => x !== id)
        : [...d.allowed_package_ids, id],
    }));
  };

  const create = async () => {
    if (!draft.code.trim()) return toast.error("Indique um código.");
    if (!draft.discount_value || draft.discount_value <= 0) return toast.error("Valor de desconto inválido.");
    if (draft.discount_type === "percent" && draft.discount_value > 100)
      return toast.error("Percentagem máxima: 100.");

    setCreating(true);
    const { error } = await supabase.from("discount_coupons").insert({
      code: draft.code.trim().toUpperCase(),
      discount_type: draft.discount_type,
      discount_value: Number(draft.discount_value),
      starts_at: fromLocalDtInput(draft.starts_at),
      ends_at: fromLocalDtInput(draft.ends_at),
      max_uses: draft.max_uses ? Number(draft.max_uses) : null,
      max_uses_per_user: draft.max_uses_per_user ? Number(draft.max_uses_per_user) : null,
      allowed_package_ids: draft.allowed_package_ids,
      active: draft.active,
      notes: draft.notes.trim() || null,
    });
    setCreating(false);
    if (error) return toast.error(error.message);
    toast.success("Cupão criado.");
    setDraft(emptyDraft);
    refetch();
  };

  const toggleActive = async (c: Coupon) => {
    const { error } = await supabase
      .from("discount_coupons")
      .update({ active: !c.active })
      .eq("id", c.id);
    if (error) return toast.error(error.message);
    refetch();
  };

  const remove = async (id: string) => {
    if (!confirm("Eliminar cupão? As redenções associadas também serão removidas.")) return;
    const { error } = await supabase.from("discount_coupons").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Cupão eliminado.");
    refetch();
  };

  const fmtDt = (iso: string | null) =>
    iso ? new Date(iso).toLocaleString("pt-PT", { dateStyle: "short", timeStyle: "short" }) : "—";

  const pkgName = (id: string) => packages.find((p) => p.id === id)?.name ?? id.slice(0, 6);

  return (
    <section className="rounded-2xl border border-border bg-card p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <Ticket className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="font-serif text-xl">Cupões de desconto</h2>
          <p className="text-xs text-muted-foreground">
            Crie cupões com validade, limites de utilização e packs aplicáveis.
          </p>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      ) : coupons.length === 0 ? (
        <p className="text-sm text-muted-foreground py-6 text-center">Sem cupões criados.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-[11px] uppercase tracking-wider text-muted-foreground">
              <tr className="text-left">
                <th className="py-2 pr-3">Código</th>
                <th className="py-2 pr-3">Desconto</th>
                <th className="py-2 pr-3">Validade</th>
                <th className="py-2 pr-3">Usos</th>
                <th className="py-2 pr-3">Packs</th>
                <th className="py-2 pr-3">Ativo</th>
                <th className="py-2"></th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((c) => (
                <tr key={c.id} className="border-t border-border/60 align-top">
                  <td className="py-2 pr-3 font-mono">{c.code}</td>
                  <td className="py-2 pr-3 tabular-nums">
                    {c.discount_type === "percent" ? `-${c.discount_value}%` : `-${c.discount_value} €`}
                  </td>
                  <td className="py-2 pr-3 text-xs text-muted-foreground">
                    {fmtDt(c.starts_at)} → {fmtDt(c.ends_at)}
                  </td>
                  <td className="py-2 pr-3 tabular-nums text-xs">
                    {c.uses_count}
                    {c.max_uses ? ` / ${c.max_uses}` : ""}
                    {c.max_uses_per_user ? ` · ${c.max_uses_per_user}/utilizador` : ""}
                  </td>
                  <td className="py-2 pr-3 text-xs">
                    {c.allowed_package_ids.length === 0
                      ? "Todos"
                      : c.allowed_package_ids.map(pkgName).join(", ")}
                  </td>
                  <td className="py-2 pr-3">
                    <button
                      onClick={() => toggleActive(c)}
                      className={`text-xs px-2 py-1 rounded-full ${
                        c.active ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {c.active ? "Ativo" : "Inativo"}
                    </button>
                  </td>
                  <td className="py-2 text-right">
                    <button
                      onClick={() => remove(c.id)}
                      className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-full border border-border hover:bg-muted"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create */}
      <div className="mt-8 pt-6 border-t border-border">
        <h3 className="text-sm font-medium mb-4">Criar novo cupão</h3>
        <div className="grid md:grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-muted-foreground">Código</label>
            <input
              value={draft.code}
              onChange={(e) => setDraft({ ...draft, code: e.target.value.toUpperCase() })}
              placeholder="Ex.: BEMVINDO20"
              className="w-full mt-1 px-3 py-2 rounded-lg border border-border bg-background text-sm font-mono"
            />
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="text-xs text-muted-foreground">Tipo</label>
              <select
                value={draft.discount_type}
                onChange={(e) => setDraft({ ...draft, discount_type: e.target.value as any })}
                className="w-full mt-1 px-3 py-2 rounded-lg border border-border bg-background text-sm"
              >
                <option value="percent">Percentagem (%)</option>
                <option value="fixed">Valor fixo (€)</option>
              </select>
            </div>
            <div className="w-32">
              <label className="text-xs text-muted-foreground">Valor</label>
              <input
                type="number"
                step="0.01"
                value={draft.discount_value}
                onChange={(e) => setDraft({ ...draft, discount_value: Number(e.target.value) })}
                className="w-full mt-1 px-3 py-2 rounded-lg border border-border bg-background text-sm tabular-nums"
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Início (opcional)</label>
            <input
              type="datetime-local"
              value={draft.starts_at}
              onChange={(e) => setDraft({ ...draft, starts_at: e.target.value })}
              className="w-full mt-1 px-3 py-2 rounded-lg border border-border bg-background text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Fim (opcional)</label>
            <input
              type="datetime-local"
              value={draft.ends_at}
              onChange={(e) => setDraft({ ...draft, ends_at: e.target.value })}
              className="w-full mt-1 px-3 py-2 rounded-lg border border-border bg-background text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Limite total (opcional)</label>
            <input
              type="number"
              value={draft.max_uses}
              onChange={(e) => setDraft({ ...draft, max_uses: e.target.value })}
              placeholder="ilimitado"
              className="w-full mt-1 px-3 py-2 rounded-lg border border-border bg-background text-sm tabular-nums"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Limite por utilizador (opcional)</label>
            <input
              type="number"
              value={draft.max_uses_per_user}
              onChange={(e) => setDraft({ ...draft, max_uses_per_user: e.target.value })}
              placeholder="ilimitado"
              className="w-full mt-1 px-3 py-2 rounded-lg border border-border bg-background text-sm tabular-nums"
            />
          </div>
          <div className="md:col-span-2">
            <label className="text-xs text-muted-foreground">Packs aplicáveis (vazio = todos)</label>
            <div className="mt-2 flex flex-wrap gap-2">
              {packages.map((p) => {
                const on = draft.allowed_package_ids.includes(p.id);
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => togglePkg(p.id)}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-smooth ${
                      on
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-background hover:bg-muted"
                    }`}
                  >
                    {p.name} · {p.credits}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="md:col-span-2">
            <label className="text-xs text-muted-foreground">Notas internas (opcional)</label>
            <input
              value={draft.notes}
              onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
              className="w-full mt-1 px-3 py-2 rounded-lg border border-border bg-background text-sm"
            />
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={draft.active}
              onChange={(e) => setDraft({ ...draft, active: e.target.checked })}
              className="w-4 h-4 accent-primary"
            />
            Ativo desde já
          </label>
          <button
            onClick={create}
            disabled={creating}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50"
          >
            {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Criar cupão
          </button>
        </div>
      </div>
    </section>
  );
};

export default AdminCoupons;

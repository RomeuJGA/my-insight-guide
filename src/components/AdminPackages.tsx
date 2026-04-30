import { useState } from "react";
import { Loader2, Plus, Trash2, Save, Package } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useCreditPackages, formatEur, type CreditPackage } from "@/hooks/useCreditPackages";

type Editable = Partial<CreditPackage> & { id?: string };

const emptyDraft: Editable = {
  name: "",
  credits: 5,
  price_eur: 4.9,
  badge: "",
  display_order: 0,
  active: true,
};

const AdminPackages = () => {
  const { packages, loading, refetch } = useCreditPackages({ onlyActive: false });
  const [drafts, setDrafts] = useState<Record<string, Editable>>({});
  const [newPkg, setNewPkg] = useState<Editable>(emptyDraft);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const setField = (id: string, field: keyof Editable, value: string | number | boolean | null) => {
    setDrafts((d) => ({ ...d, [id]: { ...packages.find((p) => p.id === id), ...d[id], [field]: value } }));
  };

  const save = async (id: string) => {
    const draft = drafts[id];
    if (!draft) return;
    setSavingId(id);
    const { error } = await supabase
      .from("credit_packages")
      .update({
        name: draft.name,
        credits: Number(draft.credits),
        price_eur: Number(draft.price_eur),
        badge: draft.badge?.toString().trim() || null,
        display_order: Number(draft.display_order ?? 0),
        active: !!draft.active,
      })
      .eq("id", id);
    setSavingId(null);
    if (error) return toast.error(error.message);
    toast.success("Pack atualizado.");
    setDrafts((d) => {
      const { [id]: _, ...rest } = d;
      return rest;
    });
    refetch();
  };

  const remove = async (id: string) => {
    if (!confirm("Eliminar este pack? Esta ação não pode ser revertida.")) return;
    const { error } = await supabase.from("credit_packages").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Pack eliminado.");
    refetch();
  };

  const create = async () => {
    if (!newPkg.name || !newPkg.credits || !newPkg.price_eur) {
      return toast.error("Preencha nome, créditos e preço.");
    }
    setCreating(true);
    const { error } = await supabase.from("credit_packages").insert({
      name: newPkg.name,
      credits: Number(newPkg.credits),
      price_eur: Number(newPkg.price_eur),
      badge: newPkg.badge?.toString().trim() || null,
      display_order: Number(newPkg.display_order ?? 0),
      active: !!newPkg.active,
    });
    setCreating(false);
    if (error) return toast.error(error.message);
    toast.success("Pack criado.");
    setNewPkg(emptyDraft);
    refetch();
  };

  return (
    <section className="rounded-2xl border border-border bg-card p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <Package className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="font-serif text-xl">Packs de créditos</h2>
          <p className="text-xs text-muted-foreground">Defina nome, número de créditos, preço e ordem.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-[11px] uppercase tracking-wider text-muted-foreground">
              <tr className="text-left">
                <th className="py-2 pr-3">Nome</th>
                <th className="py-2 pr-3">Créditos</th>
                <th className="py-2 pr-3">Preço (€)</th>
                <th className="py-2 pr-3">Etiqueta</th>
                <th className="py-2 pr-3">Ordem</th>
                <th className="py-2 pr-3">Ativo</th>
                <th className="py-2"></th>
              </tr>
            </thead>
            <tbody>
              {packages.map((p) => {
                const d: Editable = { ...p, ...(drafts[p.id] ?? {}) };
                const dirty = !!drafts[p.id];
                return (
                  <tr key={p.id} className="border-t border-border/60">
                    <td className="py-2 pr-3">
                      <input
                        value={d.name ?? ""}
                        onChange={(e) => setField(p.id, "name", e.target.value)}
                        className="w-32 px-2 py-1 rounded-md border border-border bg-background"
                      />
                    </td>
                    <td className="py-2 pr-3">
                      <input
                        type="number"
                        min={1}
                        value={d.credits ?? 0}
                        onChange={(e) => setField(p.id, "credits", e.target.value)}
                        className="w-20 px-2 py-1 rounded-md border border-border bg-background tabular-nums"
                      />
                    </td>
                    <td className="py-2 pr-3">
                      <input
                        type="number"
                        step="0.01"
                        min={0}
                        value={d.price_eur ?? 0}
                        onChange={(e) => setField(p.id, "price_eur", e.target.value)}
                        className="w-24 px-2 py-1 rounded-md border border-border bg-background tabular-nums"
                      />
                    </td>
                    <td className="py-2 pr-3">
                      <input
                        value={d.badge ?? ""}
                        placeholder="(opcional)"
                        onChange={(e) => setField(p.id, "badge", e.target.value)}
                        className="w-28 px-2 py-1 rounded-md border border-border bg-background"
                      />
                    </td>
                    <td className="py-2 pr-3">
                      <input
                        type="number"
                        value={d.display_order ?? 0}
                        onChange={(e) => setField(p.id, "display_order", e.target.value)}
                        className="w-16 px-2 py-1 rounded-md border border-border bg-background tabular-nums"
                      />
                    </td>
                    <td className="py-2 pr-3">
                      <input
                        type="checkbox"
                        checked={!!d.active}
                        onChange={(e) => setField(p.id, "active", e.target.checked)}
                        className="w-4 h-4 accent-primary"
                      />
                    </td>
                    <td className="py-2">
                      <div className="flex items-center gap-2 justify-end">
                        {dirty && (
                          <button
                            onClick={() => save(p.id)}
                            disabled={savingId === p.id}
                            className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-full bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50"
                          >
                            {savingId === p.id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <Save className="w-3 h-3" />
                            )}
                            Guardar
                          </button>
                        )}
                        <button
                          onClick={() => remove(p.id)}
                          className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-full border border-border hover:bg-muted"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Create new */}
      <div className="mt-8 pt-6 border-t border-border">
        <h3 className="text-sm font-medium mb-3">Criar novo pack</h3>
        <div className="grid sm:grid-cols-6 gap-2">
          <input
            placeholder="Nome"
            value={newPkg.name ?? ""}
            onChange={(e) => setNewPkg({ ...newPkg, name: e.target.value })}
            className="sm:col-span-2 px-3 py-2 rounded-lg border border-border bg-background text-sm"
          />
          <input
            type="number"
            placeholder="Créditos"
            value={newPkg.credits ?? ""}
            onChange={(e) => setNewPkg({ ...newPkg, credits: Number(e.target.value) })}
            className="px-3 py-2 rounded-lg border border-border bg-background text-sm tabular-nums"
          />
          <input
            type="number"
            step="0.01"
            placeholder="Preço €"
            value={newPkg.price_eur ?? ""}
            onChange={(e) => setNewPkg({ ...newPkg, price_eur: Number(e.target.value) })}
            className="px-3 py-2 rounded-lg border border-border bg-background text-sm tabular-nums"
          />
          <input
            placeholder="Etiqueta"
            value={newPkg.badge ?? ""}
            onChange={(e) => setNewPkg({ ...newPkg, badge: e.target.value })}
            className="px-3 py-2 rounded-lg border border-border bg-background text-sm"
          />
          <button
            onClick={create}
            disabled={creating}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50"
          >
            {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Criar
          </button>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Pré-visualização: <strong>{newPkg.credits || 0} créditos</strong> ·{" "}
          {formatEur(Number(newPkg.price_eur) || 0)}
        </p>
      </div>
    </section>
  );
};

export default AdminPackages;

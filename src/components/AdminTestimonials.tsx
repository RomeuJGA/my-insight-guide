import { useState } from "react";
import { Loader2, Plus, Trash2, Save, MessageSquareQuote, Star, Check, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useTestimonials, type Testimonial } from "@/hooks/useTestimonials";

type Editable = Partial<Testimonial>;

const emptyDraft: Editable = {
  quote: "",
  author: "",
  role: "",
  rating: 5,
  display_order: 0,
  active: true,
  status: "approved",
};

const StarDisplay = ({ rating }: { rating: number }) => (
  <span className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((n) => (
      <Star key={n} className={`w-3 h-3 ${n <= rating ? "text-accent fill-accent" : "text-muted-foreground"}`} />
    ))}
  </span>
);

const AdminTestimonials = () => {
  const { testimonials, loading, refetch } = useTestimonials({ onlyActive: false });
  const [drafts, setDrafts] = useState<Record<string, Editable>>({});
  const [newItem, setNewItem] = useState<Editable>(emptyDraft);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const pending   = testimonials.filter((t) => t.status === "pending");
  const rest      = testimonials.filter((t) => t.status !== "pending");

  const setField = (id: string, field: keyof Editable, value: string | number | boolean | null) => {
    setDrafts((d) => ({
      ...d,
      [id]: { ...testimonials.find((t) => t.id === id), ...d[id], [field]: value },
    }));
  };

  const save = async (id: string) => {
    const draft = drafts[id];
    if (!draft) return;
    if (!draft.quote?.toString().trim() || !draft.author?.toString().trim()) {
      return toast.error("Frase e autor são obrigatórios.");
    }
    setSavingId(id);
    const { error } = await supabase
      .from("testimonials")
      .update({
        quote: draft.quote!.toString().trim(),
        author: draft.author!.toString().trim(),
        role: draft.role?.toString().trim() || null,
        rating: Math.max(1, Math.min(5, Number(draft.rating ?? 5))),
        display_order: Number(draft.display_order ?? 0),
        active: !!draft.active,
        status: draft.status ?? "approved",
      })
      .eq("id", id);
    setSavingId(null);
    if (error) return toast.error(error.message);
    toast.success("Testemunho atualizado.");
    setDrafts((d) => {
      const { [id]: _, ...rest } = d;
      return rest;
    });
    refetch();
  };

  const remove = async (id: string) => {
    if (!confirm("Eliminar este testemunho?")) return;
    const { error } = await supabase.from("testimonials").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Testemunho eliminado.");
    refetch();
  };

  const approve = async (id: string) => {
    setSavingId(id);
    const { error } = await supabase
      .from("testimonials")
      .update({ status: "approved", active: true })
      .eq("id", id);
    setSavingId(null);
    if (error) return toast.error(error.message);
    toast.success("Testemunho aprovado e publicado.");
    refetch();
  };

  const reject = async (id: string) => {
    setSavingId(id);
    const { error } = await supabase
      .from("testimonials")
      .update({ status: "rejected", active: false })
      .eq("id", id);
    setSavingId(null);
    if (error) return toast.error(error.message);
    toast.success("Testemunho rejeitado.");
    refetch();
  };

  const create = async () => {
    if (!newItem.quote?.toString().trim() || !newItem.author?.toString().trim()) {
      return toast.error("Preencha pelo menos a frase e o autor.");
    }
    setCreating(true);
    const { error } = await supabase.from("testimonials").insert({
      quote: newItem.quote!.toString().trim(),
      author: newItem.author!.toString().trim(),
      role: newItem.role?.toString().trim() || null,
      rating: Math.max(1, Math.min(5, Number(newItem.rating ?? 5))),
      display_order: Number(newItem.display_order ?? 0),
      active: !!newItem.active,
      status: "approved",
    });
    setCreating(false);
    if (error) return toast.error(error.message);
    toast.success("Testemunho criado.");
    setNewItem(emptyDraft);
    refetch();
  };

  return (
    <section className="space-y-8">
      {/* Pending approvals */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center">
            <MessageSquareQuote className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <h2 className="font-serif text-xl">Pendentes</h2>
            <p className="text-xs text-muted-foreground">
              Testemunhos submetidos por utilizadores — aguardam aprovação.
            </p>
          </div>
          {pending.length > 0 && (
            <span className="ml-auto inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-500 text-white text-xs font-bold">
              {pending.length}
            </span>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : pending.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">Sem testemunhos pendentes.</p>
        ) : (
          <ul className="space-y-3">
            {pending.map((t) => (
              <li key={t.id} className="rounded-xl border border-amber-200/60 bg-amber-50/40 dark:bg-amber-900/10 p-4 space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1 flex-1">
                    <p className="text-sm leading-relaxed">"{t.quote}"</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="font-medium text-foreground">{t.author}</span>
                      {t.role && <span>· {t.role}</span>}
                      <StarDisplay rating={t.rating} />
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => approve(t.id)}
                    disabled={savingId === t.id}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 disabled:opacity-50"
                  >
                    {savingId === t.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                    Aprovar
                  </button>
                  <button
                    onClick={() => reject(t.id)}
                    disabled={savingId === t.id}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border text-xs hover:bg-muted disabled:opacity-50"
                  >
                    <X className="w-3 h-3" />
                    Rejeitar
                  </button>
                  <button
                    onClick={() => remove(t.id)}
                    className="inline-flex items-center gap-1 text-xs px-2 py-1.5 rounded-full text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* All testimonials */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <MessageSquareQuote className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="font-serif text-xl">Testemunhos</h2>
            <p className="text-xs text-muted-foreground">
              Gere os depoimentos mostrados na página inicial.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : rest.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">Sem testemunhos.</p>
        ) : (
          <ul className="space-y-4">
            {rest.map((t) => {
              const d: Editable = { ...t, ...(drafts[t.id] ?? {}) };
              const dirty = !!drafts[t.id];
              return (
                <li key={t.id} className="rounded-xl border border-border/60 bg-background p-4 space-y-3">
                  {t.status === "rejected" && (
                    <span className="inline-block text-xs px-2 py-0.5 rounded-full bg-destructive/10 text-destructive">
                      Rejeitado
                    </span>
                  )}
                  <textarea
                    value={d.quote ?? ""}
                    onChange={(e) => setField(t.id, "quote", e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm resize-y"
                    placeholder="Frase do testemunho"
                  />
                  <div className="grid sm:grid-cols-5 gap-2">
                    <input
                      value={d.author ?? ""}
                      onChange={(e) => setField(t.id, "author", e.target.value)}
                      placeholder="Autor"
                      className="sm:col-span-2 px-3 py-2 rounded-lg border border-border bg-background text-sm"
                    />
                    <input
                      value={d.role ?? ""}
                      onChange={(e) => setField(t.id, "role", e.target.value)}
                      placeholder="Localização / cargo"
                      className="sm:col-span-2 px-3 py-2 rounded-lg border border-border bg-background text-sm"
                    />
                    <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border bg-background">
                      <Star className="w-3.5 h-3.5 text-accent fill-accent" />
                      <input
                        type="number"
                        min={1}
                        max={5}
                        value={d.rating ?? 5}
                        onChange={(e) => setField(t.id, "rating", Number(e.target.value))}
                        className="w-12 bg-transparent text-sm tabular-nums focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <label className="flex items-center gap-1.5">
                        Ordem
                        <input
                          type="number"
                          value={d.display_order ?? 0}
                          onChange={(e) => setField(t.id, "display_order", Number(e.target.value))}
                          className="w-16 px-2 py-1 rounded-md border border-border bg-background tabular-nums"
                        />
                      </label>
                      <label className="flex items-center gap-1.5">
                        <input
                          type="checkbox"
                          checked={!!d.active}
                          onChange={(e) => setField(t.id, "active", e.target.checked)}
                          className="w-4 h-4 accent-primary"
                        />
                        Visível no site
                      </label>
                    </div>
                    <div className="flex items-center gap-2">
                      {dirty && (
                        <button
                          onClick={() => save(t.id)}
                          disabled={savingId === t.id}
                          className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-full bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50"
                        >
                          {savingId === t.id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Save className="w-3 h-3" />
                          )}
                          Guardar
                        </button>
                      )}
                      <button
                        onClick={() => remove(t.id)}
                        className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-full border border-border hover:bg-muted"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        {/* New */}
        <div className="mt-8 pt-6 border-t border-border">
          <h3 className="text-sm font-medium mb-3">Adicionar testemunho</h3>
          <div className="space-y-2">
            <textarea
              placeholder="Frase do testemunho"
              value={newItem.quote ?? ""}
              onChange={(e) => setNewItem({ ...newItem, quote: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm resize-y"
            />
            <div className="grid sm:grid-cols-6 gap-2">
              <input
                placeholder="Autor (ex.: Mariana S.)"
                value={newItem.author ?? ""}
                onChange={(e) => setNewItem({ ...newItem, author: e.target.value })}
                className="sm:col-span-2 px-3 py-2 rounded-lg border border-border bg-background text-sm"
              />
              <input
                placeholder="Localização / cargo (opcional)"
                value={newItem.role ?? ""}
                onChange={(e) => setNewItem({ ...newItem, role: e.target.value })}
                className="sm:col-span-2 px-3 py-2 rounded-lg border border-border bg-background text-sm"
              />
              <input
                type="number"
                min={1}
                max={5}
                placeholder="Estrelas"
                value={newItem.rating ?? 5}
                onChange={(e) => setNewItem({ ...newItem, rating: Number(e.target.value) })}
                className="px-3 py-2 rounded-lg border border-border bg-background text-sm tabular-nums"
              />
              <button
                onClick={create}
                disabled={creating}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50"
              >
                {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Adicionar
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AdminTestimonials;

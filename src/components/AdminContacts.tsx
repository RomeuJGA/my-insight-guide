import { useEffect, useState } from "react";
import { Loader2, Mail, Calendar, CheckCheck, Eye, Inbox } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type ContactRequest = {
  id: string;
  name: string;
  email: string;
  subject: "general" | "consultation";
  message: string;
  preferred_date: string | null;
  preferred_time: string | null;
  status: "new" | "read" | "replied";
  created_at: string;
};

const STATUS_LABELS: Record<string, string> = {
  new: "Novo",
  read: "Lido",
  replied: "Respondido",
};

const STATUS_CLASSES: Record<string, string> = {
  new: "bg-primary/10 text-primary",
  read: "bg-muted text-muted-foreground",
  replied: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
};

const AdminContacts = () => {
  const [items, setItems] = useState<ContactRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("contact_requests")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    else setItems((data ?? []) as ContactRequest[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (id: string, status: ContactRequest["status"]) => {
    setUpdating(id);
    const { error } = await supabase
      .from("contact_requests")
      .update({ status })
      .eq("id", id);
    setUpdating(null);
    if (error) { toast.error(error.message); return; }
    setItems((prev) => prev.map((r) => r.id === id ? { ...r, status } : r));
  };

  const toggle = async (item: ContactRequest) => {
    if (expanded === item.id) {
      setExpanded(null);
    } else {
      setExpanded(item.id);
      if (item.status === "new") await updateStatus(item.id, "read");
    }
  };

  const fmt = (iso: string) =>
    new Date(iso).toLocaleString("pt-PT", { dateStyle: "short", timeStyle: "short" });

  const newCount = items.filter((r) => r.status === "new").length;

  return (
    <section className="rounded-2xl border border-border bg-card p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center relative">
          <Inbox className="w-5 h-5 text-primary" />
          {newCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
              {newCount}
            </span>
          )}
        </div>
        <div>
          <h2 className="font-serif text-xl">Contactos</h2>
          <p className="text-xs text-muted-foreground">Mensagens e pedidos de marcação recebidos.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      ) : items.length === 0 ? (
        <p className="text-sm text-muted-foreground py-6 text-center">Sem contactos recebidos.</p>
      ) : (
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={item.id} className="rounded-xl border border-border/60 overflow-hidden">
              {/* Row */}
              <button
                type="button"
                onClick={() => toggle(item)}
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-muted/50 transition-smooth"
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  item.subject === "consultation" ? "bg-accent/20" : "bg-muted"
                }`}>
                  {item.subject === "consultation"
                    ? <Calendar className="w-3.5 h-3.5 text-accent-foreground" />
                    : <Mail className="w-3.5 h-3.5 text-muted-foreground" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-medium ${item.status === "new" ? "text-foreground" : "text-foreground/80"}`}>
                      {item.name}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${STATUS_CLASSES[item.status]}`}>
                      {STATUS_LABELS[item.status]}
                    </span>
                    {item.subject === "consultation" && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent/20 text-accent-foreground font-medium">
                        Consulta
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{item.email} · {fmt(item.created_at)}</p>
                </div>
                <Eye className="w-4 h-4 text-muted-foreground shrink-0" />
              </button>

              {/* Expanded */}
              {expanded === item.id && (
                <div className="px-4 pb-4 pt-1 border-t border-border/60 bg-background space-y-4">
                  {item.subject === "consultation" && item.preferred_date && (
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-primary shrink-0" />
                      <span>
                        <strong>Data preferida:</strong> {item.preferred_date}
                        {item.preferred_time && <> · <strong>Horário:</strong> {item.preferred_time}</>}
                      </span>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5">Mensagem</p>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground/80">{item.message}</p>
                  </div>
                  <div className="flex items-center gap-2 pt-2 border-t border-border/60">
                    <a
                      href={`mailto:${item.email}?subject=Re: Um Ävatar`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 transition-smooth"
                    >
                      <Mail className="w-3 h-3" />
                      Responder por email
                    </a>
                    {item.status !== "replied" && (
                      <button
                        onClick={() => updateStatus(item.id, "replied")}
                        disabled={updating === item.id}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border text-xs hover:bg-muted transition-smooth disabled:opacity-50"
                      >
                        {updating === item.id
                          ? <Loader2 className="w-3 h-3 animate-spin" />
                          : <CheckCheck className="w-3 h-3" />}
                        Marcar como respondido
                      </button>
                    )}
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default AdminContacts;

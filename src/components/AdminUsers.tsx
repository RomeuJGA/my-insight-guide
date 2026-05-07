import { useEffect, useState } from "react";
import { Loader2, Users, RefreshCw, Plus, Minus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type User = {
  id: string;
  email: string;
  credits: number;
  creditsUpdatedAt: string | null;
  createdAt: string;
  lastSignIn: string | null;
};

const AdminUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [adjusting, setAdjusting] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase.functions.invoke("admin-list-users");
      if (err) throw err;
      if (data?.error) throw new Error(data.error);
      setUsers(data?.users ?? []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erro ao carregar utilizadores.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const adjust = async (userId: string, sign: 1 | -1) => {
    setAdjusting(userId);
    try {
      const { data, error: err } = await supabase.functions.invoke("admin-credits", {
        body: { user_id: userId, amount: sign, description: "Ajuste rápido" },
      });
      if (err) {
        let msg = "Erro ao ajustar.";
        try { const b = await (err as { context?: Response }).context?.json(); if (b?.error) msg = b.error; } catch {}
        setError(msg);
        return;
      }
      if (data?.error) { setError(data.error); return; }
      setUsers((prev) =>
        prev.map((u) => u.id === userId ? { ...u, credits: data?.credits ?? u.credits } : u)
      );
    } finally {
      setAdjusting(null);
    }
  };

  const filtered = users.filter((u) =>
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-primary" />
          <h2 className="font-medium">Utilizadores</h2>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="p-1.5 rounded-lg hover:bg-muted transition-smooth disabled:opacity-40"
          title="Atualizar"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-muted-foreground ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>
      <p className="text-xs text-muted-foreground mb-4">
        {users.length} utilizador{users.length !== 1 ? "es" : ""} registados
      </p>

      <input
        type="text"
        placeholder="Filtrar por email…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/40 mb-4"
      />

      {error && (
        <p className="text-xs text-destructive mb-3">{error}</p>
      )}

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-6">
          {search ? "Nenhum resultado." : "Sem utilizadores."}
        </p>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/40 text-xs text-muted-foreground uppercase tracking-wide">
                <th className="px-4 py-2 text-left font-medium">Email</th>
                <th className="px-4 py-2 text-right font-medium">Créditos</th>
                <th className="px-4 py-2 text-right font-medium sr-only">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id} className="border-t border-border hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-2.5 truncate max-w-[200px]">
                    <span className="font-mono text-xs text-foreground">{u.email}</span>
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <span className={`font-medium tabular-nums ${u.credits > 0 ? "text-primary" : "text-muted-foreground"}`}>
                      {u.credits}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <div className="inline-flex items-center gap-1">
                      <button
                        onClick={() => adjust(u.id, 1)}
                        disabled={adjusting === u.id}
                        className="p-1 rounded hover:bg-primary/10 text-primary transition-smooth disabled:opacity-40"
                        title="Adicionar 1 crédito"
                      >
                        {adjusting === u.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
                      </button>
                      <button
                        onClick={() => adjust(u.id, -1)}
                        disabled={adjusting === u.id || u.credits === 0}
                        className="p-1 rounded hover:bg-muted text-muted-foreground transition-smooth disabled:opacity-40"
                        title="Remover 1 crédito"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;

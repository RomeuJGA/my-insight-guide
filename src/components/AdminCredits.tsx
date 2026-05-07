import { useState } from "react";
import { Loader2, UserCog, Plus, Minus, CheckCircle2, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type Result = { ok: true; credits: number } | { ok: false; message: string };

const AdminCredits = () => {
  const [userId, setUserId] = useState("");
  const [amount, setAmount] = useState<string>("5");
  const [description, setDescription] = useState("Ajuste manual");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  const submit = async (sign: 1 | -1) => {
    if (busy) return;
    const trimmedId = userId.trim();
    const n = parseInt(amount, 10);
    setResult(null);
    if (!trimmedId) { setResult({ ok: false, message: "Indique o email ou UUID do utilizador." }); return; }
    if (!Number.isInteger(n) || n <= 0) { setResult({ ok: false, message: "Quantidade inválida." }); return; }

    setBusy(true);
    try {
      const { data, error } = await supabase.functions.invoke("admin-credits", {
        body: {
          user_id: trimmedId,
          amount: sign * n,
          description: description || (sign > 0 ? "Crédito manual" : "Débito manual"),
        },
      });

      if (error) {
        let msg = "Erro ao ajustar créditos.";
        try {
          const body = await (error as { context?: Response }).context?.json();
          if (body?.error) msg = body.error;
        } catch {}
        setResult({ ok: false, message: msg });
        return;
      }

      if (data?.error) {
        setResult({ ok: false, message: data.error });
        return;
      }

      setResult({ ok: true, credits: data?.credits ?? 0 });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro inesperado.";
      setResult({ ok: false, message: msg });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <div className="flex items-center gap-2 mb-1">
        <UserCog className="w-4 h-4 text-primary" />
        <h2 className="font-medium">Gestão de créditos</h2>
      </div>
      <p className="text-xs text-muted-foreground mb-5">
        Adicione ou remova créditos a um utilizador específico.
      </p>

      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">
            Utilizador (UUID ou email)
          </label>
          <input
            type="text"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="email@exemplo.com ou uuid"
            className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/40"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Quantidade</label>
            <input
              type="number"
              min={1}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/40"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Descrição</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/40"
            />
          </div>
        </div>

        <div className="flex gap-2 pt-1">
          <button
            type="button"
            onClick={() => submit(1)}
            disabled={busy}
            className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-smooth disabled:opacity-60"
          >
            {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
            Adicionar
          </button>
          <button
            type="button"
            onClick={() => submit(-1)}
            disabled={busy}
            className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-full border border-border hover:bg-muted text-sm font-medium transition-smooth disabled:opacity-60"
          >
            {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Minus className="w-3.5 h-3.5" />}
            Remover
          </button>
        </div>

        {result && (
          <div className={`flex items-start gap-2 rounded-lg px-3 py-2.5 text-sm mt-1 ${result.ok ? "bg-green-50 text-green-800 border border-green-200" : "bg-red-50 text-red-800 border border-red-200"}`}>
            {result.ok
              ? <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
              : <XCircle className="w-4 h-4 mt-0.5 shrink-0" />}
            <span>
              {result.ok
                ? `Feito. Saldo actual: ${result.credits} crédito${result.credits !== 1 ? "s" : ""}.`
                : result.message}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCredits;

import { useCallback, useMemo, useRef, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import {
  Upload, FileText, CheckCircle2, AlertTriangle, Loader2,
  ShoppingCart, Package, Ticket, Users, Coins, BarChart2,
  Star, ArrowLeft, MessageSquare,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import AdminCredits from "@/components/AdminCredits";
import AdminUsers from "@/components/AdminUsers";
import AdminAnalytics from "@/components/AdminAnalytics";
import AdminPackages from "@/components/AdminPackages";
import AdminCoupons from "@/components/AdminCoupons";
import AdminTestimonials from "@/components/AdminTestimonials";
import AdminOrders from "@/components/AdminOrders";
import Footer from "@/components/Footer";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Progress } from "@/components/ui/progress";

const MIN_ID = 1;
const MAX_ID = 534;

type ParsedRow = { id: number; content: string };
type ParseResult =
  | { ok: true; rows: ParsedRow[]; error?: undefined }
  | { ok: false; error: string; rows?: undefined };

function parseCsv(text: string): ParseResult {
  // Robust CSV parser supporting quoted fields, escaped quotes and newlines in quotes.
  const rows: string[][] = [];
  let field = "";
  let row: string[] = [];
  let inQuotes = false;
  let i = 0;
  const src = text.replace(/^\uFEFF/, ""); // strip BOM

  while (i < src.length) {
    const c = src[i];
    if (inQuotes) {
      if (c === '"') {
        if (src[i + 1] === '"') {
          field += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i++;
        continue;
      }
      field += c;
      i++;
      continue;
    }
    if (c === '"') {
      inQuotes = true;
      i++;
      continue;
    }
    if (c === ",") {
      row.push(field);
      field = "";
      i++;
      continue;
    }
    if (c === "\r") {
      i++;
      continue;
    }
    if (c === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
      i++;
      continue;
    }
    field += c;
    i++;
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  // Drop trailing empty rows
  while (rows.length > 0 && rows[rows.length - 1].every((v) => v.trim() === "")) {
    rows.pop();
  }

  if (rows.length === 0) return { ok: false, error: "Ficheiro CSV vazio." };

  const header = rows[0].map((h) => h.trim().toLowerCase());
  if (header.length !== 2 || header[0] !== "id" || header[1] !== "content") {
    return {
      ok: false,
      error: 'O CSV deve conter exatamente as colunas: "id" e "content".',
    };
  }

  const parsed: ParsedRow[] = [];
  const seen = new Set<number>();

  for (let r = 1; r < rows.length; r++) {
    const cols = rows[r];
    if (cols.length === 1 && cols[0].trim() === "") continue;
    if (cols.length !== 2) {
      return { ok: false, error: `Linha ${r + 1}: número de colunas inválido (esperado 2).` };
    }
    const idRaw = cols[0].trim();
    const content = cols[1];
    if (!/^-?\d+$/.test(idRaw)) {
      return { ok: false, error: `Linha ${r + 1}: id "${idRaw}" não é um inteiro.` };
    }
    const id = parseInt(idRaw, 10);
    if (id < MIN_ID || id > MAX_ID) {
      return {
        ok: false,
        error: `Linha ${r + 1}: id ${id} fora do intervalo permitido (${MIN_ID}–${MAX_ID}).`,
      };
    }
    if (seen.has(id)) {
      return { ok: false, error: `Linha ${r + 1}: id duplicado (${id}).` };
    }
    if (!content || content.trim() === "") {
      return { ok: false, error: `Linha ${r + 1}: conteúdo vazio.` };
    }
    seen.add(id);
    parsed.push({ id, content });
  }

  if (parsed.length === 0) {
    return { ok: false, error: "Nenhuma linha de dados encontrada." };
  }

  return { ok: true, rows: parsed };
}

const Admin = () => {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: roleLoading } = useIsAdmin();

  const [active, setActive] = useState("encomendas");
  const [fileName, setFileName] = useState<string | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [rows, setRows] = useState<ParsedRow[] | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [lastImportCount, setLastImportCount] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const sections = [
    { id: "encomendas",   label: "Encomendas",   Icon: ShoppingCart },
    { id: "utilizadores", label: "Utilizadores",  Icon: Users },
    { id: "creditos",     label: "Créditos",      Icon: Coins },
    { id: "packs",        label: "Packs",         Icon: Package },
    { id: "cupoes",       label: "Cupões",        Icon: Ticket },
    { id: "analytics",   label: "Analytics",     Icon: BarChart2 },
    { id: "testemunhos",  label: "Testemunhos",   Icon: Star },
    { id: "mensagens",    label: "Mensagens",     Icon: MessageSquare },
  ] as const;

  const handleFile = useCallback(async (file: File) => {
    setParseError(null);
    setRows(null);
    setLastImportCount(null);
    setFileName(file.name);

    if (!file.name.toLowerCase().endsWith(".csv")) {
      setParseError("O ficheiro deve ter extensão .csv");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setParseError("Ficheiro demasiado grande (máx. 5MB).");
      return;
    }

    const text = await file.text();
    const result = parseCsv(text);
    if (!result.ok) {
      setParseError(result.error);
      return;
    }
    setRows(result.rows);
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent<HTMLLabelElement>) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  const runImport = useCallback(async () => {
    if (!rows) return;
    setImporting(true);
    setProgress(15);
    try {
      // Simulate smooth progress while the RPC runs
      const tick = setInterval(() => {
        setProgress((p) => (p < 85 ? p + 5 : p));
      }, 150);

      const { data, error } = await supabase.rpc("replace_all_messages", {
        _rows: rows as unknown as never,
      });

      clearInterval(tick);
      setProgress(100);

      if (error) {
        toast.error(`Erro na importação: ${error.message}`);
        return;
      }

      const count = typeof data === "number" ? data : rows.length;
      setLastImportCount(count);
      toast.success(`${count} mensagens importadas com sucesso.`);
      setRows(null);
      setFileName(null);
      if (inputRef.current) inputRef.current.value = "";
    } catch (e) {
      toast.error(`Erro inesperado: ${(e as Error).message}`);
    } finally {
      setTimeout(() => {
        setImporting(false);
        setProgress(0);
      }, 400);
    }
  }, [rows]);

  const previewRows = useMemo(() => rows?.slice(0, 5) ?? [], [rows]);

  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <div className="flex-1 flex items-center justify-center px-6">
        <div className="max-w-md text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-destructive/10 text-destructive mx-auto flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h1 className="font-serif text-2xl">Acesso restrito</h1>
          <p className="text-muted-foreground text-sm">
            Esta área é apenas para administradores.
          </p>
          <Link
            to="/"
            className="inline-block text-sm font-medium px-4 py-2 rounded-full bg-primary text-primary-foreground hover:opacity-90 transition-smooth"
          >
            Voltar ao início
          </Link>
        </div>
        </div>
        <Footer />
      </div>
    );
  }

  const activeLabel = sections.find((s) => s.id === active)?.label ?? "";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar */}
      <header className="fixed top-0 left-0 right-0 z-40 h-14 border-b border-border/60 bg-background/95 backdrop-blur flex items-center px-4 gap-4">
        <span className="font-serif text-lg text-primary tracking-tight">Ä</span>
        <span className="text-xs uppercase tracking-widest text-muted-foreground">Admin</span>
        <span className="text-border/60 select-none">·</span>
        <span className="text-sm font-medium">{activeLabel}</span>
        <Link
          to="/"
          className="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-smooth"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Sair
        </Link>
      </header>

      <div className="flex flex-1 pt-14">
        {/* Sidebar — desktop */}
        <aside className="hidden md:flex flex-col w-48 shrink-0 border-r border-border/60 fixed left-0 top-14 h-[calc(100vh-3.5rem)] overflow-y-auto py-4 px-2">
          <nav className="flex flex-col gap-0.5">
            {sections.map(({ id, label, Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setActive(id)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-left transition-smooth ${
                  active === id
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Mobile tab strip */}
        <div className="md:hidden fixed top-14 left-0 right-0 z-30 bg-background border-b border-border/60 overflow-x-auto">
          <div className="flex gap-1 px-3 py-2 min-w-max">
            {sections.map(({ id, label, Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setActive(id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs whitespace-nowrap transition-smooth ${
                  active === id
                    ? "bg-primary text-primary-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <main className="flex-1 md:ml-48 px-6 py-8 md:py-10 mt-10 md:mt-0 min-h-[calc(100vh-3.5rem)] max-w-4xl">
          {active === "encomendas" && <AdminOrders />}
          {active === "utilizadores" && <AdminUsers />}
          {active === "creditos" && <AdminCredits />}
          {active === "packs" && <AdminPackages />}
          {active === "cupoes" && <AdminCoupons />}
          {active === "analytics" && <AdminAnalytics />}
          {active === "testemunhos" && <AdminTestimonials />}
          {active === "mensagens" && (
            <div>
              <div className="mb-8">
                <h2 className="font-serif text-2xl md:text-3xl tracking-tight mb-1">Importar mensagens</h2>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Carregue um CSV com as colunas{" "}
                  <code className="px-1.5 py-0.5 rounded bg-muted text-xs">id</code> e{" "}
                  <code className="px-1.5 py-0.5 rounded bg-muted text-xs">content</code>.{" "}
                  Esta ação substitui todas as mensagens existentes.
                </p>
              </div>

              <label
                htmlFor="csv-input"
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={onDrop}
                className={`block cursor-pointer rounded-2xl border-2 border-dashed p-10 text-center transition-smooth ${
                  isDragging
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50 hover:bg-muted/30"
                }`}
              >
                <input
                  id="csv-input"
                  ref={inputRef}
                  type="file"
                  accept=".csv,text/csv"
                  className="sr-only"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
                />
                <div className="w-12 h-12 mx-auto rounded-full bg-muted flex items-center justify-center mb-4">
                  <Upload className="w-5 h-5 text-muted-foreground" />
                </div>
                <p className="font-medium">Arraste o CSV ou clique para selecionar</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Apenas .csv · até 5MB · ids entre {MIN_ID} e {MAX_ID}
                </p>
              </label>

              {fileName && (
                <div className="mt-6 rounded-xl border border-border bg-card p-4 flex items-start gap-3">
                  <FileText className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{fileName}</p>
                    {rows && <p className="text-xs text-muted-foreground mt-0.5">{rows.length} linhas validadas · pronto a importar</p>}
                    {parseError && <p className="text-xs text-destructive mt-1">{parseError}</p>}
                  </div>
                </div>
              )}

              {rows && previewRows.length > 0 && (
                <div className="mt-6 rounded-xl border border-border overflow-hidden">
                  <div className="px-4 py-2 bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
                    Pré-visualização (primeiras {previewRows.length})
                  </div>
                  <table className="w-full text-sm">
                    <tbody>
                      {previewRows.map((r) => (
                        <tr key={r.id} className="border-t border-border">
                          <td className="px-4 py-2 w-16 font-mono text-xs text-muted-foreground">{r.id}</td>
                          <td className="px-4 py-2 truncate">{r.content}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {importing && (
                <div className="mt-6 space-y-2">
                  <Progress value={progress} />
                  <p className="text-xs text-muted-foreground text-center">A importar mensagens…</p>
                </div>
              )}

              {lastImportCount !== null && !importing && (
                <div className="mt-6 rounded-xl border border-border bg-card p-4 flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                  <p className="text-sm"><span className="font-medium">{lastImportCount}</span> mensagens importadas com sucesso.</p>
                </div>
              )}

              <div className="mt-8 flex justify-end">
                <button
                  type="button"
                  disabled={!rows || importing}
                  onClick={() => setConfirmOpen(true)}
                  className="text-sm font-medium px-5 py-2.5 rounded-full bg-primary text-primary-foreground shadow-soft hover:opacity-90 transition-smooth disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Importar mensagens
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Substituir todas as mensagens?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação vai substituir todas as mensagens atuais. Quer continuar?
              {rows && (
                <span className="block mt-2 text-foreground">
                  Serão importadas <strong>{rows.length}</strong> linhas.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={importing}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => { e.preventDefault(); setConfirmOpen(false); runImport(); }}
              disabled={importing}
            >
              Sim, substituir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Admin;

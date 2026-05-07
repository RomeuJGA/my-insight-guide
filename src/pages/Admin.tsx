import { useCallback, useMemo, useRef, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { Upload, FileText, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";
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

  const [fileName, setFileName] = useState<string | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [rows, setRows] = useState<ParsedRow[] | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [lastImportCount, setLastImportCount] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 pt-24 pb-16 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-10">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">
            Administração
          </p>
          <h1 className="font-serif text-3xl md:text-4xl tracking-tight">
            Importar mensagens
          </h1>
          <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
            Carregue um ficheiro CSV com as colunas <code className="px-1.5 py-0.5 rounded bg-muted text-xs">id</code> e{" "}
            <code className="px-1.5 py-0.5 rounded bg-muted text-xs">content</code>. Esta ação substitui
            todas as mensagens existentes.
          </p>
        </div>

        <label
          htmlFor="csv-input"
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
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
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
            }}
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
              {rows && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {rows.length} linhas validadas · pronto a importar
                </p>
              )}
              {parseError && (
                <p className="text-xs text-destructive mt-1">{parseError}</p>
              )}
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
                    <td className="px-4 py-2 w-16 font-mono text-xs text-muted-foreground">
                      {r.id}
                    </td>
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
            <p className="text-xs text-muted-foreground text-center">
              A importar mensagens…
            </p>
          </div>
        )}

        {lastImportCount !== null && !importing && (
          <div className="mt-6 rounded-xl border border-border bg-card p-4 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-primary" />
            <p className="text-sm">
              <span className="font-medium">{lastImportCount}</span> mensagens importadas com sucesso.
            </p>
          </div>
        )}

        <div className="mt-8 flex items-center justify-between">
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-smooth">
            ← Voltar
          </Link>
          <button
            type="button"
            disabled={!rows || importing}
            onClick={() => setConfirmOpen(true)}
            className="text-sm font-medium px-5 py-2.5 rounded-full bg-primary text-primary-foreground shadow-soft hover:opacity-90 transition-smooth disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Importar mensagens
          </button>
        </div>

        <div className="mt-12">
          <AdminPackages />
        </div>

        <div className="mt-12">
          <AdminCoupons />
        </div>

        <div className="mt-12">
          <AdminTestimonials />
        </div>

        <div className="mt-12">
          <AdminAnalytics />
        </div>

        <div className="mt-12">
          <AdminUsers />
        </div>

        <div className="mt-12">
          <AdminCredits />
        </div>
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
              onClick={(e) => {
                e.preventDefault();
                setConfirmOpen(false);
                runImport();
              }}
              disabled={importing}
            >
              Sim, substituir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      </div>
      <Footer />
    </div>
  );
};

export default Admin;

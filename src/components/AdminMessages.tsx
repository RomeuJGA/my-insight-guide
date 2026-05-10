import { useCallback, useMemo, useRef, useState } from "react";
import {
  Upload, FileText, CheckCircle2, Loader2, Save, Search,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
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
  const rows: string[][] = [];
  let field = "";
  let row: string[] = [];
  let inQuotes = false;
  let i = 0;
  const src = text.replace(/^﻿/, "");

  while (i < src.length) {
    const c = src[i];
    if (inQuotes) {
      if (c === '"') {
        if (src[i + 1] === '"') { field += '"'; i += 2; continue; }
        inQuotes = false; i++; continue;
      }
      field += c; i++; continue;
    }
    if (c === '"') { inQuotes = true; i++; continue; }
    if (c === ",") { row.push(field); field = ""; i++; continue; }
    if (c === "\r") { i++; continue; }
    if (c === "\n") { row.push(field); rows.push(row); row = []; field = ""; i++; continue; }
    field += c; i++;
  }
  if (field.length > 0 || row.length > 0) { row.push(field); rows.push(row); }
  while (rows.length > 0 && rows[rows.length - 1].every((v) => v.trim() === "")) rows.pop();

  if (rows.length === 0) return { ok: false, error: "Ficheiro CSV vazio." };
  const header = rows[0].map((h) => h.trim().toLowerCase());
  if (header.length !== 2 || header[0] !== "id" || header[1] !== "content") {
    return { ok: false, error: 'O CSV deve conter exatamente as colunas: "id" e "content".' };
  }

  const parsed: ParsedRow[] = [];
  const seen = new Set<number>();
  for (let r = 1; r < rows.length; r++) {
    const cols = rows[r];
    if (cols.length === 1 && cols[0].trim() === "") continue;
    if (cols.length !== 2) return { ok: false, error: `Linha ${r + 1}: número de colunas inválido.` };
    const idRaw = cols[0].trim();
    if (!/^-?\d+$/.test(idRaw)) return { ok: false, error: `Linha ${r + 1}: id "${idRaw}" não é inteiro.` };
    const id = parseInt(idRaw, 10);
    if (id < MIN_ID || id > MAX_ID) return { ok: false, error: `Linha ${r + 1}: id ${id} fora do intervalo (${MIN_ID}–${MAX_ID}).` };
    if (seen.has(id)) return { ok: false, error: `Linha ${r + 1}: id duplicado (${id}).` };
    if (!cols[1] || cols[1].trim() === "") return { ok: false, error: `Linha ${r + 1}: conteúdo vazio.` };
    seen.add(id);
    parsed.push({ id, content: cols[1] });
  }
  if (parsed.length === 0) return { ok: false, error: "Nenhuma linha de dados encontrada." };
  return { ok: true, rows: parsed };
}

type LoadedMsg = { id: number; content: string; contentFeminine: string | null };

const AdminMessages = () => {
  // ── Editor ────────────────────────────────────────────────────────────────
  const [searchId, setSearchId] = useState("");
  const [loadedMsg, setLoadedMsg] = useState<LoadedMsg | null>(null);
  const [editContent, setEditContent] = useState("");
  const [editFeminine, setEditFeminine] = useState("");
  const [loadingMsg, setLoadingMsg] = useState(false);
  const [savingMsg, setSavingMsg] = useState(false);
  const [msgError, setMsgError] = useState<string | null>(null);

  const loadMessage = async () => {
    const id = parseInt(searchId, 10);
    if (!Number.isInteger(id) || id < MIN_ID || id > MAX_ID) {
      setMsgError(`ID inválido. Use entre ${MIN_ID} e ${MAX_ID}.`);
      return;
    }
    setLoadingMsg(true);
    setMsgError(null);
    setLoadedMsg(null);
    try {
      const { data, error } = await supabase.functions.invoke("admin-message", {
        body: { action: "get", id },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      const m = data.message;
      setLoadedMsg({ id: m.id, content: m.content, contentFeminine: m.content_feminine });
      setEditContent(m.content);
      setEditFeminine(m.content_feminine ?? "");
    } catch (e: unknown) {
      setMsgError(e instanceof Error ? e.message : "Erro ao carregar mensagem.");
    } finally {
      setLoadingMsg(false);
    }
  };

  const saveMessage = async () => {
    if (!loadedMsg) return;
    setSavingMsg(true);
    setMsgError(null);
    try {
      const { data, error } = await supabase.functions.invoke("admin-message", {
        body: {
          action: "update",
          id: loadedMsg.id,
          content: editContent,
          content_feminine: editFeminine.trim() || null,
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast.success(`Mensagem #${loadedMsg.id} guardada.`);
      setLoadedMsg({ ...loadedMsg, content: editContent, contentFeminine: editFeminine.trim() || null });
    } catch (e: unknown) {
      setMsgError(e instanceof Error ? e.message : "Erro ao guardar mensagem.");
    } finally {
      setSavingMsg(false);
    }
  };

  const isDirty =
    loadedMsg &&
    (editContent !== loadedMsg.content || editFeminine !== (loadedMsg.contentFeminine ?? ""));

  // ── CSV import ────────────────────────────────────────────────────────────
  const [fileName, setFileName] = useState<string | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [csvRows, setCsvRows] = useState<ParsedRow[] | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [lastImportCount, setLastImportCount] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (file: File) => {
    setParseError(null);
    setCsvRows(null);
    setLastImportCount(null);
    setFileName(file.name);
    if (!file.name.toLowerCase().endsWith(".csv")) { setParseError("O ficheiro deve ter extensão .csv"); return; }
    if (file.size > 5 * 1024 * 1024) { setParseError("Ficheiro demasiado grande (máx. 5MB)."); return; }
    const text = await file.text();
    const result = parseCsv(text);
    if (!result.ok) { setParseError(result.error); return; }
    setCsvRows(result.rows);
  }, []);

  const onDrop = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const runImport = useCallback(async () => {
    if (!csvRows) return;
    setImporting(true);
    setProgress(15);
    try {
      const tick = setInterval(() => setProgress((p) => (p < 85 ? p + 5 : p)), 150);
      const { data, error } = await supabase.rpc("replace_all_messages", {
        _rows: csvRows as unknown as never,
      });
      clearInterval(tick);
      setProgress(100);
      if (error) { toast.error(`Erro na importação: ${error.message}`); return; }
      const count = typeof data === "number" ? data : csvRows.length;
      setLastImportCount(count);
      toast.success(`${count} mensagens importadas com sucesso.`);
      setCsvRows(null);
      setFileName(null);
      if (inputRef.current) inputRef.current.value = "";
    } catch (e) {
      toast.error(`Erro inesperado: ${(e as Error).message}`);
    } finally {
      setTimeout(() => { setImporting(false); setProgress(0); }, 400);
    }
  }, [csvRows]);

  const previewRows = useMemo(() => csvRows?.slice(0, 5) ?? [], [csvRows]);

  return (
    <div className="space-y-10">
      <div>
        <h2 className="font-serif text-2xl md:text-3xl tracking-tight mb-1">Mensagens</h2>
        <p className="text-muted-foreground text-sm">Edição individual ou importação em massa via CSV.</p>
      </div>

      {/* ── Editor ── */}
      <div className="rounded-2xl border border-border/60 bg-card p-6 space-y-5">
        <h3 className="font-medium text-sm">Editar mensagem individual</h3>

        {/* Search row */}
        <div className="flex gap-2">
          <input
            type="number"
            min={MIN_ID}
            max={MAX_ID}
            value={searchId}
            onChange={(e) => { setSearchId(e.target.value); setMsgError(null); }}
            onKeyDown={(e) => e.key === "Enter" && loadMessage()}
            placeholder={`Número (${MIN_ID}–${MAX_ID})`}
            className="w-44 px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/40"
          />
          <button
            onClick={loadMessage}
            disabled={loadingMsg || !searchId}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-smooth disabled:opacity-50"
          >
            {loadingMsg ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
            Carregar
          </button>
        </div>

        {msgError && <p className="text-xs text-destructive">{msgError}</p>}

        {/* Edit area */}
        {loadedMsg && (
          <div className="space-y-4 pt-2 border-t border-border/60">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
              Mensagem #{loadedMsg.id}
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground/80">Conteúdo</label>
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={8}
                className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm resize-y leading-relaxed focus:outline-none focus:ring-2 focus:ring-ring/40"
              />
              <p className="text-xs text-muted-foreground text-right">{editContent.length} car.</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground/80">
                Versão feminina{" "}
                <span className="text-muted-foreground font-normal">(opcional — usada quando o utilizador selecionou género feminino)</span>
              </label>
              <textarea
                value={editFeminine}
                onChange={(e) => setEditFeminine(e.target.value)}
                rows={8}
                placeholder="Deixe vazio para usar sempre o conteúdo principal."
                className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm resize-y leading-relaxed focus:outline-none focus:ring-2 focus:ring-ring/40 placeholder:text-muted-foreground/50"
              />
              {editFeminine && (
                <p className="text-xs text-muted-foreground text-right">{editFeminine.length} car.</p>
              )}
            </div>

            <div className="flex items-center justify-between pt-1">
              {isDirty ? (
                <p className="text-xs text-amber-600">Alterações por guardar</p>
              ) : (
                <p className="text-xs text-muted-foreground/50">Sem alterações</p>
              )}
              <button
                onClick={saveMessage}
                disabled={!isDirty || savingMsg}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-smooth disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {savingMsg ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                Guardar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── CSV Import ── */}
      <div className="space-y-4">
        <div>
          <h3 className="font-medium text-sm mb-1">Importação em massa (CSV)</h3>
          <p className="text-muted-foreground text-xs leading-relaxed">
            Carregue um CSV com as colunas{" "}
            <code className="px-1.5 py-0.5 rounded bg-muted">id</code> e{" "}
            <code className="px-1.5 py-0.5 rounded bg-muted">content</code>.{" "}
            Esta ação substitui <strong>todas</strong> as mensagens existentes.
          </p>
        </div>

        <label
          htmlFor="csv-input"
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={onDrop}
          className={`block cursor-pointer rounded-2xl border-2 border-dashed p-10 text-center transition-smooth ${
            isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted/30"
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
          <p className="font-medium text-sm">Arraste o CSV ou clique para selecionar</p>
          <p className="text-xs text-muted-foreground mt-1">
            Apenas .csv · até 5MB · ids entre {MIN_ID} e {MAX_ID}
          </p>
        </label>

        {fileName && (
          <div className="rounded-xl border border-border bg-card p-4 flex items-start gap-3">
            <FileText className="w-5 h-5 text-muted-foreground mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{fileName}</p>
              {csvRows && <p className="text-xs text-muted-foreground mt-0.5">{csvRows.length} linhas validadas · pronto a importar</p>}
              {parseError && <p className="text-xs text-destructive mt-1">{parseError}</p>}
            </div>
          </div>
        )}

        {csvRows && previewRows.length > 0 && (
          <div className="rounded-xl border border-border overflow-hidden">
            <div className="px-4 py-2 bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
              Pré-visualização (primeiras {previewRows.length})
            </div>
            <table className="w-full text-sm">
              <tbody>
                {previewRows.map((r) => (
                  <tr key={r.id} className="border-t border-border">
                    <td className="px-4 py-2 w-16 font-mono text-xs text-muted-foreground">{r.id}</td>
                    <td className="px-4 py-2 text-xs line-clamp-2 max-w-0">{r.content}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {importing && (
          <div className="space-y-2">
            <Progress value={progress} />
            <p className="text-xs text-muted-foreground text-center">A importar mensagens…</p>
          </div>
        )}

        {lastImportCount !== null && !importing && (
          <div className="rounded-xl border border-border bg-card p-4 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-primary" />
            <p className="text-sm"><span className="font-medium">{lastImportCount}</span> mensagens importadas com sucesso.</p>
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="button"
            disabled={!csvRows || importing}
            onClick={() => setConfirmOpen(true)}
            className="text-sm font-medium px-5 py-2.5 rounded-full bg-primary text-primary-foreground shadow-soft hover:opacity-90 transition-smooth disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Importar mensagens
          </button>
        </div>
      </div>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Substituir todas as mensagens?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação vai substituir todas as mensagens atuais. Quer continuar?
              {csvRows && (
                <span className="block mt-2 text-foreground">
                  Serão importadas <strong>{csvRows.length}</strong> linhas.
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

export default AdminMessages;

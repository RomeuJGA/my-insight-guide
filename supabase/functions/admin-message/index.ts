// Admin: read and update individual messages.
import { corsHeaders, getAuthedUser, isAdmin, jsonResponse } from "../_shared/auth.ts";

const MAX_ID = 534;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);

  const authed = await getAuthedUser(req);
  if ("error" in authed) return authed.error;
  const { user, admin } = authed;

  const ok = await isAdmin(admin, user.id);
  if (!ok) return jsonResponse({ error: "Apenas administradores." }, 403);

  const body = await req.json().catch(() => null);
  const action = body?.action;

  if (action === "get") {
    const id = typeof body.id === "number" ? body.id : parseInt(String(body.id), 10);
    if (!Number.isInteger(id) || id < 1 || id > MAX_ID) {
      return jsonResponse({ error: `ID inválido. Use entre 1 e ${MAX_ID}.` }, 400);
    }
    const { data, error } = await admin
      .from("messages")
      .select("id, content, content_feminine")
      .eq("id", id)
      .maybeSingle();
    if (error) return jsonResponse({ error: "Erro ao carregar mensagem." }, 500);
    if (!data) return jsonResponse({ error: "Mensagem não encontrada." }, 404);
    return jsonResponse({ message: data });
  }

  if (action === "update") {
    const id = typeof body.id === "number" ? body.id : parseInt(String(body.id), 10);
    if (!Number.isInteger(id) || id < 1 || id > MAX_ID) {
      return jsonResponse({ error: "ID inválido." }, 400);
    }
    const content = typeof body.content === "string" ? body.content.trim() : "";
    const contentFeminine =
      typeof body.content_feminine === "string" ? body.content_feminine.trim() || null : null;
    if (!content) return jsonResponse({ error: "O conteúdo não pode estar vazio." }, 400);

    const { error } = await admin
      .from("messages")
      .update({ content, content_feminine: contentFeminine })
      .eq("id", id);
    if (error) {
      console.error("update error:", error);
      return jsonResponse({ error: "Erro ao guardar mensagem." }, 500);
    }
    return jsonResponse({ ok: true });
  }

  return jsonResponse({ error: "Ação inválida." }, 400);
});

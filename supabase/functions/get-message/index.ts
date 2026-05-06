// Reveals a message. Server-side, idempotent:
// - First reveal: consumes 1 credit + records in message_reveals.
// - Subsequent reveals of the same message: returns content WITHOUT charging.
import { corsHeaders, getAuthedUser, jsonResponse } from "../_shared/auth.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);

  const authed = await getAuthedUser(req);
  if ("error" in authed) return authed.error;
  const { user, admin } = authed;

  const body = await req.json().catch(() => null);
  const rawId = body?.id;
  const id = typeof rawId === "number" ? rawId : parseInt(String(rawId), 10);

  const MAX_MESSAGE_ID = 534;
  if (!Number.isInteger(id) || id < 1 || id > MAX_MESSAGE_ID) {
    return jsonResponse({ error: `Número inválido. Escolha entre 1 e ${MAX_MESSAGE_ID}.` }, 400);
  }

  const { data, error } = await admin.rpc("reveal_message", {
    _user_id: user.id,
    _message_id: id,
  });

  if (error) {
    console.error("reveal_message error:", error);
    return jsonResponse({ error: "Erro ao revelar a mensagem." }, 500);
  }

  const row = Array.isArray(data) ? data[0] : data;
  if (!row) return jsonResponse({ error: "Resposta inválida do servidor." }, 500);

  if (row.status === "no_credits") {
    return jsonResponse({ error: "Sem créditos disponíveis.", code: "NO_CREDITS" }, 402);
  }
  if (row.status === "not_found") {
    return jsonResponse({ error: "Mensagem não encontrada." }, 404);
  }

  return jsonResponse({
    id,
    content: row.content,
    credits: row.credits,
    alreadyRevealed: row.already_revealed === true,
  });
});

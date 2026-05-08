// Reveals a message. Always charges 1 credit, even for re-reveals.
// On first call without force=true, returns alreadyRevealed=true so the client
// can show a confirmation dialog. On second call with force=true, charges and returns content.
// Serves content_feminine when the user's profile has grammatical_gender = 'f'.
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
  const force = body?.force === true;

  const MAX_MESSAGE_ID = 534;
  if (!Number.isInteger(id) || id < 1 || id > MAX_MESSAGE_ID) {
    return jsonResponse({ error: `Número inválido. Escolha entre 1 e ${MAX_MESSAGE_ID}.` }, 400);
  }

  // Fetch user's grammatical gender preference (non-blocking on failure)
  const { data: profile } = await admin
    .from("profiles")
    .select("grammatical_gender")
    .eq("user_id", user.id)
    .maybeSingle();

  const useFeminine = profile?.grammatical_gender === "f";

  const { data, error } = await admin.rpc("reveal_message", {
    _user_id: user.id,
    _message_id: id,
    _force: force,
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
  if (row.status === "already_revealed") {
    return jsonResponse({ alreadyRevealed: true, credits: row.credits, code: "ALREADY_REVEALED" }, 200);
  }

  // Use feminine version when available and user preference is feminine
  let content = row.content;
  if (useFeminine) {
    const { data: msg } = await admin
      .from("messages")
      .select("content_feminine")
      .eq("id", id)
      .maybeSingle();
    if (msg?.content_feminine) content = msg.content_feminine;
  }

  return jsonResponse({
    id,
    content,
    credits: row.credits,
    alreadyRevealed: row.already_revealed === true,
  });
});

// Returns the user's free daily message. Idempotent: same content for the entire day.
// Never exposes the underlying message_id.
import { corsHeaders, getAuthedUser, jsonResponse } from "../_shared/auth.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST" && req.method !== "GET") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const authed = await getAuthedUser(req);
  if ("error" in authed) return authed.error;
  const { user, admin } = authed;

  const { data, error } = await admin.rpc("get_or_create_daily_message", {
    _user_id: user.id,
  });

  if (error) {
    console.error("get_or_create_daily_message error:", error);
    return jsonResponse({ error: "Erro ao obter a mensagem do dia." }, 500);
  }

  const row = Array.isArray(data) ? data[0] : data;
  if (!row?.content) return jsonResponse({ error: "Mensagem indisponível." }, 500);

  return jsonResponse({ content: row.content, shownDate: row.shown_date });
});

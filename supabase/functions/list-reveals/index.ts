// Returns the authenticated user's reveal history with full message content.
import { corsHeaders, getAuthedUser, jsonResponse } from "../_shared/auth.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST" && req.method !== "GET") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const authed = await getAuthedUser(req);
  if ("error" in authed) return authed.error;
  const { user, admin } = authed;

  const { data: reveals, error } = await admin
    .from("message_reveals")
    .select("message_id, revealed_at, question, notes")
    .eq("user_id", user.id)
    .order("revealed_at", { ascending: false });

  if (error) {
    console.error("list-reveals error:", error);
    return jsonResponse({ error: "Erro ao obter histórico." }, 500);
  }

  if (!reveals?.length) return jsonResponse({ items: [] });

  const ids = reveals.map((r) => r.message_id);
  const { data: messages, error: msgErr } = await admin
    .from("messages")
    .select("id, content")
    .in("id", ids);

  if (msgErr) {
    console.error("list-reveals messages error:", msgErr);
    return jsonResponse({ error: "Erro ao obter mensagens." }, 500);
  }

  const byId = new Map(messages?.map((m) => [m.id, m.content]) ?? []);
  const items = reveals.map((r) => ({
    messageId: r.message_id,
    revealedAt: r.revealed_at,
    content: byId.get(r.message_id) ?? "",
    question: r.question ?? null,
    notes: r.notes ?? null,
  }));

  return jsonResponse({ items });
});

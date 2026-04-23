// Grants the 1 free welcome credit if the user has verified email and hasn't received it yet.
// Idempotent: safe to call repeatedly.
import { corsHeaders, getAuthedUser, jsonResponse } from "../_shared/auth.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);

  const authed = await getAuthedUser(req);
  if ("error" in authed) return authed.error;
  const { user, admin } = authed;

  const { data, error } = await admin.rpc("grant_welcome_credit_if_eligible", {
    _user_id: user.id,
  });

  if (error) {
    console.error("grant_welcome_credit_if_eligible error:", error);
    return jsonResponse({ error: "Erro ao atribuir crédito." }, 500);
  }

  const row = Array.isArray(data) ? data[0] : data;
  return jsonResponse({
    granted: row?.granted === true,
    credits: row?.credits ?? 0,
    reason: row?.reason ?? "unknown",
  });
});

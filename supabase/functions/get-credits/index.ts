import { corsHeaders, getAuthedUser, jsonResponse } from "../_shared/auth.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const authed = await getAuthedUser(req);
  if ("error" in authed) return authed.error;
  const { user, admin } = authed;

  // Ensure row exists, return current credits
  const { data, error } = await admin
    .from("user_credits")
    .select("credits, updated_at")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    console.error("get-credits db error:", error);
    return jsonResponse({ error: "Erro ao obter créditos." }, 500);
  }

  return jsonResponse({ credits: data?.credits ?? 0, updated_at: data?.updated_at ?? null });
});

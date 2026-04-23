// Admin-only: add or remove credits from any user.
import { corsHeaders, getAuthedUser, isAdmin, jsonResponse } from "../_shared/auth.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);

  const authed = await getAuthedUser(req);
  if ("error" in authed) return authed.error;
  const { user, admin } = authed;

  const ok = await isAdmin(admin, user.id);
  if (!ok) return jsonResponse({ error: "Apenas administradores." }, 403);

  const body = await req.json().catch(() => null);
  const targetUserId = String(body?.user_id ?? "");
  const amount = Number(body?.amount);
  const description = String(body?.description ?? "Ajuste manual");

  if (!targetUserId || !Number.isInteger(amount) || amount === 0) {
    return jsonResponse({ error: "Parâmetros inválidos." }, 400);
  }
  if (Math.abs(amount) > 10000) {
    return jsonResponse({ error: "Quantidade fora do limite." }, 400);
  }

  const { data, error } = await admin.rpc("add_credits", {
    _user_id: targetUserId,
    _amount: amount,
    _type: "admin",
    _description: description,
  });

  if (error) {
    console.error("admin-credits rpc error:", error);
    return jsonResponse({ error: "Erro ao ajustar créditos." }, 500);
  }

  return jsonResponse({ credits: data });
});

// Returns the current status of a payment order for the authenticated user.
import { corsHeaders, getAuthedUser, jsonResponse } from "../_shared/auth.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);

  const authed = await getAuthedUser(req);
  if ("error" in authed) return authed.error;
  const { user, admin } = authed;

  const body = await req.json().catch(() => null);
  const orderId = String(body?.orderId ?? "");
  if (!orderId) return jsonResponse({ error: "orderId obrigatório." }, 400);

  const { data, error } = await admin
    .from("payment_orders")
    .select("order_id, status, paid_at, credits, amount, payment_method")
    .eq("order_id", orderId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    console.error("check-payment-status error:", error);
    return jsonResponse({ error: "Erro ao consultar estado." }, 500);
  }
  if (!data) return jsonResponse({ error: "Ordem não encontrada." }, 404);

  let balance: number | null = null;
  if (data.status === "paid") {
    const { data: cr } = await admin.from("user_credits").select("credits").eq("user_id", user.id).maybeSingle();
    balance = cr?.credits ?? null;
  }

  return jsonResponse({ ...data, balance });
});

// Secure endpoint: returns ONE message by id AFTER consuming 1 credit atomically.
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

  if (!Number.isInteger(id) || id < 1 || id > 534) {
    return jsonResponse({ error: "Número inválido. Escolha entre 1 e 534." }, 400);
  }

  // Atomic credit consumption (prevents race conditions / negative balance)
  const { data: newBalance, error: rpcError } = await admin.rpc("consume_one_credit", {
    _user_id: user.id,
    _description: `Mensagem #${id}`,
  });

  if (rpcError) {
    console.error("consume_one_credit error:", rpcError);
    return jsonResponse({ error: "Erro ao consumir crédito." }, 500);
  }

  if (newBalance === -1) {
    return jsonResponse({ error: "Sem créditos disponíveis.", code: "NO_CREDITS" }, 402);
  }

  const { data, error } = await admin
    .from("messages")
    .select("id, content")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("DB error:", error);
    // Refund the credit since we charged but failed to deliver
    await admin.rpc("add_credits", {
      _user_id: user.id,
      _amount: 1,
      _type: "admin",
      _description: `Reembolso (erro mensagem #${id})`,
    });
    return jsonResponse({ error: "Erro ao obter a mensagem." }, 500);
  }

  if (!data) {
    await admin.rpc("add_credits", {
      _user_id: user.id,
      _amount: 1,
      _type: "admin",
      _description: `Reembolso (mensagem #${id} não encontrada)`,
    });
    return jsonResponse({ error: "Mensagem não encontrada." }, 404);
  }

  return jsonResponse({ id: data.id, content: data.content, credits: newBalance });
});

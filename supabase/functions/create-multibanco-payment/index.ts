// Creates a Multibanco payment reference via IfthenPay and stores a pending order.
// Credits are NOT added here — only when ifthenpay-callback confirms payment.
import { corsHeaders, getAuthedUser, jsonResponse } from "../_shared/auth.ts";

const PACKAGES: Record<string, { credits: number; amount: string; label: string }> = {
  five: { credits: 5, amount: "4.90", label: "5 créditos" },
  ten: { credits: 10, amount: "8.90", label: "10 créditos" },
  twenty: { credits: 20, amount: "14.90", label: "20 créditos" },
};

function genOrderId() {
  // IfthenPay maxLength = 25
  const ts = Date.now().toString(36);
  const rnd = Math.random().toString(36).slice(2, 8);
  return `LMN${ts}${rnd}`.slice(0, 25).toUpperCase();
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);

  const authed = await getAuthedUser(req);
  if ("error" in authed) return authed.error;
  const { user, admin } = authed;

  const body = await req.json().catch(() => null);
  const pkgKey = String(body?.package ?? "");
  const acceptedTerms = body?.acceptedTerms === true;

  const chosen = PACKAGES[pkgKey];
  if (!chosen) return jsonResponse({ error: "Pacote inválido." }, 400);
  if (!acceptedTerms) {
    return jsonResponse({ error: "Tem de aceitar os Termos, Política de Privacidade e Política de Reembolso." }, 400);
  }

  const mbKey = Deno.env.get("IFTHENPAY_MULTIBANCO_KEY");
  if (!mbKey) {
    console.error("Missing IFTHENPAY_MULTIBANCO_KEY");
    return jsonResponse({ error: "Configuração de pagamento em falta." }, 500);
  }
  const sandbox = (Deno.env.get("IFTHENPAY_SANDBOX") ?? "false").toLowerCase() === "true";
  const endpoint = sandbox
    ? "https://api.ifthenpay.com/multibanco/reference/sandbox"
    : "https://api.ifthenpay.com/multibanco/reference/init";

  const orderId = genOrderId();

  // 1) Insert pending order using service role (RLS blocks direct inserts).
  const { error: insErr } = await admin.from("payment_orders").insert({
    user_id: user.id,
    order_id: orderId,
    payment_method: "multibanco",
    package: pkgKey,
    credits: chosen.credits,
    amount: chosen.amount,
    status: "pending",
  });
  if (insErr) {
    console.error("payment_orders insert error:", insErr);
    return jsonResponse({ error: "Erro ao criar a ordem de pagamento." }, 500);
  }

  // 2) Request reference from IfthenPay
  let mbRes: Response;
  try {
    mbRes = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mbKey,
        orderId,
        amount: chosen.amount,
        description: `Lumen - ${chosen.label}`,
        clientEmail: user.email ?? "",
        expiryDays: 3,
      }),
    });
  } catch (e) {
    console.error("ifthenpay fetch error:", e);
    await admin.from("payment_orders").update({ status: "failed" }).eq("order_id", orderId);
    return jsonResponse({ error: "Erro de comunicação com o gateway." }, 502);
  }

  const rawText = await mbRes.text();
  let mbData: any = null;
  try { mbData = JSON.parse(rawText); } catch { /* not JSON */ }

  if (!mbRes.ok || !mbData || String(mbData.Status) !== "0") {
    console.error("ifthenpay non-success:", mbRes.status, "sandbox=", sandbox, "body=", rawText?.slice(0, 500));
    await admin.from("payment_orders").update({ status: "failed" }).eq("order_id", orderId);
    const detail =
      mbData?.Message ||
      (mbRes.status === 403
        ? `MB Key inválida ou não autorizada para o ambiente ${sandbox ? "sandbox" : "produção"}.`
        : `Gateway respondeu ${mbRes.status}.`);
    return jsonResponse({ error: detail }, 502);
  }

  // 3) Persist returned reference details
  const entity = String(mbData.Entity ?? "");
  const reference = String(mbData.Reference ?? "");
  const requestId = String(mbData.RequestId ?? "");
  const expiryDate = String(mbData.ExpiryDate ?? "");

  const { error: updErr } = await admin
    .from("payment_orders")
    .update({
      ifthenpay_entity: entity,
      ifthenpay_reference: reference,
      ifthenpay_request_id: requestId,
    })
    .eq("order_id", orderId);
  if (updErr) console.error("payment_orders update error:", updErr);

  return jsonResponse({
    orderId,
    entity,
    reference,
    amount: chosen.amount,
    expiryDate,
    sandbox,
  });
});

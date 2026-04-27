// Generates a Multibanco payment reference LOCALLY (clássico IfthenPay) and stores a pending order.
// No external API call is made — Entidade + Sub-entidade come from secrets, reference is computed
// using the official MOD 97-10 algorithm. Credits are added only when ifthenpay-callback confirms payment.
import { corsHeaders, getAuthedUser, jsonResponse } from "../_shared/auth.ts";

const PACKAGES: Record<string, { credits: number; amount: string; label: string }> = {
  five: { credits: 5, amount: "4.90", label: "5 créditos" },
  ten: { credits: 10, amount: "8.90", label: "10 créditos" },
  twenty: { credits: 20, amount: "14.90", label: "20 créditos" },
};

function genOrderId() {
  const ts = Date.now().toString(36);
  const rnd = Math.random().toString(36).slice(2, 8);
  return `LMN${ts}${rnd}`.slice(0, 25).toUpperCase();
}

/**
 * Computes the 2-digit MOD 97-10 check digits for the Multibanco reference.
 * Input: subEntity (3 digits) + sequential (4 digits) + amount in cents (8 digits, zero-padded).
 * Output: 2 check digits as string.
 */
function mod9710(input: string): string {
  let remainder = 0;
  for (const ch of input) {
    remainder = (remainder * 10 + parseInt(ch, 10)) % 97;
  }
  const check = (98 - (remainder * 100) % 97) % 97;
  return check.toString().padStart(2, "0");
}

/**
 * Builds a 9-digit Multibanco reference: subEntity(3) + seq(4) + checkDigits(2).
 * Amount must be in cents (integer). Sequential is 0..9999.
 */
function buildReference(subEntity: string, sequential: number, amountCents: number): string {
  const sub = subEntity.padStart(3, "0").slice(-3);
  const seq = sequential.toString().padStart(4, "0").slice(-4);
  const amt = amountCents.toString().padStart(8, "0").slice(-8);
  const check = mod9710(sub + seq + amt);
  return sub + seq + check; // 9 digits
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

  const entidade = (Deno.env.get("IFTHENPAY_ENTIDADE") ?? "").trim();
  const subentidade = (Deno.env.get("IFTHENPAY_SUBENTIDADE") ?? "").trim();
  if (!entidade || !subentidade) {
    console.error("Missing IFTHENPAY_ENTIDADE or IFTHENPAY_SUBENTIDADE");
    return jsonResponse({ error: "Configuração de pagamento em falta." }, 500);
  }

  const orderId = genOrderId();
  const amountCents = Math.round(parseFloat(chosen.amount) * 100);

  // 1) Allocate next sequential number atomically via DB sequence
  const { data: seqData, error: seqErr } = await admin.rpc("next_ifthenpay_reference_number");
  if (seqErr || seqData == null) {
    console.error("sequence error:", seqErr);
    return jsonResponse({ error: "Erro ao gerar referência." }, 500);
  }
  const sequential = Number(seqData) % 10000; // wrap into 4 digits

  // 2) Build reference locally
  const reference = buildReference(subentidade, sequential, amountCents);

  // 3) Insert pending order with the generated reference
  const { error: insErr } = await admin.from("payment_orders").insert({
    user_id: user.id,
    order_id: orderId,
    payment_method: "multibanco",
    package: pkgKey,
    credits: chosen.credits,
    amount: chosen.amount,
    status: "pending",
    ifthenpay_entity: entidade,
    ifthenpay_reference: reference,
  });
  if (insErr) {
    console.error("payment_orders insert error:", insErr);
    return jsonResponse({ error: "Erro ao criar a ordem de pagamento." }, 500);
  }

  // Reference valid for 3 days by convention
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + 3);

  return jsonResponse({
    orderId,
    entity: entidade,
    reference,
    amount: chosen.amount,
    expiryDate: expiry.toISOString().slice(0, 10),
    sandbox: false,
  });
});

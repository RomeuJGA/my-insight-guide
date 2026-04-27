// Generates a Multibanco payment reference LOCALLY (clássico IfthenPay) and stores a pending order.
// Uses dynamic packages from the credit_packages table and supports discount coupons.
import { corsHeaders, getAuthedUser, jsonResponse } from "../_shared/auth.ts";

function genOrderId() {
  const ts = Date.now().toString(36);
  const rnd = Math.random().toString(36).slice(2, 8);
  return `LMN${ts}${rnd}`.slice(0, 25).toUpperCase();
}

function mod9710(input: string): string {
  let remainder = 0;
  for (const ch of input) {
    remainder = (remainder * 10 + parseInt(ch, 10)) % 97;
  }
  const check = (98 - (remainder * 100) % 97) % 97;
  return check.toString().padStart(2, "0");
}

function buildReference(subEntity: string, sequential: number, amountCents: number): string {
  const sub = subEntity.padStart(3, "0").slice(-3);
  const seq = sequential.toString().padStart(4, "0").slice(-4);
  const amt = amountCents.toString().padStart(8, "0").slice(-8);
  const check = mod9710(sub + seq + amt);
  return sub + seq + check;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);

  const authed = await getAuthedUser(req);
  if ("error" in authed) return authed.error;
  const { user, admin } = authed;

  const body = await req.json().catch(() => null);
  const packageId = typeof body?.packageId === "string" ? body.packageId : null;
  const acceptedTerms = body?.acceptedTerms === true;
  const couponCode = typeof body?.couponCode === "string" ? body.couponCode.trim() : "";

  if (!packageId) return jsonResponse({ error: "Pacote inválido." }, 400);
  if (!acceptedTerms) {
    return jsonResponse(
      { error: "Tem de aceitar os Termos, Política de Privacidade e Política de Reembolso." },
      400,
    );
  }

  // 1) Load active package
  const { data: pkg, error: pkgErr } = await admin
    .from("credit_packages")
    .select("id, name, credits, price_eur, active")
    .eq("id", packageId)
    .eq("active", true)
    .maybeSingle();

  if (pkgErr || !pkg) {
    return jsonResponse({ error: "Pacote indisponível." }, 400);
  }

  let finalAmount = Number(pkg.price_eur);
  let appliedCouponId: string | null = null;
  let discountApplied = 0;

  // 2) Validate coupon (if provided)
  if (couponCode) {
    const { data: vRes, error: vErr } = await admin.rpc("validate_coupon", {
      _code: couponCode,
      _user_id: user.id,
      _package_id: pkg.id,
    });
    if (vErr) {
      console.error("validate_coupon error", vErr);
      return jsonResponse({ error: "Erro ao validar cupão." }, 500);
    }
    const row = Array.isArray(vRes) ? vRes[0] : vRes;
    if (!row?.valid) {
      return jsonResponse({ error: "Cupão inválido ou não aplicável." }, 400);
    }
    finalAmount = Number(row.final_price);
    discountApplied = Number(pkg.price_eur) - finalAmount;
    appliedCouponId = row.coupon_id;
  }

  if (finalAmount < 0) finalAmount = 0;
  // Multibanco needs a positive amount
  if (finalAmount <= 0) {
    return jsonResponse({ error: "Montante inválido após desconto." }, 400);
  }

  const entidade = (Deno.env.get("IFTHENPAY_ENTIDADE") ?? "").trim();
  const subentidade = (Deno.env.get("IFTHENPAY_SUBENTIDADE") ?? "").trim();
  if (!entidade || !subentidade) {
    console.error("Missing IFTHENPAY_ENTIDADE or IFTHENPAY_SUBENTIDADE");
    return jsonResponse({ error: "Configuração de pagamento em falta." }, 500);
  }

  const orderId = genOrderId();
  const amountStr = finalAmount.toFixed(2);
  const amountCents = Math.round(finalAmount * 100);

  const { data: seqData, error: seqErr } = await admin.rpc("next_ifthenpay_reference_number");
  if (seqErr || seqData == null) {
    console.error("sequence error:", seqErr);
    return jsonResponse({ error: "Erro ao gerar referência." }, 500);
  }
  const sequential = Number(seqData) % 10000;
  const reference = buildReference(subentidade, sequential, amountCents);

  const { error: insErr } = await admin.from("payment_orders").insert({
    user_id: user.id,
    order_id: orderId,
    payment_method: "multibanco",
    package: pkg.name,
    credits: pkg.credits,
    amount: amountStr,
    status: "pending",
    ifthenpay_entity: entidade,
    ifthenpay_reference: reference,
  });
  if (insErr) {
    console.error("payment_orders insert error:", insErr);
    return jsonResponse({ error: "Erro ao criar a ordem de pagamento." }, 500);
  }

  // Record coupon redemption (pending order — increments use count up-front)
  if (appliedCouponId) {
    const { error: redErr } = await admin.from("coupon_redemptions").insert({
      coupon_id: appliedCouponId,
      user_id: user.id,
      order_id: orderId,
      package_id: pkg.id,
      discount_applied: discountApplied,
    });
    if (redErr) {
      console.error("coupon redemption insert error:", redErr);
    } else {
      // Increment use counter
      const { data: cur } = await admin
        .from("discount_coupons")
        .select("uses_count")
        .eq("id", appliedCouponId)
        .maybeSingle();
      if (cur) {
        await admin
          .from("discount_coupons")
          .update({ uses_count: (cur.uses_count ?? 0) + 1 })
          .eq("id", appliedCouponId);
      }
    }
  }

  const expiry = new Date();
  expiry.setDate(expiry.getDate() + 3);

  return jsonResponse({
    orderId,
    entity: entidade,
    reference,
    amount: amountStr,
    expiryDate: expiry.toISOString().slice(0, 10),
    sandbox: false,
  });
});

// Creates a Multibanco payment reference via IfthenPay REST API.
// IfthenPay registers the reference in their system — valid at any ATM (entity + reference).
import { corsHeaders, getAuthedUser, jsonResponse } from "../_shared/auth.ts";

function genOrderId() {
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
  const packageId = typeof body?.packageId === "string" ? body.packageId : null;
  const acceptedTerms = body?.acceptedTerms === true;
  const couponCode = typeof body?.couponCode === "string" ? body.couponCode.trim() : "";
  const billingName = typeof body?.billingName === "string" ? body.billingName.trim() : null;
  const billingNif = typeof body?.billingNif === "string" ? body.billingNif.replace(/\D/g, "") : null;
  const billingAddress = typeof body?.billingAddress === "string" ? body.billingAddress.trim() : null;

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

  if (pkgErr || !pkg) return jsonResponse({ error: "Pacote indisponível." }, 400);

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
    if (!row?.valid) return jsonResponse({ error: "Cupão inválido ou não aplicável." }, 400);
    finalAmount = Number(row.final_price);
    discountApplied = Number(pkg.price_eur) - finalAmount;
    appliedCouponId = row.coupon_id;
  }

  if (finalAmount <= 0) return jsonResponse({ error: "Montante inválido após desconto." }, 400);

  const mbKey = (Deno.env.get("IFTHENPAY_MULTIBANCO_KEY") ?? "").trim();
  if (!mbKey) {
    console.error("Missing IFTHENPAY_MULTIBANCO_KEY");
    return jsonResponse({ error: "Configuração de pagamento em falta." }, 500);
  }

  const orderId = genOrderId();
  const amountStr = finalAmount.toFixed(2);
  const appUrl = (Deno.env.get("APP_URL") ?? "").trim();

  // 3) Call IfthenPay REST API — registers reference in SIBS and returns entity + reference
  let mbRes: Response;
  try {
    mbRes = await fetch(
      "https://api.ifthenpay.com/multibanco/reference/init",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({
          mbKey,
          orderId,
          amount: amountStr,
          description: pkg.name,
          url: appUrl,
          clientEmail: user.email ?? "",
          expiryDays: "3",
        }),
      },
    );
  } catch (fetchErr) {
    console.error("Multibanco fetch error:", fetchErr);
    return jsonResponse({ error: "Erro de ligação à IfthenPay." }, 502);
  }

  const mbData = await mbRes.json().catch(() => null);
  console.log("IfthenPay Multibanco response:", JSON.stringify(mbData));

  if (!mbRes.ok || mbData?.Status !== "0") {
    console.error("Multibanco API error:", mbRes.status, mbData);
    return jsonResponse({ error: mbData?.Message || "Erro ao gerar referência Multibanco." }, 502);
  }

  const entity = String(mbData.Entity ?? "");
  const reference = String(mbData.Reference ?? "");
  const expiryDate = String(mbData.ExpiryDate ?? "");

  if (!entity || !reference) {
    console.error("Missing entity/reference in response:", mbData);
    return jsonResponse({ error: "Resposta inválida da IfthenPay." }, 502);
  }

  // 4) Store pending order
  const { error: insErr } = await admin.from("payment_orders").insert({
    user_id: user.id,
    order_id: orderId,
    payment_method: "multibanco",
    package: pkg.name,
    credits: pkg.credits,
    amount: amountStr,
    status: "pending",
    ifthenpay_entity: entity,
    ifthenpay_reference: reference,
    billing_name: billingName || null,
    billing_nif: billingNif || null,
    billing_address: billingAddress || null,
  });
  if (insErr) {
    console.error("payment_orders insert error:", insErr);
    return jsonResponse({ error: "Erro ao criar a ordem de pagamento." }, 500);
  }

  // 5) Coupon redemption
  if (appliedCouponId) {
    const { error: redErr } = await admin.from("coupon_redemptions").insert({
      coupon_id: appliedCouponId,
      user_id: user.id,
      order_id: orderId,
      package_id: pkg.id,
      discount_applied: discountApplied,
    });
    if (!redErr) {
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

  return jsonResponse({
    orderId,
    entity,
    reference,
    amount: amountStr,
    expiryDate,
  });
});

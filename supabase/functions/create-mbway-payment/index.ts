// Creates an MBWay payment request via IfthenPay.
// Sends a push notification to the user's phone — they confirm in the MB WAY app.
// Stores a pending order; ifthenpay-callback handles confirmation.
import { corsHeaders, getAuthedUser, jsonResponse } from "../_shared/auth.ts";

function genOrderId() {
  const ts = Date.now().toString(36);
  const rnd = Math.random().toString(36).slice(2, 8);
  return `LMN${ts}${rnd}`.slice(0, 25).toUpperCase();
}

function formatPhone(raw: string): string {
  // IfthenPay ASMX API expects just the 9-digit PT mobile number
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("351") && digits.length === 12) return digits.slice(3);
  if (digits.length === 9 && digits.startsWith("9")) return digits;
  return "";
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
  const rawPhone = typeof body?.phone === "string" ? body.phone.trim() : "";

  if (!packageId) return jsonResponse({ error: "Pacote inválido." }, 400);
  if (!acceptedTerms) {
    return jsonResponse(
      { error: "Tem de aceitar os Termos, Política de Privacidade e Política de Reembolso." },
      400,
    );
  }

  const phone = formatPhone(rawPhone);
  if (!phone) {
    return jsonResponse(
      { error: "Número de telemóvel inválido. Use o formato 9XXXXXXXX." },
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
    if (vErr) return jsonResponse({ error: "Erro ao validar cupão." }, 500);
    const row = Array.isArray(vRes) ? vRes[0] : vRes;
    if (!row?.valid) return jsonResponse({ error: "Cupão inválido ou não aplicável." }, 400);
    finalAmount = Number(row.final_price);
    discountApplied = Number(pkg.price_eur) - finalAmount;
    appliedCouponId = row.coupon_id;
  }

  if (finalAmount <= 0) return jsonResponse({ error: "Montante inválido após desconto." }, 400);

  const mbwayKey = (Deno.env.get("IFTHENPAY_MBWAY_KEY") ?? "").trim();
  if (!mbwayKey) {
    console.error("Missing IFTHENPAY_MBWAY_KEY");
    return jsonResponse({ error: "Configuração de pagamento em falta." }, 500);
  }

  const orderId = genOrderId();
  // IfthenPay ASMX API requires amount with comma as decimal separator
  const amountStr = finalAmount.toFixed(2);
  const amountForApi = amountStr.replace(".", ",");
  // Referencia max 25 chars (already enforced by genOrderId)
  const descricao = `Ponto Cego - ${pkg.name}`.slice(0, 50);

  // 3) Call IfthenPay MBWay ASMX API
  const params = new URLSearchParams({
    MbWayKey: mbwayKey,
    Canal: "03",
    Referencia: orderId,
    valor: amountForApi,
    nrtlm: phone,
    email: user.email ?? "",
    descricao,
  });

  const mbwayRes = await fetch(
    "https://mbway.ifthenpay.com/IfthenPayMBW.asmx/SetPedidoJSON",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    },
  );

  const mbwayData = await mbwayRes.json().catch(() => null);
  if (!mbwayRes.ok || mbwayData?.Estado !== "000") {
    console.error("MBWay API error:", mbwayData);
    let msg: string = mbwayData?.MsgDescricao || "";
    if (!msg) {
      if (mbwayData?.Estado === "999") {
        msg = "Número não tem MB WAY ativo. Verifique se a app MB WAY está instalada e o número associado.";
      } else {
        msg = "Erro ao enviar pedido MB WAY.";
      }
    }
    return jsonResponse({ error: msg }, 502);
  }

  // 4) Store pending order
  const { error: insErr } = await admin.from("payment_orders").insert({
    user_id: user.id,
    order_id: orderId,
    payment_method: "mbway",
    package: pkg.name,
    credits: pkg.credits,
    amount: amountStr,
    status: "pending",
    mbway_phone: phone,
    ifthenpay_request_id: mbwayData.IdPedido ?? null,
  });
  if (insErr) {
    console.error("payment_orders insert error:", insErr);
    return jsonResponse({ error: "Erro ao criar a ordem de pagamento." }, 500);
  }

  // 5) Coupon redemption (same as Multibanco)
  if (appliedCouponId) {
    await admin.from("coupon_redemptions").insert({
      coupon_id: appliedCouponId,
      user_id: user.id,
      order_id: orderId,
      package_id: pkg.id,
      discount_applied: discountApplied,
    }).then(({ error }) => {
      if (!error) {
        admin.from("discount_coupons").select("uses_count").eq("id", appliedCouponId).maybeSingle()
          .then(({ data: cur }) => {
            if (cur) {
              admin.from("discount_coupons")
                .update({ uses_count: (cur.uses_count ?? 0) + 1 })
                .eq("id", appliedCouponId!);
            }
          });
      }
    });
  }

  return jsonResponse({
    orderId,
    phone: rawPhone,
    amount: amountStr,
    requestId: mbwayData.IdPedido,
  });
});

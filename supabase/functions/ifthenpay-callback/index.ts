// IfthenPay anti-phishing callback. Confirms a Multibanco payment and credits the user.
// Public endpoint (no JWT) — security relies on the anti-phishing key in query string.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

async function sendConfirmationEmail(
  toEmail: string,
  credits: number,
  amount: number,
  orderId: string,
) {
  const resendKey = Deno.env.get("RESEND_API_KEY");
  if (!resendKey) return;

  const appUrl = Deno.env.get("APP_URL") ?? "https://umavatar.pt";
  const creditLabel = credits === 1 ? "crédito" : "créditos";
  const html = `<!DOCTYPE html>
<html lang="pt">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f7f5f0;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f7f5f0;padding:40px 16px;">
    <tr><td align="center">
      <table width="520" cellpadding="0" cellspacing="0" style="max-width:520px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.06);">

        <!-- Header -->
        <tr>
          <td style="background:#1a2e22;padding:28px 40px;text-align:center;">
            <img src="${appUrl}/logo-umavatar.png" alt="Um Avatar" width="140" style="display:block;margin:0 auto;max-width:140px;" />
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:40px 40px 32px;">
            <h1 style="margin:0 0 8px;font-size:26px;font-weight:400;color:#1a1a1a;letter-spacing:-0.3px;">Pagamento confirmado</h1>
            <p style="margin:0 0 32px;font-size:15px;color:#666;line-height:1.6;">O seu pagamento foi processado com sucesso. Os seus créditos estão prontos a usar.</p>

            <!-- Credits box -->
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0ede6;border-radius:12px;margin-bottom:28px;">
              <tr>
                <td style="padding:28px 32px;">
                  <p style="margin:0 0 6px;font-size:11px;color:#999;text-transform:uppercase;letter-spacing:1.5px;font-family:Arial,sans-serif;">Créditos adicionados</p>
                  <p style="margin:0;font-size:52px;font-weight:400;color:#2d6b55;line-height:1;">${credits}</p>
                  <p style="margin:4px 0 0;font-size:14px;color:#888;font-family:Arial,sans-serif;">${creditLabel} disponíveis na sua conta</p>
                </td>
              </tr>
            </table>

            <!-- Order details -->
            <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #eee;margin-bottom:32px;">
              <tr>
                <td style="padding:12px 0;font-size:14px;color:#999;font-family:Arial,sans-serif;">Valor pago</td>
                <td style="padding:12px 0;font-size:14px;color:#1a1a1a;text-align:right;font-family:Arial,sans-serif;">${amount.toFixed(2).replace(".", ",")} €</td>
              </tr>
              <tr style="border-top:1px solid #f0ede6;">
                <td style="padding:12px 0;font-size:14px;color:#999;font-family:Arial,sans-serif;">Referência</td>
                <td style="padding:12px 0;font-size:13px;color:#555;text-align:right;font-family:monospace;">${orderId}</td>
              </tr>
            </table>

            <!-- CTA -->
            <table cellpadding="0" cellspacing="0">
              <tr>
                <td style="background:#2d6b55;border-radius:50px;">
                  <a href="${appUrl}/#experience" style="display:inline-block;padding:14px 32px;color:#ffffff;text-decoration:none;font-size:15px;font-family:Arial,sans-serif;font-weight:500;letter-spacing:0.2px;">Revelar a minha mensagem</a>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f7f5f0;padding:24px 40px;border-top:1px solid #ece9e2;">
            <p style="margin:0;font-size:12px;color:#aaa;line-height:1.6;font-family:Arial,sans-serif;">
              Um Ävatar &mdash; mensagens de reflexão baseadas em prática terapêutica real.<br>
              <a href="${appUrl}" style="color:#aaa;text-decoration:underline;">umavatar.pt</a>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: "Um Ävatar <noreply@umavatar.pt>",
      to: [toEmail],
      subject: `Os seus ${credits} ${creditLabel} estao prontos`,
      html,
    }),
  }).catch((e) => console.warn("Email send failed (non-fatal):", e));
}

async function sendAdminNotification(
  toAdmin: string,
  userEmail: string,
  credits: number,
  amount: number,
  orderId: string,
) {
  const resendKey = Deno.env.get("RESEND_API_KEY");
  if (!resendKey) return;

  const appUrl = Deno.env.get("APP_URL") ?? "https://umavatar.pt";
  const creditLabel = credits === 1 ? "crédito" : "créditos";
  const now = new Date().toLocaleString("pt-PT", { timeZone: "Europe/Lisbon", dateStyle: "short", timeStyle: "short" });
  const html = `<!DOCTYPE html>
<html lang="pt">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f7f5f0;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f7f5f0;padding:40px 16px;">
    <tr><td align="center">
      <table width="480" cellpadding="0" cellspacing="0" style="max-width:480px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.06);">
        <tr>
          <td style="background:#1a2e22;padding:20px 32px;">
            <p style="margin:0;font-size:11px;color:#6aad88;text-transform:uppercase;letter-spacing:1.5px;">Um Ävatar &mdash; Admin</p>
            <p style="margin:4px 0 0;font-size:18px;color:#ffffff;font-weight:400;">Nova compra confirmada</p>
          </td>
        </tr>
        <tr>
          <td style="padding:28px 32px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr style="border-bottom:1px solid #f0ede6;">
                <td style="padding:10px 0;font-size:13px;color:#999;">Utilizador</td>
                <td style="padding:10px 0;font-size:13px;color:#1a1a1a;text-align:right;">${userEmail}</td>
              </tr>
              <tr style="border-bottom:1px solid #f0ede6;">
                <td style="padding:10px 0;font-size:13px;color:#999;">Créditos</td>
                <td style="padding:10px 0;font-size:13px;color:#2d6b55;text-align:right;font-weight:600;">${credits} ${creditLabel}</td>
              </tr>
              <tr style="border-bottom:1px solid #f0ede6;">
                <td style="padding:10px 0;font-size:13px;color:#999;">Valor</td>
                <td style="padding:10px 0;font-size:13px;color:#1a1a1a;text-align:right;">${amount.toFixed(2).replace(".", ",")} €</td>
              </tr>
              <tr style="border-bottom:1px solid #f0ede6;">
                <td style="padding:10px 0;font-size:13px;color:#999;">Referência</td>
                <td style="padding:10px 0;font-size:12px;color:#555;text-align:right;font-family:monospace;">${orderId}</td>
              </tr>
              <tr>
                <td style="padding:10px 0;font-size:13px;color:#999;">Data</td>
                <td style="padding:10px 0;font-size:13px;color:#555;text-align:right;">${now}</td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="background:#f7f5f0;padding:16px 32px;border-top:1px solid #ece9e2;">
            <p style="margin:0;font-size:11px;color:#bbb;">
              <a href="${appUrl}/admin" style="color:#bbb;text-decoration:underline;">Painel admin</a>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: "Um Ävatar <noreply@umavatar.pt>",
      to: [toAdmin],
      subject: `Nova compra: ${credits} ${creditLabel} - ${amount.toFixed(2).replace(".", ",")} EUR`,
      html,
    }),
  }).catch((e) => console.warn("Admin email failed (non-fatal):", e));
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "content-type",
};

function txt(body: string, status = 200) {
  return new Response(body, { status, headers: { ...corsHeaders, "Content-Type": "text/plain" } });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const url = new URL(req.url);
  const params = url.searchParams;

  // Accept both query-string and POST body (IfthenPay typically sends GET callbacks)
  const get = (k: string) => params.get(k) ?? params.get(k.toLowerCase()) ?? params.get(k.toUpperCase());

  const key = get("key") ?? get("chave");
  let orderId = get("orderId") ?? get("order_id") ?? get("id") ?? get("referencia");
  const amount = get("amount") ?? get("valor");
  const requestId = get("requestId") ?? get("request_id") ?? get("terminal") ?? get("idpedido");
  const entity = get("entity") ?? get("entidade");
  const reference = get("reference");
  const paymentDatetime = get("payment_datetime") ?? get("paymentDatetime") ?? get("dataHoraPagamento") ?? get("datahorapag");
  const estado = get("estado") ?? get("status_mbway");

  const expectedKey = (Deno.env.get("IFTHENPAY_ANTI_PHISHING_KEY") ?? "").trim();
  const receivedKey = (key ?? "").trim();
  if (!expectedKey || receivedKey !== expectedKey) {
    console.warn("Invalid anti-phishing key", { receivedKeyPresent: !!receivedKey });
    return txt("invalid key", 401);
  }

  // MBWay sends `estado` in callback; only "000" means confirmed payment.
  // Return 200 so IfthenPay doesn't retry a genuinely failed payment.
  if (estado !== null && estado !== "000") {
    console.warn("MBWay payment not confirmed", { orderId, estado });
    return txt("not confirmed", 200);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // Fetch order: prefer orderId; otherwise look up by entity+reference (IfthenPay classic callback)
  let order: any = null;
  let fetchErr: any = null;

  if (orderId) {
    const r = await admin
      .from("payment_orders")
      .select("order_id, user_id, amount, credits, status, ifthenpay_entity, ifthenpay_reference")
      .eq("order_id", orderId)
      .maybeSingle();
    order = r.data; fetchErr = r.error;
  } else if (entity && reference) {
    const r = await admin
      .from("payment_orders")
      .select("order_id, user_id, amount, credits, status, ifthenpay_entity, ifthenpay_reference")
      .eq("ifthenpay_entity", entity)
      .eq("ifthenpay_reference", reference)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    order = r.data; fetchErr = r.error;
    if (order) orderId = order.order_id;
  } else {
    return txt("missing orderId or entity+reference", 400);
  }

  if (fetchErr || !order) {
    console.error("order not found:", { orderId, entity, reference, fetchErr });
    return txt("order not found", 404);
  }

  if (amount && Number(amount).toFixed(2) !== Number(order.amount).toFixed(2)) {
    console.warn("amount mismatch", { orderId, expected: order.amount, got: amount });
    return txt("amount mismatch", 400);
  }
  if (entity && order.ifthenpay_entity && entity !== order.ifthenpay_entity) {
    console.warn("entity mismatch", { orderId });
    return txt("entity mismatch", 400);
  }
  if (reference && order.ifthenpay_reference && reference !== order.ifthenpay_reference) {
    console.warn("reference mismatch", { orderId });
    return txt("reference mismatch", 400);
  }

  // Atomic + idempotent credit attribution via SECURITY DEFINER RPC
  const { data: rpcData, error: rpcErr } = await admin.rpc("mark_order_paid_and_credit", {
    _order_id: orderId,
    _ifthenpay_request_id: requestId,
  });
  if (rpcErr) {
    console.error("mark_order_paid_and_credit error:", rpcErr);
    return txt("server error", 500);
  }

  console.log("ifthenpay-callback ok", { orderId, balance: rpcData, paymentDatetime });

  // Fire-and-forget emails (non-blocking — payment is already confirmed)
  const adminEmail = Deno.env.get("ADMIN_EMAIL");
  const { data: authUser } = await admin.auth.admin.getUserById(order.user_id);
  const userEmail = authUser?.user?.email;

  if (userEmail) {
    void sendConfirmationEmail(userEmail, order.credits ?? 0, Number(order.amount), orderId);
  }
  if (adminEmail && userEmail) {
    void sendAdminNotification(adminEmail, userEmail, order.credits ?? 0, Number(order.amount), orderId);
  }

  return txt("ok");
});

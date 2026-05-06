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
  if (!resendKey) return; // Skip if not configured

  const appUrl = Deno.env.get("APP_URL") ?? "https://pontocego.pt";
  const html = `
    <div style="font-family:Georgia,serif;max-width:520px;margin:0 auto;padding:32px;color:#1a1a1a;">
      <h1 style="font-size:28px;margin-bottom:8px;">Pagamento confirmado</h1>
      <p style="color:#555;margin-bottom:24px;">O seu pagamento foi processado com sucesso.</p>

      <div style="background:#f5f3ef;border-radius:12px;padding:24px;margin-bottom:24px;">
        <p style="margin:0 0 8px 0;font-size:14px;color:#777;text-transform:uppercase;letter-spacing:1px;">Créditos adicionados</p>
        <p style="margin:0;font-size:40px;font-weight:400;color:#2d6b55;">${credits}</p>
      </div>

      <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:24px;">
        <tr><td style="padding:8px 0;color:#777;">Valor</td><td style="padding:8px 0;text-align:right;">${amount.toFixed(2).replace(".", ",")} €</td></tr>
        <tr><td style="padding:8px 0;color:#777;">Referência</td><td style="padding:8px 0;text-align:right;font-family:monospace;">${orderId}</td></tr>
      </table>

      <a href="${appUrl}/#experience" style="display:inline-block;background:#2d6b55;color:#fff;padding:14px 28px;border-radius:50px;text-decoration:none;font-size:16px;">
        Revelar a minha mensagem
      </a>

      <p style="margin-top:32px;font-size:12px;color:#999;">
        Ponto Cego — mensagens de reflexão baseadas em prática terapêutica real.
      </p>
    </div>
  `;

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: "Ponto Cego <noreply@pontocego.pt>",
      to: [toEmail],
      subject: `${credits} créditos adicionados à sua conta`,
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

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: "Ponto Cego <noreply@pontocego.pt>",
      to: [toAdmin],
      subject: `Nova compra: ${credits} créditos · ${amount.toFixed(2).replace(".", ",")} €`,
      html: `<p>Nova compra confirmada.</p>
             <ul>
               <li>Utilizador: ${userEmail}</li>
               <li>Créditos: ${credits}</li>
               <li>Valor: ${amount.toFixed(2).replace(".", ",")} €</li>
               <li>Ordem: ${orderId}</li>
             </ul>`,
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
  let orderId = get("orderId") ?? get("order_id") ?? get("id");
  const amount = get("amount") ?? get("valor");
  const requestId = get("requestId") ?? get("request_id") ?? get("terminal");
  const entity = get("entity") ?? get("entidade");
  const reference = get("reference") ?? get("referencia");
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

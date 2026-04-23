// IfthenPay anti-phishing callback. Confirms a Multibanco payment and credits the user.
// Public endpoint (no JWT) — security relies on the anti-phishing key in query string.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

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

  const key = get("key");
  const orderId = get("orderId") ?? get("order_id");
  const amount = get("amount");
  const requestId = get("requestId") ?? get("request_id");
  const entity = get("entity");
  const reference = get("reference");
  const paymentDatetime = get("payment_datetime") ?? get("paymentDatetime");

  const expectedKey = Deno.env.get("IFTHENPAY_ANTI_PHISHING_KEY");
  if (!expectedKey || key !== expectedKey) {
    console.warn("Invalid anti-phishing key", { receivedKeyPresent: !!key });
    return txt("invalid key", 401);
  }

  if (!orderId) return txt("missing orderId", 400);

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // Fetch order to validate amount/entity/reference before crediting
  const { data: order, error: fetchErr } = await admin
    .from("payment_orders")
    .select("user_id, amount, status, ifthenpay_entity, ifthenpay_reference")
    .eq("order_id", orderId)
    .maybeSingle();

  if (fetchErr || !order) {
    console.error("order not found:", orderId, fetchErr);
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
  const { data: balance, error: rpcErr } = await admin.rpc("mark_order_paid_and_credit", {
    _order_id: orderId,
    _ifthenpay_request_id: requestId,
  });
  if (rpcErr) {
    console.error("mark_order_paid_and_credit error:", rpcErr);
    return txt("server error", 500);
  }

  console.log("ifthenpay-callback ok", { orderId, balance, paymentDatetime });
  // IfthenPay only requires HTTP 200 — body can be anything
  return txt("ok");
});

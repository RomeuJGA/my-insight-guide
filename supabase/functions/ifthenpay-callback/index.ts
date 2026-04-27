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

  const key = get("key") ?? get("chave");
  let orderId = get("orderId") ?? get("order_id") ?? get("id");
  const amount = get("amount") ?? get("valor");
  const requestId = get("requestId") ?? get("request_id") ?? get("terminal");
  const entity = get("entity") ?? get("entidade");
  const reference = get("reference") ?? get("referencia");
  const paymentDatetime = get("payment_datetime") ?? get("paymentDatetime") ?? get("dataHoraPagamento") ?? get("datahorapag");

  const expectedKeyRaw = Deno.env.get("IFTHENPAY_ANTI_PHISHING_KEY") ?? "";
  const expectedKey = expectedKeyRaw.trim();
  const receivedKey = (key ?? "").trim();
  if (!expectedKey || receivedKey !== expectedKey) {
    const mask = (s: string) => s ? `${s.length}chars [${s.slice(0,2)}…${s.slice(-2)}]` : "empty";
    console.warn("Invalid anti-phishing key", {
      received: mask(receivedKey),
      expected: mask(expectedKey),
      rawHadWhitespace: expectedKeyRaw !== expectedKey,
    });
    return txt("invalid key", 401);
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
      .select("order_id, user_id, amount, status, ifthenpay_entity, ifthenpay_reference")
      .eq("order_id", orderId)
      .maybeSingle();
    order = r.data; fetchErr = r.error;
  } else if (entity && reference) {
    const r = await admin
      .from("payment_orders")
      .select("order_id, user_id, amount, status, ifthenpay_entity, ifthenpay_reference")
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

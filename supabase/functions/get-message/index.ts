import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

// Secure endpoint: returns ONE message by id. The full dataset is never exposed.
// RLS denies direct client access; this function uses the service role key
// to read a single row server-side.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") {
      return json({ error: "Method not allowed" }, 405);
    }

    const body = await req.json().catch(() => null);
    const rawId = body?.id;
    const id = typeof rawId === "number" ? rawId : parseInt(String(rawId), 10);

    if (!Number.isInteger(id) || id < 1 || id > 534) {
      return json({ error: "Número inválido. Escolha entre 1 e 534." }, 400);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceKey) {
      console.error("Missing Supabase environment variables");
      return json({ error: "Server misconfigured" }, 500);
    }

    const admin = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data, error } = await admin
      .from("messages")
      .select("id, content")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      console.error("DB error:", error);
      return json({ error: "Erro ao obter a mensagem." }, 500);
    }
    if (!data) {
      return json({ error: "Mensagem não encontrada." }, 404);
    }

    return json({ id: data.id, content: data.content }, 200);
  } catch (e) {
    console.error("Unhandled error:", e);
    return json({ error: "Erro inesperado." }, 500);
  }
});

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

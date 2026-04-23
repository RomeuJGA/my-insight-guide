// Simulated purchase: server-side validates the package and adds credits via SECURITY DEFINER RPC.
import { corsHeaders, getAuthedUser, jsonResponse } from "../_shared/auth.ts";

const PACKAGES: Record<string, { credits: number; label: string }> = {
  one: { credits: 1, label: "1 mensagem" },
  five: { credits: 5, label: "5 créditos" },
  ten: { credits: 10, label: "10 créditos" },
  twenty: { credits: 20, label: "20 créditos" },
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);

  const authed = await getAuthedUser(req);
  if ("error" in authed) return authed.error;
  const { user, admin } = authed;

  const body = await req.json().catch(() => null);
  const pkg = String(body?.package ?? "");
  const chosen = PACKAGES[pkg];
  if (!chosen) return jsonResponse({ error: "Pacote inválido." }, 400);

  const { data, error } = await admin.rpc("add_credits", {
    _user_id: user.id,
    _amount: chosen.credits,
    _type: "purchase",
    _description: `Compra simulada: ${chosen.label}`,
  });

  if (error) {
    console.error("buy-credits rpc error:", error);
    return jsonResponse({ error: "Erro ao processar compra." }, 500);
  }

  return jsonResponse({ credits: data, added: chosen.credits, package: pkg });
});

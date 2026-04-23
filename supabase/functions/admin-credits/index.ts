// Admin-only: add or remove credits from any user (by user_id UUID or email).
import { corsHeaders, getAuthedUser, isAdmin, jsonResponse } from "../_shared/auth.ts";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);

  const authed = await getAuthedUser(req);
  if ("error" in authed) return authed.error;
  const { user, admin } = authed;

  const ok = await isAdmin(admin, user.id);
  if (!ok) return jsonResponse({ error: "Apenas administradores." }, 403);

  const body = await req.json().catch(() => null);
  const rawIdentifier = String(body?.user_id ?? "").trim();
  const amount = Number(body?.amount);
  const description = String(body?.description ?? "Ajuste manual");

  if (!rawIdentifier || !Number.isInteger(amount) || amount === 0) {
    return jsonResponse({ error: "Parâmetros inválidos." }, 400);
  }
  if (Math.abs(amount) > 10000) {
    return jsonResponse({ error: "Quantidade fora do limite." }, 400);
  }

  // Resolve identifier → UUID (accepts UUID or email)
  let targetUserId = rawIdentifier;
  if (!UUID_RE.test(rawIdentifier)) {
    if (!rawIdentifier.includes("@")) {
      return jsonResponse({ error: "Indique um UUID ou email válido." }, 400);
    }
    const { data: list, error: listErr } = await admin.auth.admin.listUsers({
      page: 1,
      perPage: 200,
    });
    if (listErr) {
      console.error("listUsers error:", listErr);
      return jsonResponse({ error: "Erro ao procurar utilizador." }, 500);
    }
    const found = list.users.find(
      (u) => (u.email ?? "").toLowerCase() === rawIdentifier.toLowerCase(),
    );
    if (!found) return jsonResponse({ error: "Utilizador não encontrado." }, 404);
    targetUserId = found.id;
  }

  const { data, error } = await admin.rpc("add_credits", {
    _user_id: targetUserId,
    _amount: amount,
    _type: "admin",
    _description: description,
  });

  if (error) {
    console.error("admin-credits rpc error:", error);
    return jsonResponse({ error: "Erro ao ajustar créditos." }, 500);
  }

  return jsonResponse({ credits: data, user_id: targetUserId });
});

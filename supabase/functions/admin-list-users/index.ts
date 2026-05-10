// Admin-only: returns all users with their credit balances.
import { corsHeaders, getAuthedUser, isAdmin, jsonResponse } from "../_shared/auth.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "GET" && req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const authed = await getAuthedUser(req);
  if ("error" in authed) return authed.error;
  const { user, admin } = authed;

  const ok = await isAdmin(admin, user.id);
  if (!ok) return jsonResponse({ error: "Apenas administradores." }, 403);

  // Fetch all auth users (paginated, up to 1000)
  const { data: authData, error: authErr } = await admin.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });
  if (authErr) {
    console.error("listUsers error:", authErr);
    return jsonResponse({ error: "Erro ao obter utilizadores." }, 500);
  }

  // Fetch all credit balances
  const { data: credits, error: creditsErr } = await admin
    .from("user_credits")
    .select("user_id, credits, updated_at");
  if (creditsErr) {
    console.error("user_credits error:", creditsErr);
    return jsonResponse({ error: "Erro ao obter créditos." }, 500);
  }

  const creditMap = new Map(
    (credits ?? []).map((c) => [c.user_id, { credits: c.credits, updatedAt: c.updated_at }])
  );

  const users = authData.users.map((u) => {
    const c = creditMap.get(u.id);
    return {
      id: u.id,
      email: u.email ?? "",
      name: (u.user_metadata?.full_name as string | undefined) ?? null,
      credits: c?.credits ?? 0,
      creditsUpdatedAt: c?.updatedAt ?? null,
      createdAt: u.created_at,
      lastSignIn: u.last_sign_in_at ?? null,
    };
  });

  // Sort by credits desc, then by email
  users.sort((a, b) => b.credits - a.credits || a.email.localeCompare(b.email));

  return jsonResponse({ users });
});

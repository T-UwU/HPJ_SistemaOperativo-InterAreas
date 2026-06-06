// supabase/functions/manage-user/index.ts
// Acciones de administración sobre usuarios existentes.
// Solo accesible para usuarios con role_id = 'ti'.
//
// Deploy: supabase functions deploy manage-user

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });
}

// Llama directamente a la Auth Admin REST API para operaciones de ban
const authAdminPatch = async (
  supabaseUrl: string,
  serviceRoleKey: string,
  userId: string,
  body: Record<string, unknown>,
): Promise<void> => {
  const res = await fetch(`${supabaseUrl}/auth/v1/admin/users/${userId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${serviceRoleKey}`,
      'apikey': serviceRoleKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Auth API ${res.status}: ${text}`);
  }
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });

  // ── Auth ───────────────────────────────────────────────────────
  const authHeader = req.headers.get('Authorization') ?? '';
  if (!authHeader.startsWith('Bearer ')) return json({ error: 'No autorizado' }, 401);

  const supabaseUrl    = Deno.env.get('SUPABASE_URL')!;
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Verificar JWT con el cliente admin
  const token = authHeader.slice(7);
  const { data: userData, error: authError } = await admin.auth.getUser(token);
  const caller = userData?.user ?? null;
  if (authError || !caller) {
    return json({ error: `Sesión inválida: ${authError?.message ?? 'sin usuario'}` }, 401);
  }

  // Solo TI puede administrar usuarios
  const { data: profile } = await admin
    .from('profiles')
    .select('role_id')
    .eq('id', caller.id)
    .single();
  if (profile?.role_id !== 'ti') return json({ error: 'Sin permisos (requiere rol TI)' }, 403);

  // ── Leer body ──────────────────────────────────────────────────
  let body: { action?: string; user_id?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return json({ error: 'Body inválido' }, 400);
  }

  const { action, user_id, password } = body;
  if (!action || !user_id) return json({ error: 'Faltan campos: action, user_id' }, 400);

  // ── Acciones ───────────────────────────────────────────────────
  if (action === 'suspend') {
    try {
      await authAdminPatch(supabaseUrl, serviceRoleKey, user_id, { ban_duration: '876000h' });
    } catch (e) {
      return json({ error: (e as Error).message }, 400);
    }
    await admin.from('profiles').update({ suspended: true }).eq('id', user_id);
    return json({ ok: true });
  }

  if (action === 'unsuspend') {
    try {
      await authAdminPatch(supabaseUrl, serviceRoleKey, user_id, { ban_duration: 'none' });
    } catch (e) {
      return json({ error: (e as Error).message }, 400);
    }
    await admin.from('profiles').update({ suspended: false }).eq('id', user_id);
    return json({ ok: true });
  }

  if (action === 'reset-password') {
    if (!password || password.length < 6) {
      return json({ error: 'La contraseña debe tener al menos 6 caracteres' }, 400);
    }
    const { error: pwError } = await admin.auth.admin.updateUserById(user_id, { password });
    if (pwError) return json({ error: pwError.message }, 400);
    return json({ ok: true });
  }

  return json({ error: `Acción desconocida: ${action}` }, 400);
});

// supabase/functions/create-user/index.ts
// Crea un usuario en Auth + su perfil.
// Solo accesible para usuarios con role_id = 'ti'.
//
// Deploy: supabase functions deploy create-user
//   (o pega en Supabase Dashboard → Edge Functions → New Function)

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

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });

  // ── Verificar sesión del llamante ──────────────────────────────
  const authHeader = req.headers.get('Authorization') ?? '';
  if (!authHeader.startsWith('Bearer ')) return json({ error: 'No autorizado' }, 401);

  const supabaseUrl     = Deno.env.get('SUPABASE_URL')!;
  const serviceRoleKey  = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const anonKey         = Deno.env.get('SUPABASE_ANON_KEY')!;

  // Cliente con el JWT del llamante (para verificar quién es)
  const callerClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: { user: caller } } = await callerClient.auth.getUser();
  if (!caller) return json({ error: 'Sesión inválida' }, 401);

  // Cliente admin (service_role — solo vive en el servidor)
  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Verificar que el llamante sea TI
  const { data: profile } = await admin
    .from('profiles')
    .select('role_id')
    .eq('id', caller.id)
    .single();

  if (profile?.role_id !== 'ti') return json({ error: 'Sin permisos (requiere rol TI)' }, 403);

  // ── Crear el usuario ───────────────────────────────────────────
  const { email, password, name, role_id, shift } = await req.json();

  if (!email || !password || !name || !role_id) {
    return json({ error: 'Faltan campos requeridos: email, password, name, role_id' }, 400);
  }

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name, role_id, shift: shift || '—' },
  });

  if (error) return json({ error: error.message }, 400);

  return json({ id: data.user.id, email: data.user.email });
});

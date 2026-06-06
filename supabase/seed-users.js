// supabase/seed-users.js — Crea los 7 usuarios demo en Supabase Auth.
//
// USO:
//   1. En el dashboard de Supabase ve a Settings · API y copia la
//      service_role key (NUNCA expongas esta en el cliente).
//   2. Crea un archivo .env.local en la raíz con:
//        SUPABASE_URL=https://xxxx.supabase.co
//        SUPABASE_SERVICE_ROLE_KEY=eyJ...
//   3. Corre: node supabase/seed-users.js
//
// El trigger de schema.sql se encarga de crear el profile automáticamente
// leyendo el user_metadata.

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

// ── Cargar .env.local manualmente (sin dotenv) ─────────────────────
const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, '..', '.env.local');
try {
  const envFile = readFileSync(envPath, 'utf-8');
  for (const line of envFile.split('\n')) {
    const m = line.match(/^\s*([A-Z_]+)\s*=\s*(.+?)\s*$/);
    if (m) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
} catch {
  console.error('⚠  No se encontró .env.local en la raíz del proyecto.');
  console.error('   Crea uno con SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error('⚠  Faltan SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const admin = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ── Usuarios demo ───────────────────────────────────────────────────
// Mismas personas que usabas en el selector demo. Password único
// porque es ambiente de demo — cámbialo en prod.
const DEMO_PASSWORD = 'demo1234';

const USERS = [
  { email: 'recepcion@palaciojulio.test',     name: 'Lucía Ramírez',     role_id: 'reception' },
  { email: 'limpieza@palaciojulio.test',      name: 'Mariana Cruz',      role_id: 'housekeeping' },
  { email: 'ventas@palaciojulio.test',        name: 'Patricia Salinas',  role_id: 'sales' },
  { email: 'mantenimiento@palaciojulio.test', name: 'Eduardo Galindo',   role_id: 'maintenance' },
  { email: 'compras@palaciojulio.test',       name: 'Roberto Fuentes',   role_id: 'purchasing' },
  { email: 'ti@palaciojulio.test',            name: 'Admin TI',          role_id: 'ti' },
];

// ── Ejecutar ────────────────────────────────────────────────────────
console.log(`\nHotel Palacio Julio · Creando ${USERS.length} usuarios demo en ${url}\n`);

let created = 0;
let skipped = 0;

for (const u of USERS) {
  process.stdout.write(`  ${u.email.padEnd(38)} → `);
  const { data, error } = await admin.auth.admin.createUser({
    email: u.email,
    password: DEMO_PASSWORD,
    email_confirm: true,
    user_metadata: { name: u.name, role_id: u.role_id, shift: 'mat.' },
  });
  if (error) {
    if (error.message?.toLowerCase().includes('already')) {
      console.log('ya existe (skip)');
      skipped++;
    } else {
      console.log(`✗ ERROR: ${error.message}`);
    }
  } else {
    console.log(`✓ ${u.role_id}`);
    created++;
  }
}

console.log(`\n✓ Listo. ${created} creados · ${skipped} ya existían.\n`);
console.log('Credenciales para todos los usuarios:');
console.log(`   password: ${DEMO_PASSWORD}\n`);

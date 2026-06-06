// src/lib/supabase.js — Cliente Supabase + detección de modo.
//
// Si las env vars VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY están
// configuradas, exporta un cliente real y `isOnlineMode = true`.
// Si no, exporta null y la app cae al modo demo local (Zustand only).
//
// Esto permite seguir desarrollando offline sin requerir Supabase
// hasta que estés lista para conectar.

import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isOnlineMode = !!(url && key);

export const supabase = isOnlineMode
  ? createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
      },
    })
  : null;

// Helper para asegurarse de que el cliente está listo antes de usarlo
export function requireSupabase() {
  if (!supabase) {
    throw new Error(
      'Supabase no está configurado. Define VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en .env'
    );
  }
  return supabase;
}

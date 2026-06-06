// src/store/auth.js — Quién soy y qué rol manejo.
//
// Dos modos coexisten:
//   · ONLINE (Supabase configurado): login con email/password, sesión real,
//     profile leído de la tabla `profiles`.
//   · OFFLINE (demo): selector visual de rol, sin servidor, persistido
//     en localStorage como antes.
//
// El shape del store es el mismo en ambos modos para que las pantallas
// no tengan que diferenciar.

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase, isOnlineMode } from '../lib/supabase.js';

// Catálogo de roles — usado en login, guards y RoleMe.
// Versión ligera: solo cuatro áreas operativas.
export const ROLES = {
  sales:        { id: 'sales',        label: 'Ventas',        home: '/sales',        color: '#7C5F8A' },
  reception:    { id: 'reception',    label: 'Recepción',     home: '/reception',    color: 'var(--brass)' },
  maintenance:  { id: 'maintenance',  label: 'Mantenimiento', home: '/maintenance',  color: 'var(--danger)' },
  housekeeping: { id: 'housekeeping', label: 'Limpieza',      home: '/housekeeping', color: 'var(--info)' },
  purchasing:   { id: 'purchasing',   label: 'Compras',       home: '/purchasing',   color: '#2D6A4F' },
  ti:           { id: 'ti',           label: 'TI',            home: '/ti',           color: '#374151' },
};

// Usuarios demo (solo se usan en modo OFFLINE)
const DEMO_USERS = {
  sales:        { name: 'Patricia Salinas',  shift: 'mat.' },
  reception:    { name: 'Lucía Ramírez',     shift: 'mat.' },
  maintenance:  { name: 'Eduardo Galindo',   shift: 'mat.' },
  housekeeping: { name: 'Mariana Cruz',      shift: 'mat.' },
  purchasing:   { name: 'Roberto Fuentes',   shift: 'mat.' },
};

export const useAuth = create(
  persist(
    (set, get) => ({
      user: null,
      loading: isOnlineMode, // espera initSession en online
      error: null,

      // ── ONLINE: rehidrata sesión al cargar la app ────────────
      initSession: async () => {
        if (!isOnlineMode) {
          set({ loading: false });
          return;
        }
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (!session) {
            set({ user: null, loading: false });
          } else {
            await loadProfileFromSession(session, set);
          }
        } catch (err) {
          console.error('initSession error:', err);
          set({ user: null, loading: false, error: err.message });
        }

        // Suscribirse a cambios de sesión (refresh de token, signOut en otro tab, etc.)
        supabase.auth.onAuthStateChange((event, session) => {
          if (event === 'SIGNED_OUT' || !session) {
            set({ user: null });
          } else if (session && !get().user) {
            loadProfileFromSession(session, set);
          }
        });
      },

      // ── ONLINE: login con email + password ────────────────────
      loginWithEmail: async (email, password) => {
        if (!isOnlineMode) throw new Error('Supabase no configurado');
        set({ loading: true, error: null });
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          set({ loading: false, error: error.message });
          throw error;
        }
        await loadProfileFromSession(data.session, set);
      },

      // ── OFFLINE: login demo por rol ───────────────────────────
      loginDemo: (roleId) => {
        const role = ROLES[roleId];
        if (!role) throw new Error(`Rol desconocido: ${roleId}`);
        const profile = DEMO_USERS[roleId];
        set({ user: { roleId, ...profile }, loading: false, error: null });
      },

      // ── Cerrar sesión (funciona en ambos modos) ───────────────
      logout: async () => {
        if (isOnlineMode && supabase) {
          try { await supabase.auth.signOut(); } catch {}
        }
        set({ user: null });
      },

      // ── Cambio de rol en frío (solo offline) ──────────────────
      switchRole: (roleId) => {
        if (isOnlineMode) return;
        const role = ROLES[roleId];
        if (!role) return;
        const profile = DEMO_USERS[roleId];
        set({ user: { roleId, ...profile } });
      },
    }),
    {
      name: 'hpj.auth',
      // Online: no persistimos en localStorage — Supabase maneja la sesión.
      // Offline: persistimos el user demo.
      partialize: (s) => isOnlineMode ? {} : { user: s.user },
    }
  )
);

// Helper compartido: dado un session válido, jala el profile y actualiza el store
async function loadProfileFromSession(session, set) {
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('role_id, name, shift, email')
    .eq('id', session.user.id)
    .single();

  if (error || !profile) {
    set({
      user: null,
      loading: false,
      error: 'No se encontró perfil para este usuario. Revisa la tabla profiles.',
    });
    return;
  }

  set({
    user: {
      id: session.user.id,
      email: profile.email || session.user.email,
      roleId: profile.role_id,
      name: profile.name,
      shift: profile.shift || 'mat.',
    },
    loading: false,
    error: null,
  });
}

// ── Selectores ────────────────────────────────────────────────────
export const useCurrentUser = () => useAuth((s) => s.user);
export const useCurrentRole = () => {
  const user = useAuth((s) => s.user);
  return user ? ROLES[user.roleId] : null;
};

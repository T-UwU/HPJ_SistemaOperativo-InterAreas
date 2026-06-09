// src/store/activity.js — Actividad cruzada entre áreas.
// Persiste solo lastReadAt; events se rehidratan de Supabase o se acumulan en memoria.

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase, isOnlineMode } from '../lib/supabase.js';

let _activityChannel = null;

export const useActivity = create(
  persist(
    (set, get) => ({
      events: [],
      lastReadAt: {},   // { [roleId]: isoString } — one timestamp per role
      ready: false,

      init: async () => {
        if (_activityChannel) return; // único guard — evita doble suscripción en StrictMode y HMR
        if (isOnlineMode) {
          // Espera la sesión; sin ella, RLS devuelve vacío. Reintenta al iniciar sesión.
          const { data: { session } } = await supabase.auth.getSession();
          if (!session) return;
          try {
            // Siempre re-fetch para tener el historial fresco desde Supabase
            const { data } = await supabase
              .from('activity')
              .select('*')
              .order('created_at', { ascending: false })
              .limit(60);
            if (data) set({ events: data });
            set({ ready: true });

            _activityChannel = supabase.channel('hpj-activity')
              .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'activity' },
                ({ new: ev }) => set((s) => {
                  if (s.events.some((e) => e.id === ev.id)) return s;
                  return { events: [ev, ...s.events].slice(0, 60) };
                })
              )
              .subscribe();
          } catch {
            set({ ready: true });
          }
        } else {
          set({ ready: true });
        }
      },

      log: async (role, actor, action, room = null, refId = null) => {
        if (isOnlineMode) {
          try {
            // Insertar y obtener el registro con el id real asignado por Supabase
            const { data } = await supabase
              .from('activity')
              .insert({ role, actor, action, room, ref_id: refId })
              .select()
              .single();
            if (data) {
              // Agregar al estado con id real; Realtime lo deduplicará si llega también
              set((s) => {
                if (s.events.some((e) => e.id === data.id)) return s;
                return { events: [data, ...s.events].slice(0, 60) };
              });
            }
          } catch {
            // Supabase no disponible: registrar localmente para no perder el evento en sesión
            set((s) => ({ events: [{ id: Date.now(), role, actor, action, room: room ?? null, ref_id: refId ?? null, created_at: new Date().toISOString() }, ...s.events].slice(0, 60) }));
          }
        } else {
          set((s) => ({ events: [{ id: Date.now(), role, actor, action, room: room ?? null, ref_id: refId ?? null, created_at: new Date().toISOString() }, ...s.events].slice(0, 60) }));
        }
      },

      markRead: (roleId) => set((s) => ({
        lastReadAt: { ...s.lastReadAt, [roleId]: new Date().toISOString() },
      })),
    }),
    {
      name: 'hpj.activity',
      partialize: (s) => ({ lastReadAt: s.lastReadAt, events: s.events }),
      onRehydrateStorage: () => (state) => {
        // Migrar formato antiguo: si lastReadAt era un string ISO, descartarlo
        if (state && typeof state.lastReadAt !== 'object') {
          state.lastReadAt = {};
        }
      },
    }
  )
);

export function useActivityUnread(myRole) {
  const events   = useActivity((s) => s.events);
  const lastRead = useActivity((s) => s.lastReadAt);
  const ts       = myRole ? lastRead?.[myRole] : null;
  const since    = ts ? new Date(ts) : new Date(0);
  return events.filter((e) => e.role !== myRole && new Date(e.created_at) > since).length;
}

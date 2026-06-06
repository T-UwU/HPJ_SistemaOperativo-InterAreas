// src/store/chat.js — Chat entre áreas con Supabase Realtime.
// Modo online: lee + suscribe la tabla `messages` en tiempo real.
// Modo demo: mensajes locales en memoria para poder probar el UI.

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase, isOnlineMode } from '../lib/supabase.js';

let realtimeChannel = null;

export const useChat = create(
  persist(
    (set, get) => ({
      messages:   [],
      lastReadAt: null,
      ready:      false,

      init: async () => {
        if (!isOnlineMode) { set({ ready: true }); return; }
        try {
          const { data } = await supabase
            .from('messages')
            .select('*')
            .order('created_at', { ascending: true })
            .limit(200);
          set({ messages: data || [], ready: true });

          if (realtimeChannel) supabase.removeChannel(realtimeChannel);
          realtimeChannel = supabase
            .channel('area-chat')
            .on('postgres_changes',
              { event: 'INSERT', schema: 'public', table: 'messages' },
              ({ new: m }) =>
                set((s) => ({ messages: [...s.messages.filter((x) => x.id !== m.id), m] }))
            )
            .subscribe();
        } catch {
          set({ ready: true });
        }
      },

      send: async (fromRole, fromName, body) => {
        const text = body.trim();
        if (!text) return;
        if (!isOnlineMode) {
          set((s) => ({
            messages: [...s.messages, {
              id: crypto.randomUUID(),
              from_role: fromRole,
              from_name: fromName,
              body: text,
              created_at: new Date().toISOString(),
            }],
          }));
          return;
        }
        await supabase.from('messages').insert({ from_role: fromRole, from_name: fromName, body: text });
      },

      markRead: () => set({ lastReadAt: new Date().toISOString() }),
    }),
    { name: 'hpj.chat', partialize: (s) => ({ lastReadAt: s.lastReadAt }) }
  )
);

export function useChatUnread(myRole) {
  const messages   = useChat((s) => s.messages);
  const lastReadAt = useChat((s) => s.lastReadAt);
  if (!myRole) return 0;
  const since = lastReadAt ? new Date(lastReadAt) : new Date(0);
  return messages.filter(
    (m) => m.from_role !== myRole && new Date(m.created_at) > since
  ).length;
}

// src/store/evidence.js — evidencia fotográfica de limpieza.
// Online:  sube a Supabase Storage (bucket "evidence") y persiste las URLs en localStorage.
// Offline: convierte a dataURL y persiste en localStorage.

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase, isOnlineMode } from '../lib/supabase.js';

async function fileToDataUrl(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.readAsDataURL(file);
  });
}

async function uploadToStorage(roomId, taskId, file, index) {
  const ext  = file.name?.split('.').pop()?.toLowerCase() || 'jpg';
  const path = `${roomId}/${taskId}/${index}.${ext}`;
  const { error } = await supabase.storage
    .from('evidence')
    .upload(path, file, { upsert: true, contentType: file.type || 'image/jpeg' });
  if (error) throw error;
  return supabase.storage.from('evidence').getPublicUrl(path).data.publicUrl;
}

export const useEvidence = create(
  persist(
    (set) => ({
      byRoom: {},

      // files: File[] — viene de <input type="file"> o cámara
      submit: async (roomId, taskId, files) => {
        let photos;

        if (isOnlineMode && supabase) {
          try {
            photos = await Promise.all(
              files.map((file, i) => uploadToStorage(roomId, taskId, file, i))
            );
          } catch (err) {
            console.error('[evidence upload]', err);
            // Si el upload falla, caer a dataURL para no bloquear la entrega
            photos = await Promise.all(files.map(fileToDataUrl));
          }
        } else {
          photos = await Promise.all(files.map(fileToDataUrl));
        }

        set((s) => ({
          byRoom: {
            ...s.byRoom,
            [roomId]: { taskId, photos, at: new Date().toISOString() },
          },
        }));
      },
    }),
    {
      name: 'hpj.evidence',
      // Solo persistir byRoom (las URLs son strings ligeros, no base64 en online)
      partialize: (s) => ({ byRoom: s.byRoom }),
    }
  )
);

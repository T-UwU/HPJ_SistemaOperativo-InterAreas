import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,   // expón en LAN para probar desde el celu
    port: 5173,
    allowedHosts: ['repeat-contrary-enable-consultants.trycloudflare.com'],
  },
  // Pre-empaqueta Supabase al arrancar el servidor (en vez de descubrirlo
  // sobre la marcha). Evita la recarga a media carga que a veces dejaba a
  // Supabase sin inicializar y obligaba a reiniciar `npm run dev`.
  optimizeDeps: {
    include: ['@supabase/supabase-js'],
  },
});

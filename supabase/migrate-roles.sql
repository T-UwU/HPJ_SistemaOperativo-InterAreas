-- Migración del constraint de role_id en profiles.
-- Elimina roles desactivados (kitchen, management, concierge) y agrega purchasing.
--
-- ⚠ IMPORTANTE: antes de aplicar este constraint, asegúrate de que no existan
-- profiles con role_id = 'kitchen', 'management' o 'concierge'. Si los hay,
-- actualízalos primero:
--   UPDATE public.profiles SET role_id = 'reception' WHERE role_id IN ('kitchen','management','concierge');
--
-- Idempotente: puede correrse varias veces sin romper nada.

-- 1. Eliminar el constraint viejo (si existe con cualquier nombre)
alter table public.profiles
  drop constraint if exists profiles_role_id_check;

-- 2. Agregar el constraint nuevo con los 5 roles activos
alter table public.profiles
  add constraint profiles_role_id_check
  check (role_id in ('reception', 'housekeeping', 'maintenance', 'sales', 'purchasing'));

-- 3. Actualizar el trigger handle_new_user para que el default sea 'reception'
-- (ya era así en schema.sql — no se necesita cambio, pero se documenta aquí)

-- 4. Verificar resultado (solo informativo, no ejecutar en producción sin revisar):
-- select role_id, count(*) from public.profiles group by role_id;

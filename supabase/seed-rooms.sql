-- ═══════════════════════════════════════════════════════════════════
-- Hotel Palacio Julio · Inventario completo de habitaciones
-- ───────────────────────────────────────────────────────────────────
-- Carga las 71 habitaciones del hotel (pisos 1 a 8) como vacías y limpias
-- (status 'limpia', sin huésped).
--
-- USO: pega este archivo en el SQL Editor de Supabase y "Run".
-- Es idempotente: al volver a correrlo deja todas las habitaciones de la
-- lista vacías otra vez.
--
-- OBSERVACIÓN: esta es la distribución de referencia del sistema (la misma
-- que trae la app por defecto). Si el inventario real del hotel difiere,
-- ajusta los renglones de la lista de VALUES: cada uno es
--   ('numero', piso, 'tipo', 'limpia', null)
-- Estados válidos: 'limpia', 'ocupada', 'sucia', 'checkout', 'bloqueada', 'libre'.
--
-- Para REEMPLAZAR por completo el inventario (borrar lo que haya y dejar
-- solo estas 71 habitaciones), descomenta la siguiente línea:
-- delete from public.rooms;
-- ═══════════════════════════════════════════════════════════════════

insert into public.rooms (id, floor, type, status, guest) values
  -- Piso 1
  ('101', 1, 'Estándar',       'limpia', null),
  ('102', 1, 'Estándar',       'limpia', null),
  ('103', 1, 'Estándar',       'limpia', null),
  ('104', 1, 'Estándar',       'limpia', null),
  ('105', 1, 'Estándar',       'limpia', null),
  ('106', 1, 'Estándar',       'limpia', null),
  ('107', 1, 'Estándar',       'limpia', null),
  ('108', 1, 'Estándar',       'limpia', null),
  ('118', 1, 'Familiar',       'limpia', null),
  ('119', 1, 'Familiar',       'limpia', null),
  -- Piso 2
  ('201', 2, 'Estándar',       'limpia', null),
  ('202', 2, 'Estándar',       'limpia', null),
  ('203', 2, 'Estándar',       'limpia', null),
  ('204', 2, 'Doble Superior', 'limpia', null),
  ('205', 2, 'Estándar',       'limpia', null),
  ('206', 2, 'Estándar',       'limpia', null),
  ('207', 2, 'Estándar',       'limpia', null),
  ('208', 2, 'Doble Superior', 'limpia', null),
  ('209', 2, 'Estándar',       'limpia', null),
  ('217', 2, 'Estándar',       'limpia', null),
  ('221', 2, 'Estándar',       'limpia', null),
  -- Piso 3
  ('301', 3, 'Estándar',       'limpia', null),
  ('302', 3, 'Estándar',       'limpia', null),
  ('303', 3, 'Estándar',       'limpia', null),
  ('304', 3, 'Junior Suite',   'limpia', null),
  ('305', 3, 'Estándar',       'limpia', null),
  ('306', 3, 'Estándar',       'limpia', null),
  ('307', 3, 'Junior Suite',   'limpia', null),
  ('308', 3, 'Estándar',       'limpia', null),
  ('309', 3, 'Estándar',       'limpia', null),
  -- Piso 4
  ('401', 4, 'Estándar',       'limpia', null),
  ('402', 4, 'Estándar',       'limpia', null),
  ('403', 4, 'Estándar',       'limpia', null),
  ('404', 4, 'Doble Superior', 'limpia', null),
  ('405', 4, 'Estándar',       'limpia', null),
  ('406', 4, 'Estándar',       'limpia', null),
  ('407', 4, 'Estándar',       'limpia', null),
  ('408', 4, 'Estándar',       'limpia', null),
  ('409', 4, 'Junior Suite',   'limpia', null),
  ('410', 4, 'Estándar',       'limpia', null),
  ('411', 4, 'Estándar',       'limpia', null),
  ('412', 4, 'Suite',          'limpia', null),
  -- Piso 5
  ('501', 5, 'Superior',       'limpia', null),
  ('502', 5, 'Superior',       'limpia', null),
  ('503', 5, 'Superior',       'limpia', null),
  ('504', 5, 'Superior',       'limpia', null),
  ('505', 5, 'Superior',       'limpia', null),
  ('506', 5, 'Junior Suite',   'limpia', null),
  ('507', 5, 'Superior',       'limpia', null),
  ('508', 5, 'Superior',       'limpia', null),
  ('509', 5, 'Superior',       'limpia', null),
  ('510', 5, 'Suite',          'limpia', null),
  -- Piso 6
  ('601', 6, 'Superior',       'limpia', null),
  ('602', 6, 'Superior',       'limpia', null),
  ('603', 6, 'Superior',       'limpia', null),
  ('604', 6, 'Junior Suite',   'limpia', null),
  ('605', 6, 'Junior Suite',   'limpia', null),
  ('606', 6, 'Superior',       'limpia', null),
  -- Piso 7
  ('701', 7, 'Junior Suite',   'limpia', null),
  ('702', 7, 'Junior Suite',   'limpia', null),
  ('703', 7, 'Junior Suite',   'limpia', null),
  ('704', 7, 'Suite',          'limpia', null),
  ('705', 7, 'Junior Suite',   'limpia', null),
  ('706', 7, 'Suite',          'limpia', null),
  -- Piso 8
  ('801', 8, 'Suite',          'limpia', null),
  ('802', 8, 'Suite',          'limpia', null),
  ('803', 8, 'Suite',          'limpia', null),
  ('804', 8, 'Suite Palacio',  'limpia', null),
  ('805', 8, 'Suite Palacio',  'limpia', null),
  ('806', 8, 'Suite',          'limpia', null),
  ('807', 8, 'Suite Palacio',  'limpia', null)
on conflict (id) do update
  set floor  = excluded.floor,
      type   = excluded.type,
      status = 'limpia',
      guest  = null;

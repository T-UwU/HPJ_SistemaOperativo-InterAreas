-- ═══════════════════════════════════════════════════════════════════
-- Hotel Palacio Julio · Catálogos de salones y áreas
-- ───────────────────────────────────────────────────────────────────
-- Crea dos tablas para administrar, desde Supabase, los salones de
-- eventos (Ventas) y las áreas comunes (Limpieza y Mantenimiento), igual
-- que se administran las habitaciones.
--
-- USO: pega este archivo en el SQL Editor de Supabase y "Run".
-- Es idempotente: puede correrse varias veces sin romper nada.
--
-- COMO EDITAR: una vez creadas las tablas, ve a Table Editor y agrega,
-- edita o desactiva (active = false) los renglones. Los cambios se
-- reflejan en la app al recargar.
-- ═══════════════════════════════════════════════════════════════════


-- ── 1 · Salones de eventos (los usa Ventas al crear o editar) ───────
create table if not exists public.salones (
  id     text primary key,
  name   text not null,
  sort   int  not null default 0,   -- orden de aparición
  active boolean not null default true
);

-- ── 2 · Áreas comunes (las usan Limpieza y Mantenimiento) ───────────
create table if not exists public.areas (
  id     text primary key,
  label  text not null,
  sort   int  not null default 0,
  active boolean not null default true
);


-- ── 3 · Seguridad (RLS): lectura y escritura para autenticados ──────
alter table public.salones enable row level security;
alter table public.areas   enable row level security;

drop policy if exists "salones read"  on public.salones;
drop policy if exists "salones write" on public.salones;
create policy "salones read"  on public.salones for select using (auth.role() = 'authenticated');
create policy "salones write" on public.salones for all    using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

drop policy if exists "areas read"  on public.areas;
drop policy if exists "areas write" on public.areas;
create policy "areas read"  on public.areas for select using (auth.role() = 'authenticated');
create policy "areas write" on public.areas for all    using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');


-- ── 4 · Tiempo real ─────────────────────────────────────────────────
alter publication supabase_realtime add table public.salones;
alter publication supabase_realtime add table public.areas;


-- ── 5 · Valores iniciales (los actuales de la app) ──────────────────
-- Salones de eventos
insert into public.salones (id, name, sort) values
  ('salon-palacio',     'Salón Palacio',     1),
  ('sala-chapultepec',  'Sala Chapultepec',  2),
  ('terraza-principal', 'Terraza Principal', 3),
  ('sala-ejecutiva',    'Sala Ejecutiva',    4)
on conflict (id) do nothing;

-- Áreas comunes
insert into public.areas (id, label, sort) values
  ('salon-versalles', 'Salón Versalles',       1),
  ('salon-jardin',    'Salón Jardín',          2),
  ('salon-terraza',   'Salón Terraza',         3),
  ('lobby',           'Lobby principal',       4),
  ('alberca',         'Área de alberca',       5),
  ('restaurante',     'Restaurante',           6),
  ('bar',             'Bar / Lounge',          7),
  ('gimnasio',        'Gimnasio',              8),
  ('spa',             'Spa',                   9),
  ('elevadores',      'Elevadores',            10),
  ('pasillos',        'Pasillos / Corredores', 11),
  ('estacionamiento', 'Estacionamiento',       12),
  ('roof',            'Roof garden',           13)
on conflict (id) do nothing;

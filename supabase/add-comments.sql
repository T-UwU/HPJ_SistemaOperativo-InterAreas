-- Tabla de comentarios contextuales atados a un objeto del sistema.
-- Ejecutar después de add-events.sql.
-- Idempotente.

create table if not exists public.comments (
  id          bigint generated always as identity primary key,
  entity_type text not null check (entity_type in ('ticket', 'event')),
  entity_id   text not null,
  author      text not null,
  role        text not null,
  body        text not null,
  created_at  timestamptz not null default now()
);

-- Índice para filtrar rápido por entidad
create index if not exists comments_entity_idx
  on public.comments (entity_type, entity_id);

-- RLS
alter table public.comments enable row level security;

drop policy if exists "usuarios autenticados pueden leer comentarios" on public.comments;
create policy "usuarios autenticados pueden leer comentarios"
  on public.comments for select
  using (auth.role() = 'authenticated');

drop policy if exists "usuarios autenticados pueden insertar comentarios" on public.comments;
create policy "usuarios autenticados pueden insertar comentarios"
  on public.comments for insert
  with check (auth.role() = 'authenticated');

-- Realtime
alter publication supabase_realtime add table public.comments;

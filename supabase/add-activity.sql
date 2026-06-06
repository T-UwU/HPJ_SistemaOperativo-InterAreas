-- Tabla de actividad cruzada entre áreas.
-- Ejecutar en el SQL Editor de Supabase después de add-messages.sql.

create table if not exists public.activity (
  id          bigint generated always as identity primary key,
  role        text not null,
  actor       text not null,
  action      text not null,
  room        text,
  ref_id      text,
  created_at  timestamptz not null default now()
);

alter table public.activity enable row level security;

create policy "authenticated users can read activity"
  on public.activity for select
  using (auth.role() = 'authenticated');

create policy "authenticated users can insert activity"
  on public.activity for insert
  with check (auth.role() = 'authenticated');

-- Publicar cambios en tiempo real
alter publication supabase_realtime add table public.activity;

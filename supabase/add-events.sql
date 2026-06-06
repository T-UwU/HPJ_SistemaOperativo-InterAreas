-- Tabla de Ordenes de Evento — entidad central de coordinación entre áreas.
-- Ejecutar después de add-activity.sql.
-- Idempotente: puede correrse varias veces sin romper nada.

create table if not exists public.events (
  id          text primary key,
  name        text not null,
  date        date not null,
  time        text not null,
  salon       text not null,
  pax         int  not null default 0,
  client      text,
  created_by  text not null default 'sales',
  menu        text,
  allergens   text,
  notes       text,
  status      text not null default 'borrador'
    check (status in ('borrador', 'confirmado', 'cerrado')),
  -- acks: objeto JSON por área { housekeeping, maintenance, reception, purchasing }
  -- null = pendiente, string ISO = confirmado con timestamp
  acks        jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- RLS
alter table public.events enable row level security;

drop policy if exists "usuarios autenticados pueden leer eventos" on public.events;
create policy "usuarios autenticados pueden leer eventos"
  on public.events for select
  using (auth.role() = 'authenticated');

drop policy if exists "usuarios autenticados pueden insertar eventos" on public.events;
create policy "usuarios autenticados pueden insertar eventos"
  on public.events for insert
  with check (auth.role() = 'authenticated');

drop policy if exists "usuarios autenticados pueden actualizar eventos" on public.events;
create policy "usuarios autenticados pueden actualizar eventos"
  on public.events for update
  using (auth.role() = 'authenticated');

-- Realtime
alter publication supabase_realtime add table public.events;

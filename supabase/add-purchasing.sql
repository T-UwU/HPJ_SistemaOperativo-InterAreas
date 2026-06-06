-- Tabla de Requisiciones para el rol Compras.
-- Ejecutar después de add-comments.sql.
-- Idempotente.

create table if not exists public.requisitions (
  id            text primary key,
  area          text not null,  -- área que solicita (maintenance, housekeeping, etc.)
  item          text not null,
  qty           int  not null default 1,
  requested_by  text not null,
  status        text not null default 'pedido'
    check (status in ('pedido', 'en-camino', 'surtido')),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- RLS
alter table public.requisitions enable row level security;

drop policy if exists "usuarios autenticados pueden leer requisiciones" on public.requisitions;
create policy "usuarios autenticados pueden leer requisiciones"
  on public.requisitions for select
  using (auth.role() = 'authenticated');

drop policy if exists "usuarios autenticados pueden insertar requisiciones" on public.requisitions;
create policy "usuarios autenticados pueden insertar requisiciones"
  on public.requisitions for insert
  with check (auth.role() = 'authenticated');

drop policy if exists "usuarios autenticados pueden actualizar requisiciones" on public.requisitions;
create policy "usuarios autenticados pueden actualizar requisiciones"
  on public.requisitions for update
  using (auth.role() = 'authenticated');

-- Realtime
alter publication supabase_realtime add table public.requisitions;

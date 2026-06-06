-- ═══════════════════════════════════════════════════════════════════
-- Hotel Palacio Julio · Schema completo
-- ───────────────────────────────────────────────────────────────────
-- Pega este archivo entero en el SQL Editor de Supabase y "Run".
-- Es idempotente: puedes correrlo varias veces sin romper nada
-- (excepto si ya hay datos diferentes — entonces drop y re-corre).
-- ═══════════════════════════════════════════════════════════════════

-- ───────────────────────────────────────────────────────────────────
-- 1 · Profiles · extiende auth.users con rol + nombre
-- ───────────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id         uuid primary key references auth.users on delete cascade,
  email      text unique not null,
  name       text not null,
  role_id    text not null check (role_id in (
    'reception','housekeeping','kitchen','sales','maintenance','management','concierge'
  )),
  shift      text default 'mat.',
  created_at timestamptz default now()
);

-- Trigger: cuando se crea un user en auth, automáticamente se crea
-- su profile leyendo de raw_user_meta_data (name y role_id).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, name, role_id, shift)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'role_id', 'reception'),
    coalesce(new.raw_user_meta_data->>'shift', 'mat.')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ───────────────────────────────────────────────────────────────────
-- 2 · Rooms
-- ───────────────────────────────────────────────────────────────────
create table if not exists public.rooms (
  id          text primary key,
  floor       int not null,
  type        text not null,
  status      text not null check (status in ('ocupada','limpia','sucia','checkout','bloqueada','libre')),
  guest       text,
  vip_pending text,
  updated_at  timestamptz default now()
);

-- ───────────────────────────────────────────────────────────────────
-- 3 · Arrivals (check-ins del día)
-- ───────────────────────────────────────────────────────────────────
create table if not exists public.arrivals (
  id           text primary key,
  guest        text not null,
  room         text not null,
  vip          boolean default false,
  plan         text,
  stay         text,
  time         text,
  status       text check (status in ('warn','ok','info')),
  status_label text,
  done         boolean default false,
  updated_at   timestamptz default now()
);

-- ───────────────────────────────────────────────────────────────────
-- 4 · Requests (concierge)
-- ───────────────────────────────────────────────────────────────────
create table if not exists public.requests (
  id          text primary key,
  type        text not null,
  icon        text,
  guest       text not null,
  room        text,
  vip         boolean default false,
  detail      text,
  assigned_to text,
  sla         text,
  status      text not null,
  priority    text,
  urgent      boolean default false,
  created_at  timestamptz default now()
);

-- ───────────────────────────────────────────────────────────────────
-- 5 · Tickets (maintenance)
-- 'desc' es confuso en SQL, uso 'description'. El mapper del frontend
-- convierte description ↔ desc.
-- ───────────────────────────────────────────────────────────────────
create table if not exists public.tickets (
  id          text primary key,
  room        text not null,
  category    text not null,
  description text not null,
  reported_by text,
  reporter    text,
  sla         text,
  status      text not null check (status in ('abierto','aceptado','programado','cerrado')),
  priority    text check (priority in ('alta','media','baja')),
  reported_at text,
  progress    int default 0,
  closed_at   text,
  duration    text,
  warranty    boolean default false,
  created_at  timestamptz default now()
);

-- ───────────────────────────────────────────────────────────────────
-- 6 · Tasks (housekeeping)
-- ───────────────────────────────────────────────────────────────────
create table if not exists public.tasks (
  id           text primary key,
  room         text not null,
  type         text not null,
  type_label   text,
  status       text not null check (status in ('pendiente','en-curso','completada')),
  priority     text check (priority in ('alta','media','baja')),
  note         text,
  sla          text,
  tags         text[] default '{}',
  assigned_to  text,
  progress     int default 0,
  total        int,
  completed_at text,
  created_at   timestamptz default now()
);

-- ───────────────────────────────────────────────────────────────────
-- 7 · Orders (kitchen)
-- items es jsonb (array de platillos con su estación y status)
-- ───────────────────────────────────────────────────────────────────
create table if not exists public.orders (
  id            text primary key,
  room          text not null,
  guest         text,
  vip           boolean default false,
  type          text,
  meal_kind     text check (meal_kind in ('desayuno','room-service','cena')),
  time          text,
  time_label    text,
  status        text not null check (status in ('queued','preparing','ready','sent')),
  note          text,
  allergen      boolean default false,
  allergy_text  text,
  repeat        text,
  prep_time     text,
  start_by      text,
  delivery_via  text,
  accepted_at   text,
  items         jsonb default '[]'::jsonb,
  created_at    timestamptz default now()
);

-- ───────────────────────────────────────────────────────────────────
-- 8 · Reservations (sales)
-- 'group' es reservada — uso is_group
-- ───────────────────────────────────────────────────────────────────
create table if not exists public.reservations (
  id           text primary key,
  guest_name   text not null,
  customer_id  text,
  channel      text,
  stay         text,
  check_in     text,
  check_out    text,
  nights       int,
  room         text,
  room_type    text,
  plan         text,
  amount       numeric default 0,
  status       text not null check (status in ('confirmada','por-confirmar','seguimiento','in-house')),
  vip          boolean default false,
  is_group     boolean default false,
  today        boolean default false,
  created_at   timestamptz default now()
);

-- ───────────────────────────────────────────────────────────────────
-- 9 · Room types (catálogo)
-- ───────────────────────────────────────────────────────────────────
create table if not exists public.room_types (
  id              text primary key,
  name            text not null,
  price_per_night numeric not null,
  features        text
);

-- ───────────────────────────────────────────────────────────────────
-- 10 · Customers (CRM)
-- insights y previous_stays son jsonb arrays
-- ───────────────────────────────────────────────────────────────────
create table if not exists public.customers (
  id               text primary key,
  name             text not null,
  tier             text check (tier in ('oro','plata','bronce')),
  vip              boolean default false,
  since            int,
  stays            int default 0,
  lifetime_revenue numeric default 0,
  nps              numeric,
  contact          text,
  insights         jsonb default '[]'::jsonb,
  previous_stays   jsonb default '[]'::jsonb
);

-- ───────────────────────────────────────────────────────────────────
-- 11 · Pending order alert (singleton para banner de cocina)
-- ───────────────────────────────────────────────────────────────────
create table if not exists public.pending_order_alert (
  id    text primary key default 'singleton',
  alert jsonb
);

-- ═══════════════════════════════════════════════════════════════════
-- Row Level Security · permisivo para empezar
-- Cualquier usuario autenticado puede leer y escribir todas las tablas
-- operativas. Profiles tiene reglas un poco más finas.
-- En un pase futuro: permisos por rol.
-- ═══════════════════════════════════════════════════════════════════

-- Helper: macro implícita para enable RLS + policies básicas
do $$
declare
  t text;
begin
  for t in select unnest(array[
    'rooms','arrivals','requests','tickets','tasks','orders',
    'reservations','room_types','customers','pending_order_alert'
  ]) loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists "auth read"  on public.%I', t);
    execute format('drop policy if exists "auth write" on public.%I', t);
    execute format('create policy "auth read"  on public.%I for select using (auth.role() = ''authenticated'')', t);
    execute format('create policy "auth write" on public.%I for all    using (auth.role() = ''authenticated'') with check (auth.role() = ''authenticated'')', t);
  end loop;
end $$;

-- Profiles: cada quien lee/edita el suyo, pero todos pueden leer
-- los de los demás (para mostrar avatars, nombres en cards, etc.).
alter table public.profiles enable row level security;
drop policy if exists "profiles select" on public.profiles;
drop policy if exists "profiles update own" on public.profiles;
create policy "profiles select" on public.profiles
  for select using (auth.role() = 'authenticated');
create policy "profiles update own" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- ═══════════════════════════════════════════════════════════════════
-- Realtime · habilitar en todas las tablas operativas
-- ═══════════════════════════════════════════════════════════════════
alter publication supabase_realtime add table public.rooms;
alter publication supabase_realtime add table public.arrivals;
alter publication supabase_realtime add table public.requests;
alter publication supabase_realtime add table public.tickets;
alter publication supabase_realtime add table public.tasks;
alter publication supabase_realtime add table public.orders;
alter publication supabase_realtime add table public.reservations;
alter publication supabase_realtime add table public.customers;
alter publication supabase_realtime add table public.pending_order_alert;

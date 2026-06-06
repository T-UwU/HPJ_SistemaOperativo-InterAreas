-- ═══════════════════════════════════════════════════════════════════
-- Hotel Palacio Julio · Reset completo + rol TI
-- ─────────────────────────────────────────────────────────────────
-- PASOS PARA RESETEAR DESDE CERO:
--
--   1. Supabase dashboard → Authentication → Users
--      Selecciona todos → Delete users
--
--   2. Pega este archivo en el SQL Editor → Run
--
--   3. node supabase/seed-users.js
--      (recrea los 6 usuarios demo incluyendo TI)
--
--   4. Abre la app y recarga — el localStorage se limpia solo.
-- ═══════════════════════════════════════════════════════════════════


-- ── 1 · Vaciar tablas operativas ────────────────────────────────────
-- activity y comments tienen columna identity → restart identity.
-- El resto tienen PK de texto → solo cascade.

truncate table public.activity     restart identity cascade;
truncate table public.comments     restart identity cascade;
truncate table public.messages                      cascade;
truncate table public.rooms                         cascade;
truncate table public.arrivals                      cascade;
truncate table public.tickets                       cascade;
truncate table public.tasks                         cascade;
truncate table public.reservations                  cascade;
truncate table public.orders                        cascade;
truncate table public.requests                      cascade;
truncate table public.room_types                    cascade;
truncate table public.customers                     cascade;
truncate table public.events                        cascade;
truncate table public.requisitions                  cascade;
truncate table public.pending_order_alert           cascade;

-- Perfiles: se recrean vía trigger cuando se corre seed-users.js
delete from public.profiles;


-- ── 1b · Agregar columna suspended a profiles ───────────────────────
alter table public.profiles
  add column if not exists suspended boolean not null default false;


-- ── 2 · Constraint de profiles: agregar rol 'ti' ────────────────────

alter table public.profiles
  drop constraint if exists profiles_role_id_check;

alter table public.profiles
  add constraint profiles_role_id_check
  check (role_id in (
    'reception', 'housekeeping', 'maintenance', 'sales', 'purchasing', 'ti'
  ));


-- ── 3 · Trigger: soporte para 'ti' ──────────────────────────────────

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, name, role_id, shift)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name',    split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'role_id', 'reception'),
    coalesce(new.raw_user_meta_data->>'shift',   '—')
  )
  on conflict (id) do update
    set name    = excluded.name,
        role_id = excluded.role_id,
        shift   = excluded.shift;
  return new;
end; $$;


-- ── 4 · Función auxiliar: detecta si el usuario activo es TI ─────────
-- security definer → corre como postgres, evita auto-referencia en RLS

create or replace function public.is_ti()
returns boolean language sql security definer stable set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role_id = 'ti'
  );
$$;


-- ── 5 · Política RLS: TI puede actualizar cualquier perfil ───────────

drop policy if exists "ti update any profile" on public.profiles;
create policy "ti update any profile"
  on public.profiles for update
  using  (public.is_ti())
  with check (public.is_ti());


-- ── 6 · Restaurar profiles desde auth.users existentes ──────────────
-- Si los usuarios ya existen en Auth (no los borraste en el paso 1),
-- este query recrea sus perfiles sin necesidad de seed-users.js.

insert into public.profiles (id, email, name, role_id, shift)
select
  id,
  email,
  coalesce(raw_user_meta_data->>'name',    split_part(email, '@', 1)),
  coalesce(raw_user_meta_data->>'role_id', 'reception'),
  coalesce(raw_user_meta_data->>'shift',   '—')
from auth.users
on conflict (id) do update
  set name    = excluded.name,
      role_id = excluded.role_id,
      shift   = excluded.shift;


-- ═══════════════════════════════════════════════════════════════════
-- VERIFICACIÓN — corre para confirmar:
-- select role_id, name, email from public.profiles order by role_id;
-- ═══════════════════════════════════════════════════════════════════

-- Tabla de mensajes entre áreas — pega en SQL Editor y Run.
create table if not exists public.messages (
  id          uuid primary key default gen_random_uuid(),
  from_role   text not null,
  from_name   text not null,
  body        text not null,
  created_at  timestamptz default now()
);

alter table public.messages enable row level security;
drop policy if exists "auth read"  on public.messages;
drop policy if exists "auth write" on public.messages;
create policy "auth read"  on public.messages for select using (auth.role() = 'authenticated');
create policy "auth write" on public.messages for all    using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

alter publication supabase_realtime add table public.messages;

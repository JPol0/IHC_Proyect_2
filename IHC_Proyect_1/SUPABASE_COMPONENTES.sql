-- Migration: Componentes Actualizables
-- Run in Supabase SQL editor

-- Table to store reusable/updatable components (plantillas parciales)
create table if not exists public."ComponentesActualizables" (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text, -- optional slug
  site_id uuid references public."Sites"(id) on delete set null,
  owner_id uuid, -- puede mapear a auth.users
  json jsonb not null,
  preview_url text,
  tags text[],
  size integer default 0, -- approximate JSON size in bytes
  metadata jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Indexes
create index if not exists componentes_name_idx on public."ComponentesActualizables" (lower(name));
create index if not exists componentes_site_idx on public."ComponentesActualizables" (site_id);
create index if not exists componentes_tags_idx on public."ComponentesActualizables" using gin (tags);

-- Trigger to update updated_at
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists update_componentes_updated_at on public."ComponentesActualizables";
create trigger update_componentes_updated_at
  before update on public."ComponentesActualizables"
  for each row
  execute function update_updated_at_column();

-- Optional: Row Level Security (RLS) examples
-- enable RLS if you plan to use policies
-- alter table public."ComponentesActualizables" enable row level security;

-- create policy "Componentes: propietarios pueden modificar" on public."ComponentesActualizables"
--   for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

-- Size consideration: store large assets (images) in storage and reference via preview_url; avoid storing binary data in table.

-- Note: Adjust foreign key types to match your auth/users table if needed.

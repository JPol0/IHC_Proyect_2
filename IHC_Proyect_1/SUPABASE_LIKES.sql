-- Run this in Supabase SQL editor to create the likes table

-- Create likes table
create table if not exists public."likes" (
  id uuid primary key default gen_random_uuid(),
  section_id text not null unique,
  count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Add index for faster queries
create index if not exists likes_section_id_idx on public."likes" (section_id);

-- Add check constraint to ensure count is never negative
alter table public."likes" 
  add constraint likes_count_positive check (count >= 0);

-- Optional: Enable Row Level Security (RLS) if you need access control
-- alter table public."likes" enable row level security;

-- Optional: Create policies for public read/write access
-- create policy "Anyone can read likes" on public."likes" 
--   for select using (true);

-- create policy "Anyone can insert likes" on public."likes" 
--   for insert with check (true);

-- create policy "Anyone can update likes" on public."likes" 
--   for update using (true);

-- Optional: Create a function to auto-update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Create trigger to auto-update updated_at
drop trigger if exists update_likes_updated_at on public."likes";
create trigger update_likes_updated_at
  before update on public."likes"
  for each row
  execute function update_updated_at_column();

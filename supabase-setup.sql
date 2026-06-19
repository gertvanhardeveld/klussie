-- Maak de tabellen aan in Supabase

create table members (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  is_admin boolean default false,
  created_at timestamptz default now()
);

create table chores (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  duration_minutes int not null default 15,
  category text not null check (category in ('vast', 'extra')),
  created_at timestamptz default now()
);

create table chore_assignments (
  id uuid primary key default gen_random_uuid(),
  chore_id uuid references chores(id) on delete cascade,
  member_id uuid references members(id) on delete set null,
  assigned_by text,
  completed boolean default false,
  completed_at timestamptz,
  week text not null,
  created_at timestamptz default now()
);

-- RLS uitschakelen (simpele familieapp zonder auth)
alter table members enable row level security;
alter table chores enable row level security;
alter table chore_assignments enable row level security;

create policy "allow all" on members for all using (true) with check (true);
create policy "allow all" on chores for all using (true) with check (true);
create policy "allow all" on chore_assignments for all using (true) with check (true);

-- Startdata: gezinsleden
insert into members (name, is_admin) values
  ('Pien', true),
  ('Papa', false),
  ('Dochter 1', false),
  ('Dochter 2', false),
  ('Dochter 3', false);

-- Startdata: standaard klusjes
insert into chores (name, duration_minutes, category) values
  ('Stofzuigen', 20, 'vast'),
  ('Dweilen', 20, 'vast'),
  ('WC schoonmaken', 15, 'vast'),
  ('Douche schoonmaken', 20, 'vast'),
  ('Ijskast schoonmaken', 30, 'extra'),
  ('Kastjes schoonmaken', 25, 'extra');

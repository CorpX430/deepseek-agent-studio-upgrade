create extension if not exists pgcrypto;

create table if not exists public.sessions (
  id uuid primary key default gen_random_uuid(),
  owner_id text not null,
  mode text not null default 'chat' check (mode in ('chat', 'agent', 'character', 'web3')),
  character_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.characters (
  id uuid primary key default gen_random_uuid(),
  owner_id text not null,
  slug text not null,
  name text not null,
  personality text not null default '',
  speech_style text not null default '',
  backstory text not null default '',
  rules jsonb not null default '[]'::jsonb,
  source text not null default 'upload' check (source in ('upload', 'jsonbin', 'system')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(owner_id, slug)
);

alter table public.sessions
  add constraint sessions_character_id_fkey foreign key (character_id) references public.characters(id) on delete set null;

create table if not exists public.messages (
  id bigint generated always as identity primary key,
  session_id uuid not null references public.sessions(id) on delete cascade,
  owner_id text not null,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  reasoning text,
  created_at timestamptz not null default now()
);

create table if not exists public.sandboxes (
  id uuid primary key default gen_random_uuid(),
  owner_id text not null,
  session_id uuid not null references public.sessions(id) on delete cascade,
  provider text not null default 'e2b',
  external_id text,
  status text not null default 'active' check (status in ('active', 'stopped', 'expired')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(session_id, provider)
);

create index if not exists messages_session_created_idx on public.messages(session_id, created_at);
create index if not exists sessions_owner_updated_idx on public.sessions(owner_id, updated_at desc);
create index if not exists characters_owner_updated_idx on public.characters(owner_id, updated_at desc);

create or replace function public.touch_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

drop trigger if exists sessions_touch_updated_at on public.sessions;
create trigger sessions_touch_updated_at before update on public.sessions for each row execute function public.touch_updated_at();
drop trigger if exists characters_touch_updated_at on public.characters;
create trigger characters_touch_updated_at before update on public.characters for each row execute function public.touch_updated_at();
drop trigger if exists sandboxes_touch_updated_at on public.sandboxes;
create trigger sandboxes_touch_updated_at before update on public.sandboxes for each row execute function public.touch_updated_at();

alter table public.sessions enable row level security;
alter table public.messages enable row level security;
alter table public.characters enable row level security;
alter table public.sandboxes enable row level security;

-- The Next.js server uses the Supabase service role after authenticating the user with Clerk.
-- These policies keep direct client access closed by default while documenting the ownership boundary.
create policy "service role owns sessions" on public.sessions for all to service_role using (true) with check (true);
create policy "service role owns messages" on public.messages for all to service_role using (true) with check (true);
create policy "service role owns characters" on public.characters for all to service_role using (true) with check (true);
create policy "service role owns sandboxes" on public.sandboxes for all to service_role using (true) with check (true);

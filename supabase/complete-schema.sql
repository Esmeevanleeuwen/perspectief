create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  display_name text,
  bio text,
  region text,
  avatar_url text,
  public_profile boolean not null default false,
  contribution_visibility text not null default 'name'
    check (contribution_visibility in ('name','pseudonym','anonymous')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.account_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  remember_reading_history boolean not null default false,
  remember_topic_state boolean not null default false,
  local_recommendations boolean not null default false,
  email_updates boolean not null default false,
  updated_at timestamptz not null default now()
);

create table if not exists public.saved_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  item_type text not null,
  item_id text not null,
  title text not null,
  created_at timestamptz not null default now(),
  unique(user_id,item_type,item_id)
);

create table if not exists public.contributions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  contribution_type text not null default 'perspective',
  title text,
  body text not null,
  evidence_status text not null default 'unverified',
  created_at timestamptz not null default now()
);

create table if not exists public.user_roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'contributor'
    check (role in ('owner','admin','editor','researcher','fact_checker','moderator','contributor')),
  created_at timestamptz not null default now()
);

create table if not exists public.content_items (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  content_type text not null
    check (content_type in ('article','research','case','analysis','source','perspective','timeline','dataset')),
  title text not null,
  subtitle text,
  summary text,
  status text not null default 'idea'
    check (status in ('idea','researching','draft','source_check','editorial_review','ready','published','archived')),
  hero_image text,
  author_id uuid references auth.users(id) on delete set null,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.content_sections (
  id uuid primary key default gen_random_uuid(),
  content_id uuid not null references public.content_items(id) on delete cascade,
  section_type text not null default 'paragraph',
  position integer not null default 0,
  title text,
  body text,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.research_dossiers (
  content_id uuid primary key references public.content_items(id) on delete cascade,
  central_question text not null,
  method text,
  boundaries text,
  missing_information text[] not null default '{}',
  dimensions text[] not null default '{}'
);

create table if not exists public.research_children (
  research_content_id uuid not null references public.content_items(id) on delete cascade,
  child_content_id uuid not null references public.content_items(id) on delete cascade,
  relation text not null default 'part_of',
  primary key (research_content_id, child_content_id, relation)
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email,'@',1)))
  on conflict (id) do nothing;

  insert into public.account_preferences (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  insert into public.user_roles (user_id, role)
  values (new.id, 'contributor')
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.account_preferences enable row level security;
alter table public.saved_items enable row level security;
alter table public.contributions enable row level security;
alter table public.user_roles enable row level security;
alter table public.content_items enable row level security;
alter table public.content_sections enable row level security;
alter table public.research_dossiers enable row level security;
alter table public.research_children enable row level security;

create or replace function public.current_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((select role from public.user_roles where user_id = auth.uid()), 'contributor');
$$;

create or replace function public.can_edit_content()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_role() in ('owner','admin','editor','researcher','fact_checker');
$$;

create policy "profiles readable"
on public.profiles for select
using (public_profile = true or auth.uid() = id);

create policy "own profile update"
on public.profiles for update
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "own preferences"
on public.account_preferences for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "own saved"
on public.saved_items for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "own contributions"
on public.contributions for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "read own role"
on public.user_roles for select
using (auth.uid() = user_id or public.current_role() in ('owner','admin'));

create policy "manage roles"
on public.user_roles for all
using (public.current_role() in ('owner','admin'))
with check (public.current_role() in ('owner','admin'));

create policy "published content readable"
on public.content_items for select
using (status = 'published' or public.can_edit_content());

create policy "editor content insert"
on public.content_items for insert
to authenticated
with check (public.can_edit_content());

create policy "editor content update"
on public.content_items for update
using (public.can_edit_content())
with check (public.can_edit_content());

create policy "sections readable"
on public.content_sections for select
using (
  exists (
    select 1 from public.content_items c
    where c.id = content_sections.content_id
    and (c.status = 'published' or public.can_edit_content())
  )
);

create policy "sections edit"
on public.content_sections for all
using (public.can_edit_content())
with check (public.can_edit_content());

create policy "research readable"
on public.research_dossiers for select using (true);

create policy "research edit"
on public.research_dossiers for all
using (public.can_edit_content())
with check (public.can_edit_content());

create policy "research children readable"
on public.research_children for select using (true);

create policy "research children edit"
on public.research_children for all
using (public.can_edit_content())
with check (public.can_edit_content());

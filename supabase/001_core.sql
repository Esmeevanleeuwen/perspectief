create extension if not exists pgcrypto;

create table if not exists public.user_roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'contributor' check (role in ('owner','editor','contributor')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  username text unique,
  bio text,
  region text,
  avatar_url text,
  public_profile boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.saved_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  item_type text not null check (item_type in ('article','research','claim','node','source','route')),
  item_id text not null,
  title text not null,
  context jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique(user_id,item_type,item_id)
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(coalesce(new.email,'gebruiker'),'@',1)))
  on conflict (id) do nothing;

  insert into public.user_roles (user_id, role)
  values (new.id, 'contributor')
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
for each row execute procedure public.handle_new_user();

insert into public.profiles (id, display_name)
select id, coalesce(raw_user_meta_data->>'display_name', split_part(coalesce(email,'gebruiker'),'@',1))
from auth.users on conflict (id) do nothing;

insert into public.user_roles (user_id, role)
select id, 'contributor' from auth.users on conflict (user_id) do nothing;

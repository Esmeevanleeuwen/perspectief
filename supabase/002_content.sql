create table if not exists public.content_items (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  content_type text not null check (content_type in ('article','research','analysis','case','timeline','dataset')),
  title text not null,
  eyebrow text,
  subtitle text,
  summary text,
  hero_image text,
  image_alt text,
  status text not null default 'draft' check (status in ('idea','researching','draft','source_check','editorial_review','ready','published','archived')),
  featured boolean not null default false,
  featured_position text check (featured_position in ('main','side')),
  author_id uuid references auth.users(id) on delete set null,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.content_sections (
  id uuid primary key default gen_random_uuid(),
  content_id uuid not null references public.content_items(id) on delete cascade,
  section_type text not null default 'paragraph' check (section_type in ('paragraph','heading','intro','quote','stat','callout','graph','timeline','claim_cluster','source_list','perspective_cluster','void')),
  position integer not null default 0,
  title text,
  body text,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.research_dossiers (
  content_id uuid primary key references public.content_items(id) on delete cascade,
  central_question text not null,
  method text,
  boundaries text,
  dimensions text[] not null default '{}',
  missing_information text[] not null default '{}',
  working_theory text,
  updated_at timestamptz not null default now()
);

create table if not exists public.research_children (
  research_content_id uuid not null references public.content_items(id) on delete cascade,
  child_content_id uuid not null references public.content_items(id) on delete cascade,
  relation text not null default 'part_of' check (relation in ('part_of','case_of','deepens','contradicts','updates','background')),
  position integer not null default 0,
  primary key (research_content_id,child_content_id,relation)
);

create table if not exists public.sources (
  id uuid primary key default gen_random_uuid(),
  source_type text not null default 'url' check (source_type in ('url','pdf','report','dataset','interview','document','book','manual')),
  title text not null,
  publisher text,
  url text,
  published_at date,
  authors text[] not null default '{}',
  description text,
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

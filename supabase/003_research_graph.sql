create table if not exists public.knowledge_nodes (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  node_type text not null check (node_type in ('human_property','selection','function','value','reward','risk','failure','classification','institution','market','narrative','condition','outcome','group','mechanism','concept')),
  title text not null,
  description text,
  layer text not null default 'material' check (layer in ('material','institutional','symbolic','experiential','epistemic')),
  status text not null default 'active' check (status in ('active','draft','deprecated')),
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.knowledge_relations (
  id uuid primary key default gen_random_uuid(),
  from_node_id uuid not null references public.knowledge_nodes(id) on delete cascade,
  to_node_id uuid not null references public.knowledge_nodes(id) on delete cascade,
  relation_type text not null check (relation_type in ('selects','enables','produces','rewards','exposes_to','increases','reduces','reclassifies','frames','depends_on','contradicts','correlates_with','feeds_back_into','transitions_to','measures')),
  statement text,
  certainty text not null default 'hypothesis' check (certainty in ('established','supported','mixed','hypothesis','unknown')),
  scope text,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  unique(from_node_id,to_node_id,relation_type)
);

create table if not exists public.claims (
  id uuid primary key default gen_random_uuid(),
  slug text unique,
  title text not null,
  statement text not null,
  claim_type text not null default 'factual' check (claim_type in ('factual','causal','interpretive','experiential','hypothesis','normative')),
  evidence_status text not null default 'unverified' check (evidence_status in ('unverified','reviewing','supported','mixed','disputed','rejected','unknown')),
  confidence numeric not null default 0 check (confidence between 0 and 1),
  scope text,
  notes text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.claim_sources (
  claim_id uuid not null references public.claims(id) on delete cascade,
  source_id uuid not null references public.sources(id) on delete cascade,
  relation text not null check (relation in ('supports','contradicts','context','origin','method')),
  note text,
  primary key (claim_id,source_id,relation)
);

create table if not exists public.claim_relations (
  from_claim_id uuid not null references public.claims(id) on delete cascade,
  to_claim_id uuid not null references public.claims(id) on delete cascade,
  relation text not null check (relation in ('supports','contradicts','qualifies','depends_on','alternative_explanation','same_mechanism')),
  note text,
  primary key (from_claim_id,to_claim_id,relation)
);

create table if not exists public.content_claims (
  content_id uuid not null references public.content_items(id) on delete cascade,
  claim_id uuid not null references public.claims(id) on delete cascade,
  role text not null default 'supporting' check (role in ('central','supporting','counter','uncertainty','background')),
  position integer not null default 0,
  primary key (content_id,claim_id,role)
);

create table if not exists public.content_nodes (
  content_id uuid not null references public.content_items(id) on delete cascade,
  node_id uuid not null references public.knowledge_nodes(id) on delete cascade,
  role text not null default 'context' check (role in ('central','cause','mechanism','outcome','context','counterpoint')),
  position integer not null default 0,
  primary key (content_id,node_id,role)
);

create table if not exists public.perspectives (
  id uuid primary key default gen_random_uuid(),
  content_id uuid references public.content_items(id) on delete cascade,
  node_id uuid references public.knowledge_nodes(id) on delete cascade,
  perspective_type text not null check (perspective_type in ('lived_experience','institutional','scientific','legal','economic','political','ethical','historical')),
  title text not null,
  body text not null,
  source_id uuid references public.sources(id) on delete set null,
  visibility text not null default 'public' check (visibility in ('public','editorial','private')),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.contributions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  content_id uuid references public.content_items(id) on delete cascade,
  contribution_type text not null check (contribution_type in ('perspective','source','question','counterevidence','connection','local_observation')),
  title text,
  body text not null,
  source_url text,
  evidence_status text not null default 'unverified',
  status text not null default 'submitted' check (status in ('submitted','reviewing','accepted','rejected','archived')),
  created_at timestamptz not null default now()
);

create table if not exists public.audit_log (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

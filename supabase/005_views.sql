create or replace view public.published_articles with (security_invoker=true) as
select * from public.content_items where status='published' and content_type in ('article','analysis','case');

create or replace view public.published_research with (security_invoker=true) as
select * from public.content_items where status='published' and content_type='research';

create or replace view public.research_graph_edges with (security_invoker=true) as
select r.id, fn.slug as from_slug, fn.title as from_title, fn.node_type as from_type,
       r.relation_type, tn.slug as to_slug, tn.title as to_title, tn.node_type as to_type,
       r.statement, r.certainty, r.scope
from public.knowledge_relations r
join public.knowledge_nodes fn on fn.id=r.from_node_id
join public.knowledge_nodes tn on tn.id=r.to_node_id;

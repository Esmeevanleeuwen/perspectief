-- Make the content shown on the Meridian homepage manageable from the same CMS.
alter table public.content_items
  add column if not exists metadata jsonb not null default '{}'::jsonb;

update public.content_items
set featured = false,
    featured_position = null
where content_type in ('article','analysis','case','research');

insert into public.content_items (
  slug, content_type, title, eyebrow, summary, hero_image, image_alt,
  status, featured, featured_position, published_at, metadata
) values
('prestatiedruk','article','Waarom ervaren steeds meer jongeren prestatiedruk?','ONDERZOEK','Een onderzoek naar de ervaringen van jongeren, de terugkerende patronen en de mogelijke oorzaken.','/artikelsad.jpg','Jongere in een stille omgeving als beeld bij een onderzoek naar prestatiedruk.','published',true,'main','2026-07-18T10:00:00+02:00','{"experiences":438,"experts":12,"provinces":11,"display_date":"18 juli 2026"}'::jsonb),
('leraren-onderwijs','article','Waarom verlaten steeds meer leraren het onderwijs?','ONDERZOEK','Een onderzoek naar ervaringen binnen het onderwijs en de structuren die daarachter liggen.','/class.jpg','Klaslokaal als beeld bij een onderzoek naar het vertrek van leraren uit het onderwijs.','published',true,'side','2026-07-14T10:00:00+02:00','{"experiences":241,"experts":8,"provinces":9,"display_date":"14 juli 2026"}'::jsonb),
('woningonzekerheid','article','Waarom groeit het gevoel van woningonzekerheid?','ONDERZOEK','Een onderzoek naar wonen, onzekerheid en de ervaringen die daarachter liggen.','/huis.png','Woningen als beeld bij een onderzoek naar woningonzekerheid.','published',true,'side','2026-07-08T10:00:00+02:00','{"experiences":517,"experts":16,"provinces":12,"display_date":"8 juli 2026"}'::jsonb),
('ceuta-mei-2021','case','Ceuta, mei 2021: wat gebeurt er wanneer een grens beleid wordt?','CASUS','Een menselijke casus binnen het onderzoek naar tegenspraak, informatie en besluitvorming.','/onderzoek-tegenspraak.jpg','Mensen bewegen in het donker langs een steile helling tijdens de gebeurtenissen rond Ceuta.','published',false,null,'2021-05-20T10:00:00+02:00','{"experiences":0,"experts":0,"display_date":"mei 2021"}'::jsonb),
('tegenspraak','research','Wat gebeurt er met tegenspraak?','ONDERZOEK','Van waarschuwing en advies tot kabinetsbesluit: we reconstrueren welke informatie binnenkomt, welke informatie verandert en welke informatie onderweg uit beeld raakt.','/onderzoek-tegenspraak.jpg','Mensen bewegen in het donker langs een steile helling tijdens de gebeurtenissen rond Ceuta.','published',true,'main','2026-07-18T09:00:00+02:00','{"display_date":"Doorlopend onderzoek"}'::jsonb)
on conflict (slug) do update set
  content_type = excluded.content_type,
  title = excluded.title,
  eyebrow = excluded.eyebrow,
  summary = excluded.summary,
  hero_image = excluded.hero_image,
  image_alt = excluded.image_alt,
  status = excluded.status,
  featured = excluded.featured,
  featured_position = excluded.featured_position,
  published_at = coalesce(public.content_items.published_at, excluded.published_at),
  metadata = coalesce(public.content_items.metadata, '{}'::jsonb) || excluded.metadata,
  updated_at = now();

insert into public.research_dossiers (content_id, central_question, method, boundaries, dimensions, missing_information)
select id,
  'Hoe wordt maatschappelijke tegenspraak verwerkt voordat beleid een besluit wordt?',
  'We volgen niet één mening, maar de route van informatie: van ervaring en waarschuwing naar document, afweging, besluit en gevolg.',
  'Een ontbrekende verbinding wordt niet automatisch geïnterpreteerd als opzet, manipulatie of negeren. Wat niet aantoonbaar is, blijft zichtbaar als open vraag.',
  array['Adviezen','Documenten','Perspectieven','Besluiten']::text[], array[]::text[]
from public.content_items where slug = 'tegenspraak'
on conflict (content_id) do update set
  central_question = excluded.central_question,
  method = excluded.method,
  boundaries = excluded.boundaries,
  dimensions = excluded.dimensions,
  updated_at = now();

delete from public.content_sections
where content_id in (
  select id from public.content_items
  where slug in ('prestatiedruk','leraren-onderwijs','woningonzekerheid','ceuta-mei-2021','tegenspraak')
);

insert into public.content_sections (content_id, section_type, position, title, body, data)
select id,'paragraph',10,null,'Steeds meer jongeren geven aan druk te ervaren om te presteren. In dit onderzoek kijken we niet alleen naar losse ervaringen, maar vooral naar de patronen die daarin terugkomen.','{}'::jsonb from public.content_items where slug='prestatiedruk'
union all select id,'heading',20,'Waar komt die druk vandaan?',null,'{}'::jsonb from public.content_items where slug='prestatiedruk'
union all select id,'paragraph',30,null,'Dit dossier wordt verder opgebouwd vanuit ervaringen, bronnen en deskundige duiding. Nieuwe informatie kan via de redactie aan deze publicatie worden toegevoegd zonder de route of URL te veranderen.','{}'::jsonb from public.content_items where slug='prestatiedruk'
union all select id,'paragraph',10,null,'Waarom verlaten leraren het onderwijs? Dit onderzoek ordent ervaringen, terugkerende knelpunten en de structuren die bepalen hoeveel ruimte leraren in hun werk ervaren.','{}'::jsonb from public.content_items where slug='leraren-onderwijs'
union all select id,'paragraph',20,null,'Het onderzoek blijft uitbreidbaar: nieuwe bronnen en redactionele secties kunnen vanuit Meridian Admin aan dezelfde publicatie worden toegevoegd.','{}'::jsonb from public.content_items where slug='leraren-onderwijs'
union all select id,'paragraph',10,null,'Woningonzekerheid gaat niet alleen over het aantal beschikbare woningen, maar ook over de voorspelbaarheid van wonen, toegang, doorstroming en de ruimte die mensen hebben om hun leven op langere termijn te organiseren.','{}'::jsonb from public.content_items where slug='woningonzekerheid'
union all select id,'paragraph',20,null,'Binnen dit onderzoek worden ervaringen en structurele informatie naast elkaar geplaatst. Ontbrekende informatie blijft zichtbaar en kan later vanuit de redactie worden aangevuld.','{}'::jsonb from public.content_items where slug='woningonzekerheid'
union all select id,'paragraph',10,null,'In mei 2021 bereikten in korte tijd duizenden mensen de Spaanse enclave Ceuta. De beelden tonen niet één verklaring, maar verschillende posities binnen dezelfde gebeurtenis: mensen onderweg, grensbewaking, hulpverlening, opvang en terugkeer.','{}'::jsonb from public.content_items where slug='ceuta-mei-2021'
union all select id,'heading',20,'Van persoon naar categorie',null,'{}'::jsonb from public.content_items where slug='ceuta-mei-2021'
union all select id,'paragraph',30,null,'Tot aan de grens is iemand onderweg. Vanaf de grens wordt diezelfde persoon ook onderdeel van juridische en bestuurlijke categorieën. Leeftijd, nationaliteit, registratie, opvang en mogelijke terugkeer veranderen welke routes vervolgens beschikbaar zijn.','{}'::jsonb from public.content_items where slug='ceuta-mei-2021'
union all select id,'heading',40,'Wat een foto wel en niet vertelt',null,'{}'::jsonb from public.content_items where slug='ceuta-mei-2021'
union all select id,'paragraph',50,null,'De foto maakt een menselijke werkelijkheid zichtbaar, maar vertelt op zichzelf niet waarom iedere persoon vertrok, welke juridische status iemand had of welke beslissing in een individueel geval gerechtvaardigd was. Die vragen moeten met aanvullende bronnen worden onderzocht.','{}'::jsonb from public.content_items where slug='ceuta-mei-2021'
union all select id,'heading',60,'Waarom deze casus bij het onderzoek hoort',null,'{}'::jsonb from public.content_items where slug='ceuta-mei-2021'
union all select id,'paragraph',70,null,'De casus maakt zichtbaar hoe afstand kan ontstaan tussen de taal van beleid en de ervaring van mensen. Meridian gebruikt die spanning niet als conclusie, maar als onderzoeksvraag: welke informatie bereikt besluitvormers, welke informatie is publiek beschikbaar en hoe zijn menselijke gevolgen in de uiteindelijke afweging terug te vinden?','{}'::jsonb from public.content_items where slug='ceuta-mei-2021';

insert into public.content_sections (content_id, section_type, position, title, body, data)
select id,'callout',10,'Tegenspraak is meer dan voor of tegen.','Een waarschuwing kan gehoord worden zonder te worden gevolgd. Een advies kan worden verwerkt zonder dat het voorstel verandert. En informatie kan openbaar zijn zonder werkelijk zichtbaar te worden.\n\nDit onderzoek probeert daarom niet vooraf te bewijzen dat een kabinet wel of niet luistert. We reconstrueren eerst wat er beschikbaar was, wie welke informatie aandroeg, hoe daarop werd gereageerd en welke argumenten uiteindelijk in het besluit terugkomen.','{"eyebrow":"De vraag"}'::jsonb from public.content_items where slug='tegenspraak'
union all select id,'timeline',20,'Van signaal naar gevolg.','Voor ieder deelonderzoek volgen we dezelfde beweging. Een ervaring, gebeurtenis of waarschuwing wordt eerst een signaal. Dat signaal kan worden vastgelegd in een advies, rapport, Kamervraag, consultatiereactie of ander document. Daarna onderzoeken we waar het in de besluitvorming terechtkomt.\n\nPas daarna kijken we naar het besluit en de gevolgen ervan.','{"eyebrow":"De informatieroute","points":["Signaal — wat wordt gezien of ervaren?","Vastlegging — waar wordt het gedocumenteerd?","Afweging — wie reageert erop en met welke argumenten?","Besluit — wat verandert er daadwerkelijk?","Gevolg — wat betekent dat voor mensen en instituties?"]}'::jsonb from public.content_items where slug='tegenspraak'
union all select id,'perspective_cluster',30,'Een systeem wordt zichtbaar in individuele gevolgen.','Achter categorieën als grens, migratie, opvang en terugkeer bevinden zich mensen die ieder een ander deel van hetzelfde systeem meemaken. Concrete casussen verbinden de beleidsvraag met documenten, regels en gevolgen.','{"eyebrow":"Menselijke laag"}'::jsonb from public.content_items where slug='tegenspraak'
union all select id,'callout',40,'Beschikbaar is niet hetzelfde als zichtbaar.','Bij ieder dossier kijken we niet alleen of informatie formeel openbaar is. We onderzoeken ook of zij vindbaar, tijdig beschikbaar, begrijpelijk en herleidbaar is naar de uiteindelijke afweging.','{"eyebrow":"Transparantie","points":["Bestaat de informatie?","Is zij bewaard?","Is zij openbaar?","Is zij vindbaar?","Is zij begrijpelijk?","Is zij terug te vinden in de uiteindelijke afweging?"]}'::jsonb from public.content_items where slug='tegenspraak'
union all select id,'callout',50,'Wat we niet weten blijft zichtbaar.','Een ontbrekende verbinding wordt niet automatisch geïnterpreteerd als opzet, manipulatie of negeren. Een vraagteken is geen lege plek die met een vermoeden moet worden gevuld, maar een concrete aanwijzing voor wat nog moet worden onderzocht.','{"eyebrow":"Onderzoeksgrens"}'::jsonb from public.content_items where slug='tegenspraak';

insert into public.research_children (research_content_id, child_content_id, relation, position)
select r.id, c.id, 'case_of', 10
from public.content_items r
join public.content_items c on c.slug='ceuta-mei-2021'
where r.slug='tegenspraak'
on conflict (research_content_id, child_content_id, relation)
do update set position = excluded.position;

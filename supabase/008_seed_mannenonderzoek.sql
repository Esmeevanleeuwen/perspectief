-- Seed: Mens als functie. Analytische relaties blijven hypotheses waar externe verificatie nodig is.
do $$
declare research_id uuid; a1 uuid; a2 uuid; a3 uuid; source_id uuid;
        n_property uuid; n_selection uuid; n_function uuid; n_value uuid; n_risk uuid; n_failure uuid; n_reclass uuid; n_narrative uuid; n_help uuid;
        c1 uuid; c2 uuid; c3 uuid;
begin
  insert into public.sources(source_type,title,publisher,description,notes)
  values('report','Mens als functie','Meridian research dossier','Overkoepelende analyse van jonge mannen, marktselectie, arbeid, fysieke risicodracht, algoritmische targeting, hulpvraag, oorlogsmobilisatie, gelijkheid en greenwashing.','Interne basisbron; empirische claims vóór publicatie waar mogelijk koppelen aan primaire externe bronnen.')
  returning id into source_id;

  insert into public.content_items(slug,content_type,title,eyebrow,summary,status,featured)
  values('mens-als-functie','research','Mens als functie','ONDERZOEK','Een onderzoek naar wat er gebeurt wanneer instituties niet de volledige mens verwerken, maar afzonderlijke eigenschappen selecteren als arbeid, aandacht, inzetbaarheid, kredietwaardigheid, risico of hulpbehoefte.','published',true)
  on conflict(slug) do update set title=excluded.title,summary=excluded.summary,status=excluded.status
  returning id into research_id;

  insert into public.research_dossiers(content_id,central_question,method,boundaries,dimensions,missing_information,working_theory)
  values(research_id,
    'Hoe veranderen de positie en zichtbaarheid van jonge mannen wanneer verschillende systemen vooral die eigenschappen selecteren die voor hun eigen functie bruikbaar zijn?',
    'We scheiden eigenschappen, instituties, selectiemechanismen, materiële uitkomsten, symbolische verhalen en individuele voorkeuren. Een relatie wordt niet als algemene waarheid behandeld wanneer slechts één laag is aangetoond.',
    'Het onderzoek neemt man-vrouw niet als universele tegenstelling en behandelt groepsgemiddelden niet als individuele identiteit. Onvolledige datasets blijven expliciet zichtbaar.',
    array['Arbeid en fysieke risicodracht','Defensie en inzetbaarheid','Hulpvraag en institutionele zichtbaarheid','Markt en algoritmische targeting','Narratief en selectieve waarheidsvorming','Uitval en herclassificatie'],
    array['Welke mechanismen zijn causaal en welke slechts correlatief?','Welke verschillen verdwijnen na controle voor beroep, inkomen, opleiding en leeftijd?','Welke ervaringen bereiken instituties niet omdat zij nooit als hulpvraag of melding worden geregistreerd?','Welke commerciële segmentatie is aantoonbaar specifiek gericht op jonge mannen?','Waar wijkt symbolische communicatie aantoonbaar af van materiële uitkomsten?'],
    'Een mens bezit eigenschappen; een systeem bezit functionele behoeften. Wanneer een eigenschap een behoefte vervult, kan selectieve waarde ontstaan. Beloning, risico, identiteit en herclassificatie kunnen rond die koppeling worden georganiseerd zonder dat dit iets zegt over de totale menselijke waarde.')
  on conflict(content_id) do update set central_question=excluded.central_question,method=excluded.method,boundaries=excluded.boundaries,dimensions=excluded.dimensions,missing_information=excluded.missing_information,working_theory=excluded.working_theory;

  insert into public.knowledge_nodes(slug,node_type,title,description,layer) values
  ('menselijke-eigenschap','human_property','Menselijke eigenschap','Een capaciteit of eigenschap die voor een systeem functioneel relevant kan worden.','material') on conflict(slug) do update set title=excluded.title returning id into n_property;
  insert into public.knowledge_nodes(slug,node_type,title,description,layer) values
  ('institutionele-selectie','selection','Institutionele selectie','Een systeem kiest welke eigenschappen relevant zijn voor toegang, beloning, inzet of classificatie.','institutional') on conflict(slug) do update set title=excluded.title returning id into n_selection;
  insert into public.knowledge_nodes(slug,node_type,title,description,layer) values
  ('functie','function','Functie','De rol waarin een geselecteerde eigenschap bruikbaar wordt.','institutional') on conflict(slug) do update set title=excluded.title returning id into n_function;
  insert into public.knowledge_nodes(slug,node_type,title,description,layer) values
  ('systeemwaarde','value','Waarde voor het systeem','Waarde binnen één subsysteem, zoals productiviteit, aandacht of inzetbaarheid.','institutional') on conflict(slug) do update set title=excluded.title returning id into n_value;
  insert into public.knowledge_nodes(slug,node_type,title,description,layer) values
  ('risicodracht','risk','Risicodracht','Kosten of risico die met een geselecteerde functie kunnen samengaan.','material') on conflict(slug) do update set title=excluded.title returning id into n_risk;
  insert into public.knowledge_nodes(slug,node_type,title,description,layer) values
  ('uitval','failure','Uitval','Moment waarop de eerdere functie niet langer volledig kan worden vervuld.','experiential') on conflict(slug) do update set title=excluded.title returning id into n_failure;
  insert into public.knowledge_nodes(slug,node_type,title,description,layer) values
  ('herclassificatie','classification','Herclassificatie','Dezelfde persoon verschijnt na uitval in een ander institutioneel systeem.','institutional') on conflict(slug) do update set title=excluded.title returning id into n_reclass;
  insert into public.knowledge_nodes(slug,node_type,title,description,layer) values
  ('symbolisch-narratief','narrative','Symbolisch narratief','Taal die een materiële rol betekenis geeft: verantwoordelijkheid, succes, plicht, autonomie of duurzaamheid.','symbolic') on conflict(slug) do update set title=excluded.title returning id into n_narrative;
  insert into public.knowledge_nodes(slug,node_type,title,description,layer) values
  ('hulpvraag-zichtbaarheid','mechanism','Hulpvraag als zichtbaarheidspoort','Een probleem wordt voor hulpverlening bestuurlijk zichtbaar wanneer het als hulpvraag, diagnose, melding of crisis verschijnt.','epistemic') on conflict(slug) do update set title=excluded.title returning id into n_help;

  insert into public.knowledge_relations(from_node_id,to_node_id,relation_type,statement,certainty,scope) values
    (n_property,n_selection,'feeds_back_into','Eigenschappen worden institutioneel relevant wanneer een selectieomgeving ze meet of nodig heeft.','supported','algemeen model'),
    (n_selection,n_function,'produces','Selectie organiseert welke eigenschap in welke functie wordt ingezet.','hypothesis','algemeen model'),
    (n_function,n_value,'produces','Een vervulde functie kan waarde voor het betreffende systeem produceren.','supported','algemeen model'),
    (n_function,n_risk,'exposes_to','Functies kunnen naast beloning ook specifieke kosten of risico dragen.','supported','arbeid/defensie/markt'),
    (n_risk,n_failure,'increases','Risicoblootstelling kan uitval vergroten; omvang en causaliteit zijn contextspecifiek.','hypothesis','contextspecifiek'),
    (n_failure,n_reclass,'transitions_to','Na uitval kan dezelfde persoon door zorg, uitkering of re-integratie opnieuw worden geclassificeerd.','supported','institutioneel'),
    (n_function,n_narrative,'frames','Functies kunnen door symbolische taal betekenis krijgen.','hypothesis','communicatie'),
    (n_failure,n_help,'depends_on','Uitval is niet automatisch zichtbaar voor hulpverlening; registratie of hulpvraag kan een toegangspoort zijn.','hypothesis','zorg')
  on conflict(from_node_id,to_node_id,relation_type) do nothing;

  insert into public.claims(slug,title,statement,claim_type,evidence_status,confidence,scope)
  values('geen-totale-groepspositie','Geen enkele variabele is de totale maatschappelijke positie','Geslacht, herkomst, inkomen, beroep, gezondheid en zorggebruik beschrijven verschillende relaties en mogen niet zonder extra bewijs worden samengevoegd tot één totale hoeveelheid voordeel of nadeel.','interpretive','supported',0.8,'methodologisch')
  on conflict(slug) do update set statement=excluded.statement returning id into c1;
  insert into public.claims(slug,title,statement,claim_type,evidence_status,confidence,scope)
  values('functionele-waarde-is-geen-menselijke-waarde','Functionele waarde is geen menselijke waarde','Dat een systeem productiviteit, inzetbaarheid, aandacht of kredietwaardigheid meet, bewijst niet dat deze variabelen de intrinsieke waarde van een persoon meten.','interpretive','supported',0.9,'conceptueel')
  on conflict(slug) do update set statement=excluded.statement returning id into c2;
  insert into public.claims(slug,title,statement,claim_type,evidence_status,confidence,scope)
  values('zichtbaarheid-volgt-registratie','Institutionele zichtbaarheid volgt vaak registratie','Een probleem kan bestaan voordat het als hulpvraag, melding, diagnose, ongeval of administratieve categorie zichtbaar wordt; de grootte van dit gat moet per systeem empirisch worden onderzocht.','hypothesis','reviewing',0.55,'zorg en registratie')
  on conflict(slug) do update set statement=excluded.statement returning id into c3;

  insert into public.claim_sources(claim_id,source_id,relation,note) values
    (c1,source_id,'origin','Methodologisch uitgangspunt.'),(c2,source_id,'origin','Conceptueel onderscheid.'),(c3,source_id,'origin','Werkhypothese; externe verificatie per domein nodig.') on conflict do nothing;
  insert into public.content_claims(content_id,claim_id,role,position) values
    (research_id,c1,'central',0),(research_id,c2,'central',1),(research_id,c3,'uncertainty',2) on conflict do nothing;
  insert into public.content_nodes(content_id,node_id,role,position) values
    (research_id,n_property,'central',0),(research_id,n_selection,'mechanism',1),(research_id,n_function,'mechanism',2),(research_id,n_value,'outcome',3),(research_id,n_risk,'outcome',4),(research_id,n_failure,'outcome',5),(research_id,n_reclass,'outcome',6),(research_id,n_narrative,'context',7),(research_id,n_help,'mechanism',8) on conflict do nothing;

  insert into public.content_items(slug,content_type,title,eyebrow,summary,status) values
  ('wanneer-kracht-een-contract-wordt','article','Wanneer kracht een contract wordt','ARBEID · RISICO','Over het verschil tussen fysieke capaciteit als menselijke eigenschap en fysieke capaciteit als economisch geselecteerde functie.','published')
  on conflict(slug) do update set title=excluded.title,summary=excluded.summary,status=excluded.status returning id into a1;
  delete from public.content_sections where content_id=a1;
  insert into public.content_sections(content_id,section_type,position,title,body) values
    (a1,'intro',0,null,'Een lichaam is geen beroep. Toch kan een arbeidsmarkt lichamelijke eigenschappen selecteren alsof zij productiemiddelen zijn: kracht, uithoudingsvermogen, beschikbaarheid en tolerantie voor gevaar krijgen in sommige functies een directe economische betekenis. De mens blijft dezelfde persoon, maar de instelling ziet vooral dat gedeelte dat voor de taak bruikbaar is.'),
    (a1,'heading',1,'Van eigenschap naar functie',null),
    (a1,'paragraph',2,null,'De analytische fout begint wanneer selectie als natuur wordt beschreven. Dat mannen gemiddeld vaker in bepaalde fysieke of risicovolle functies terechtkomen, zegt op zichzelf nog niet waarom. Voorkeur, loonstructuur, opleiding, cultuur, werkgeversselectie, alternatieven en lichamelijke verschillen kunnen tegelijk werken.'),
    (a1,'paragraph',3,null,'Een menselijke eigenschap krijgt pas economische waarde wanneer een organisatie haar kan gebruiken. Daar kunnen inkomen en status tegenover staan, maar ook vermoeidheid, letsel, onregelmatigheid en fysieke blootstelling.'),
    (a1,'heading',4,'De asymmetrie van succes en uitval',null),
    (a1,'paragraph',5,null,'Zolang de functie werkt, verschijnt iemand vooral als werknemer en productiecapaciteit. Wanneer het lichaam niet meer kan leveren, verschuift de infrastructuur naar bedrijfsarts, verzekering, zorg, re-integratie of uitkering. De overgang verandert niet de mens, maar wel de categorie waarin instituties hem zien.'),
    (a1,'callout',6,'Onderzoeksvraag','Hoeveel van het verschil in mannelijke risicodracht blijft bestaan wanneer beroep, uren, sector, leeftijd, contractvorm en zelfselectie afzonderlijk worden meegenomen?');

  insert into public.content_items(slug,content_type,title,eyebrow,summary,status) values
  ('de-man-die-pas-bestaat-wanneer-hij-breekt','article','De man die pas bestaat wanneer hij breekt','ZORG · ZICHTBAARHEID','Over het verschil tussen problemen die bestaan en problemen die door een hulpsysteem daadwerkelijk worden geregistreerd.','published')
  on conflict(slug) do update set title=excluded.title,summary=excluded.summary,status=excluded.status returning id into a2;
  delete from public.content_sections where content_id=a2;
  insert into public.content_sections(content_id,section_type,position,title,body) values
    (a2,'intro',0,null,'Een systeem kan niet reageren op alles wat het niet ziet. Zorg, hulpverlening en beleid werken noodzakelijk met signalen: een hulpvraag, afspraak, diagnose, melding, crisis, medicatie, verzuim of contact met een professional. Afwezigheid in een registratie is daarom niet automatisch afwezigheid van nood.'),
    (a2,'heading',1,'De poort tussen ervaring en statistiek',null),
    (a2,'paragraph',2,null,'Tussen een innerlijke toestand en een officiële categorie zitten meerdere stappen. Iemand moet een probleem herkennen, het benoemen, besluiten dat hulp zinvol is, toegang kunnen vinden, verschijnen, begrepen worden en uiteindelijk in een categorie terechtkomen die een database kan tellen.'),
    (a2,'paragraph',3,null,'Voor onderzoek naar mannen is dit belangrijk omdat zorggebruik niet zonder meer als maat voor gezondheid kan worden gelezen. Een lager gebruik kan minder problemen betekenen, maar ook een andere route naar hulp, latere presentatie of verschillen in registratie. Welke verklaring geldt, moet per dataset worden bewezen.'),
    (a2,'heading',4,'Functioneren kan informatie verbergen',null),
    (a2,'paragraph',5,null,'Een werknemer kan jarenlang beoordeeld worden op output terwijl zijn psychische toestand slechts indirect relevant is. Pas wanneer prestaties, aanwezigheid of gedrag veranderen, verschijnt een nieuw informatiesysteem.'),
    (a2,'callout',6,'Wat Meridian niet mag doen','Van een mannelijk gemiddelde direct afleiden wat een individuele man voelt, nodig heeft of zal doen. De ontbrekende informatie blijft onderdeel van het model.');

  insert into public.content_items(slug,content_type,title,eyebrow,summary,status) values
  ('wie-profiteert-van-de-man-die-hij-denkt-te-moeten-zijn','analysis','Wie profiteert van de man die hij denkt te moeten zijn?','MARKT · NARRATIEF','Een analyse van de lus tussen identiteit, commerciële selectie, status, aandacht en symbolische verhalen over mannelijkheid.','published')
  on conflict(slug) do update set title=excluded.title,summary=excluded.summary,status=excluded.status returning id into a3;
  delete from public.content_sections where content_id=a3;
  insert into public.content_sections(content_id,section_type,position,title,body) values
    (a3,'intro',0,null,'Een markt hoeft niet te weten wie iemand werkelijk is. Voor commerciële selectie is het voldoende wanneer gedrag voorspelbaar genoeg wordt om aandacht, koopkans of betrokkenheid te modelleren. Daar ontstaat een scheiding tussen identiteit als geleefde werkelijkheid en identiteit als bruikbaar segment.'),
    (a3,'heading',1,'Gedrag wordt categorie',null),
    (a3,'paragraph',2,null,'Klikken, kijken, zoeken, kopen en delen vormen signalen. Zodra zulke signalen worden samengevoegd, kunnen gebruikers als waarschijnlijk geïnteresseerd in bepaalde thema’s of producten worden benaderd. Dat bewijst niet dat een systeem de overtuigingen van een persoon begrijpt; alleen dat voorspelling commercieel bruikbaar kan zijn.'),
    (a3,'paragraph',3,null,'Wanneer status, zelfstandigheid, kracht, competitie of succes cultureel met mannelijkheid worden verbonden, kunnen die betekenissen materiaal voor marketing worden. Commerciële systemen kunnen bestaande symbolen selecteren, versterken en opnieuw verkopen.'),
    (a3,'heading',4,'Greenwashing als algemeen patroon',null),
    (a3,'paragraph',5,null,'Een organisatie kan duurzaamheid, gelijkheid, autonomie of verantwoordelijkheid communiceren terwijl de materiële keten afzonderlijk moet worden onderzocht. Symbolische taal is niet automatisch onwaar, maar mag ook niet als bewijs voor de materiële uitkomst worden gebruikt.'),
    (a3,'callout',6,'Open vraag','Wanneer versterkt commerciële personalisatie bestaande voorkeuren, en wanneer verandert zij daadwerkelijk de omgeving waarin voorkeuren zich ontwikkelen? Dat onderscheid vraagt platform- en contextspecifiek bewijs.');

  insert into public.research_children(research_content_id,child_content_id,relation,position) values
    (research_id,a1,'deepens',0),(research_id,a2,'deepens',1),(research_id,a3,'deepens',2) on conflict do nothing;
end $$;

# Meridian / Amparis — geactiveerde publicatiekoppeling

Bijgewerkt: 19 september 2026. Dit vervangt de eerdere waarschuwing dat de activatiemigratie nog niet was uitgevoerd.

## Database: uitgevoerd en gecontroleerd

De officiële Supabase-migratietool heeft deze migraties met succes toegepast:

- `20260919092007` / `activate_shared_publishing`: de eerder openstaande SQL uit `202609180002_activate_shared_publishing.sql`;
- `20260919092957` / `released_research_links`: openbare onderzoekspagina's krijgen artikellinks uit vrijgegeven edities;
- `20260919093015` / `released_public_search`: openbare zoekresultaten gebruiken vrijgegeven artikelversies.

De eerste migratie sluit de rechtstreekse openbare toegang tot bewerkbare artikelen af, maakt interne tags doorzoekbaar in de Werkplek en past de bestaande dossiersynchronisatie aan. Publiceren en offline halen werken de gekoppelde dossiers bij met vrijgegeven titels en adressen, niet met de werktekst.

Een read-only controle als `anon` leverde nul ruwe artikelen en nul ruwe artikelsecties op. De openbare catalogus bleef acht Meridian-edities en nul Amparis-edities leveren. Configuraties en de volledige revisietabel zijn niet anoniem leesbaar; anonieme bezoekers kunnen niet publiceren. Ook een authenticated rol zonder redactionele identiteit kreeg geen ruwe artikelen of interne configuraties te zien. Er zijn geen rollen verruimd.

De controlesommen van alle `content_items` en `content_sections` waren voor en na de migraties gelijk. Er zijn geen artikelteksten gewijzigd, geen hoofdstukken aangemaakt en geen artikelen automatisch op Amparis gepubliceerd.

## Extra oude koppelingen hersteld

De bestaande route `/onderzoek/[slug]` gebruikte nog een sessieclient en een join naar ruwe `content_items`. Na de privacyscheiding vielen artikelkoppelingen voor openbare bezoekers daardoor weg. De route gebruikt nu de gerichte reader `publishing_research_links`, zonder bezoekerssessie. Deze geeft alleen gepubliceerde Meridian-artikeledities bij een gepubliceerd onderzoek terug. Ook gepubliceerde onderliggende onderzoeken blijven ondersteund. De live databasecontrole gaf drie artikellinks voor `mens-als-functie` en één voor `tegenspraak`.

De bestaande openbare functie `search_meridian` draaide met `SECURITY DEFINER` en las artikeltekst direct uit `content_items` en `content_sections`. Alleen de RLS-regels aanpassen was daarom onvoldoende: conceptwijzigingen aan een eerder gepubliceerd artikel konden via een zoekresultaat terugkomen. De zoekfunctie leest nu titel, samenvatting, sectietitel en fragment uit dezelfde gepubliceerde snapshot. De bestaande resultaatvelden, Nederlandse zoekweging en filters blijven bestaan. Interne tags worden niet meegenomen. De live zoekopdracht `prestatiedruk` met filter `article` gaf één gepubliceerd resultaat.

## Waarom het eerder niet werkte

**Bouwfout.** De oude productiebuild mislukte tijdens het vooraf renderen van `/` met de melding `Gepubliceerde inhoud kon niet worden geladen`. De testbuild zonder Supabase-configuratie sloeg die reader over en kon daardoor toch slagen. De fout is eerder gereproduceerd met de geconfigureerde lokale databasefixture. De reader wacht nu eerst op `connection()` buiten de Supabase/PostgREST-aanroep, zodat Next.js de aanvraag als request-time data behandelt voordat de SDK fetch-fouten opvangt. Die oplossing staat sinds `88784f7ea27cb9f3c2689e63205fa2c3f29cb213` in de code. De testworkflow bouwt nu met die configuratiefixture.

**Eerdere migratieblokkade.** De vorige status meldde een blokkade door de uitvoertool; in de database stond geen geslaagde activatiemigratie en de oude leespolicy was nog aanwezig. Bij deze nieuwe uitvoering is inhoudelijk dezelfde activatie-SQL via `apply_migration` geaccepteerd en geregistreerd. De beschikbare historie bevat geen concrete foutcode die de precieze reden van die eerdere toolblokkade bewijst. Er is dus geen onderbouwde reden om die toe te schrijven aan DNS, het Amparis-domein of een specifieke SQL-fout. Er zijn geen toegangsbeperkingen omzeild.

**Onvolledige omzetting.** Naast de oorspronkelijke bouwfout bleken de oudere onderzoekspagina en de openbare zoekfunctie nog niet naar gepubliceerde edities te zijn omgezet. Beide zijn in deze aanvulling meegenomen.

## Tests en gebruik

De workflow op commit `afbe1a10d80b0256da670ef220d0efc75f124568` is geslaagd: publicatie-, hoofdstuk-, verwijzings-, paneel-, activatie-, schrijf- en sidebar-tests plus de productiebuild met geconfigureerde databasefixture. De nieuwe activatietests gebruiken de echte schrijfmigratie in PGlite. Ze controleren zoeken op interne tags, letterlijke `%`/`_`, gepubliceerde titels na conceptwijzigingen, ontoegankelijke conceptouders, vrijgeven/offline halen, dossiertriggergedrag en het afschermen van concepttekst in publieke zoekresultaten. Voor de oude dossierfunctie wordt een expliciete lokale testdouble van de artikellinkquery gebruikt; daarnaast is de echte productie-dossiersynchronisatie uitgevoerd en read-only gecontroleerd.

De ingelogde Werkplek is niet interactief met een persoonlijk productieaccount getest. De componenttests gebruiken lokale testgegevens. De bestaande npm-waarschuwingen over kwetsbare pakketten zijn niet met deze wijzigingen opgelost.

Gebruik: open een artikel, analyse of casus in Werkplek. Bewaar je werktekst met Concept opslaan. Kies onder Structuur & publicatie → Publiceren & SEO Meridian en/of Amparis, sla de instellingen op en kies Publiceer geselecteerde websites. Hoofdstukken, interne tags en verwijzingen blijven in hetzelfde zijpaneel.

De vroegere waarschuwing om bewerkingen aan bestaande gepubliceerde artikelen niet als privéconcept te behandelen is hiermee opgeheven voor deze gedeelde artikeltypen. Dit verandert NIET het aparte publicatiemodel van `content_type=research`: die oude onderzoekseditor blijft zijn eigen live-opslag gebruiken. Amparis is bereikbaar onder `https://www.amparis.nl`; het adres zonder www verwijst daarheen. Privénotities en ledenpublicaties blijven apart. De editor gebruikt nog leesbare Markdown voor verwijzingen en één verslagpositie per artikel, zoals eerder afgebakend.

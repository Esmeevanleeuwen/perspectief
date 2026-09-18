# Gedeeld publiceren: Meridian en Avera

## Dagelijks gebruik

Open een artikel, analyse of casus in **Werkplek**. De knop **Structuur & publicatie** opent een zijpaneel met Hoofdstukken, Verwijzingen, Tags en Publiceren & SEO. Privénotities en ledenpublicaties krijgen deze knop niet. De bestaande persoonlijke mappen, links, tabbladen en sessies blijven bestaan.

**Concept opslaan** slaat alleen de werktekst op. Kies daarna onder Publiceren & SEO de websites en sla de instellingen op. **Publiceer geselecteerde websites** maakt één onveranderlijke versie en koppelt die aan de gekozen websites. Publiceren op alleen Meridian laat Avera's vorige versie staan. Een website uitvinken haalt een bestaande versie niet offline; gebruik daarvoor **Offline halen** bij die website. Iedere publicatie controleert zowel de tekstversie als de instellingen- en verslagversie.

**Hoofdstukken.** Begin een verslag met het geopende artikel of kies een bestaand verslag. Verdergaan in een nieuw hoofdstuk maakt een nieuwe conceptpagina en opent die in de Werkplek. Zoek via Verwijzingen een bestaand artikel om het aan het verslag toe te voegen. Omhoog/omlaag verandert de volgorde. Ontkoppelen verwijdert geen artikel. De structuur wordt eerst als concept opgeslagen en met Publiceer geselecteerde websites op de gekozen sites bijgewerkt. Eén artikel heeft in deze eerste uitvoering één verslagpositie; mappen kunnen wel meerdere verwijzingen bevatten.

De publieke inhoudsopgave en vorige/volgende-links gebruiken alleen hoofdstukken die op die website gepubliceerd zijn. Een nog niet gepubliceerd hoofdstuk wordt overgeslagen, zonder titel of inhoud aan bezoekers te tonen. Hoofdstukken blijven zelfstandige artikelen met een eigen URL. De verslag-URL blijft bij een titelwijziging gelijk.

**Verwijzingen.** Selecteer woorden in een tekstsectie, klik Verwijzen, zoek een artikel of interne tag en kies een hele pagina of een sectie. Link invoegen maakt een verwijzing met het artikel-ID en eventueel sectie-ID. In het schrijfvlak gebruikt deze verwijzing leesbare Markdown met een stabiele `content:`-bestemming; op de website is alleen de linktekst zichtbaar. De editor is nog geen rijke WYSIWYG-editor. Zelf `[tekst](https://bron.example/pagina)` invoeren kan ook; HTML en uitvoerbare URL-schema's worden niet uitgevoerd.

Verwijzingen kiezen waar mogelijk een publicatie op dezelfde website. Anders kan een gepubliceerde versie op de andere website worden gebruikt wanneer het officiële websiteadres bekend is. Een niet beschikbare bestemming wordt gewone tekst; een vervallen sectie verwijst naar de pagina. Je kunt gevonden stukken openen of ernaast lezen. Interne verbanden (achtergrond, onderbouwing, vervolg, tegenargument, gerelateerd) voegen geen openbare link toe. Terugverwijzingen tonen welke opgeslagen artikelteksten of interne verbanden naar het huidige stuk verwijzen.

**Tags** zijn redactionele metadata. Ze worden niet in openbare HTML, JSON-LD of de publieke API opgenomen. De Werkplek en verwijzingszoeker kunnen erop zoeken. Deze tags zijn geen meta-keywords of onzichtbare zoekmachine-tekst.

## Opslag

`content_items` en `content_sections` blijven de ene bewerkbare artikelbron. `publishing_configs` bewaart instellingen en interne metadata met versiecontrole. `publishing_revisions` bevat onveranderlijke publicatiesnapshots. `publishing_editions` kiest per website de huidige snapshot, slug, SEO en plaatsing. Een snapshot kan door beide websites worden gelezen; er ontstaat geen tweede bewerkbaar artikel.

`publishing_reports` bewaart de conceptvolgorde. `publishing_report_editions` bewaart de expliciet gepubliceerde verslagstructuur per website. `publishing_slug_history` reserveert oude artikeladressen en ondersteunt redirects. `publishing_sites` bevat alleen platformnamen en officiële HTTPS-adressen, geen sleutels.

Publicatiefuncties gebruiken server-side identiteitscontrole, een vaste search_path en expliciete uitvoerrechten. Nieuwe tabellen zijn niet anoniem leesbaar. Alleen de whitelisted publieke projecties zijn toegankelijk. Gewone websitebezoekers kunnen geen conceptrijen, oude snapshots, configuraties of privénotities opvragen. Bewerkrechten blijven gelijk aan de bestaande databasefunctie `is_editorial()` (owner/editor). De functie die officiële websiteadressen wijzigt is alleen voor owner.

## Avera en cache

Avera leest dezelfde database via de read-only Meridian-route `/api/publicaties?platform=avera`. Deze gateway geeft uitsluitend de vrijgegeven Avera-edities terug. `SHARED_CONTENT_API_URL` kan de gateway overschrijven. Het standaardadres is `https://meridiancollective.nl/api/publicaties`. Er is geen service-role sleutel of kopieersynchronisatie nodig.

Artikel-, verslag- en catalogusaanvragen gebruiken `no-store`. Daardoor ziet een nieuwe aanvraag de laatst gepubliceerde editie zonder een tweede Vercel-cache ongeldig te hoeven maken. Een reeds geopende browserpagina wordt niet vanzelf ververst. De bestaande dossiercaches worden na publicatie wel ongeldig gemaakt. De homepage toont een gedeeld artikel alleen als het voor Avera is uitgelicht; de bestaande landingsinhoud blijft anders staan. Een hoofditem kan de Avera-hero overnemen.

Avera's officiële domein was bij het ontwerpen niet vastgesteld. Owner kan dit in het zijpaneel invullen, of de Avera-deployment kan `NEXT_PUBLIC_SITE_URL` instellen. Zonder bekend productieadres wordt geen verzonnen canonical gebruikt en blijft indexering van nieuwe pagina's uit. Een repositorywijziging maakt niet vanzelf een nieuwe hostingkoppeling aan.

## SEO

Elk hoofdstuk heeft een eigen titel/beschrijving, canonical en indexeringskeuze. Er zijn gewone HTML-links tussen hoofdstukken en naar de inhoudsopgave, Open Graph/Twitter-velden, Article/CreativeWorkSeries en een inhoudsopgave met ItemList. Interne labels verschijnen daar niet in. Er is geen meta-keywords tag.

Bij dezelfde inhoud op beide domeinen kiest de redactie per editie een voorkeursversie. Een canonical is een aanwijzing, geen garantie dat een zoekmachine twee identieke versies afzonderlijk indexeert. Een hoofdstuk wijst niet standaard naar hoofdstuk één. De sitemap bevat alleen gepubliceerde, indexeerbare, self-canonical artikelen. Preview-deployments blijven noindex. Een verslag waarvan geen enkel gepubliceerd hoofdstuk indexeerbaar is, wordt niet in de sitemap gezet.

Officiële achtergrond: Google Search Central over crawlbare links, canonicalisatie en pagination; Next.js Metadata API. De code vertrouwt niet op `rel=next/prev` als speciale Google-indexeringsinstructie.

## Uitrol en controles

1. Voer `202609180001_shared_publishing.sql` uit. Deze maakt nieuwe objecten en neemt alleen al gepubliceerde Meridian-artikelen over als eerste releases. Hij publiceert niets op Avera en verandert geen bestaande artikeltekst.
2. Deploy de nieuwe Meridian-readers en Avera-code. Controleer de publieke API en een bestaand artikel.
3. Voer `202609180002_activate_shared_publishing.sql` uit. Die sluit de anonieme toegang tot ruwe artikelconcepten af, maakt interne tags doorzoekbaar voor de redactie en laat bestaande dossiers de vrijgegeven artikeltitels gebruiken.
4. Controleer publiek lezen en de admin met een eigen beheersessie. Stel het officiële Avera-adres in en publiceer bewust een artikel op Avera.

De onafhankelijke onderzoekseditor (`content_type=research`) en bestaande dossierkern houden hun eigen publicatiemodel. Een verslag uit artikelen is niet hetzelfde als die oudere onderzoeksdatabase. Privénotities of ledenpublicaties worden niet automatisch gepromoveerd. Voor een volledige rijke editor of meerdere verslagposities per artikel is een aanvullende uitbreiding nodig.

Tests: `node --test tests/publishing-links.test.mjs tests/publishing-panel.test.mjs tests/shared-publishing.test.mjs`; daarnaast de bestaande publicatie-, navigatie-, schrijf- en sidebar-tests en `npm run build`. De SQL-tests gebruiken een tijdelijke PGlite-database en veranderen geen productieartikelen.

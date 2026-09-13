# De schrijfwerkplek in Publicaties

De route `/admin/content` gebruikt de bestaande layout van Meridian Beheer. Header, zijbalk, broodkruimel, kleuren en lettertypes komen uit dezelfde admincomponenten. De werkplek vult de inhoud van `PublicationsModule.tsx`.

## Welke bouwsteen pas je aan?

De componenten staan in `src/components/admin/publications/workspace/`.

| Onderdeel | Bestand | Verantwoordelijkheid |
| --- | --- | --- |
| Samenstellen van Publicaties | `../PublicationsModule.tsx` | Titel, acties, gedeelde modulelayout en de gegevenscomponent |
| Gegevens ophalen bij openen | `WritingWorkspaceData.tsx` | Controleert toegang en laadt de bewaarde werkplek, eerste lijstpagina en geselecteerde stukken |
| Gedrag van de werkplek | `WritingWorkspace.tsx` | Verbindt gebruikershandelingen met de losse onderdelen |
| Indeling | `WorkspaceLayout.tsx` | Benoemde plekken voor navigatie, tabbladen, lijst, schrijfvlak, tweede stuk en meldingen |
| Uiterlijk | `workspace.css` | Gebruikt bestaande adminvariabelen zoals `--paper`, `--ink`, `--line` en `--accent` |
| Collecties en sessies | `Collections.tsx` | Handmatig indelen, hernoemen, opheffen en sessies heropenen |
| Open stukken | `DocumentTabs.tsx` | Wisselen, sluiten en tabbladen als sessie bewaren |
| Zoeken en selecteren | `WritingList.tsx` | Titel/tekst zoeken, type, status, homepagefilter en pagina's |
| Schrijven | `DocumentEditor.tsx` | Titel, samenvatting en tekstsecties bewerken; opslaan, koppelen en indelen |
| Stuk ernaast | `ReferencePane.tsx` | Lezen en vergelijken terwijl het schrijfvlak beschikbaar blijft |
| Snel vastleggen | `QuickCapture.tsx` | Een privénotitie maken zonder eerst publicatiegegevens te kiezen |
| Indeling bewaren | `useWritingSpace.ts` | Schrijft wijzigingen na een korte pauze, in volgorde en met versiecontrole |
| Open teksten en wijzigingen | `useWritingDocuments.ts` | Laadt stukken, bewaart lokale bewerkingen en verwerkt opslaan |
| Zoekresultaten | `useWritingSearch.ts` | Zoekt na een korte typpauze en negeert achterhaalde antwoorden |

`WorkspaceLayout` bepaalt waar een component staat. Een andere indeling vraagt geen verandering aan het ophalen of bewaren. In `WritingWorkspace` kun je een onderdeel vervangen door een andere component met dezelfde gegevens en callbacks.

## Wat hoort bij wat?

Een sleutel zoals `publication:<id>` of `note:<id>` verwijst naar één origineel. Collecties, tabbladen, sessies en verbindingen bewaren deze sleutels. Ze maken geen kopieën van artikeltekst.

Een collectie is een handmatige verzameling. Een stuk kan in meerdere collecties voorkomen. De inbox toont de stukken die nog niet in een van jouw collecties zijn ingedeeld. Een sessie bewaart de open tabbladen, selectie, filters en weergave. Het heropenen daarvan opent de huidige teksten. Verbindingen worden bij beide betrokken stukken getoond en zijn onderdeel van jouw persoonlijke indeling.

Type, publicatiestatus en homepage-instelling blijven afzonderlijke eigenschappen. De werkplek publiceert geen concepten. Bij een reeds gepubliceerd artikel heet de opslagknop **Wijzigingen live opslaan**, omdat een wijziging dan ook in de openbare tekst verschijnt.

## Opslag en toegang

| Gegevens | Opslag |
| --- | --- |
| Bestaande publicaties | Bestaande `content_items` en `content_sections` |
| Privénotities | `admin_writing_notes`, één rij per notitie met eigen secties en versie |
| Collecties, sessies, verbindingen en laatste indeling | `admin_writing_spaces`, één rij per beheeraccount |

De types en validatie staan in `src/lib/admin/writing/`. De repository bevat het lezen en vertalen van gegevens. De serveracties staan in `src/app/admin/content/workspace-actions.ts` en controleren bij iedere actie opnieuw de beheertoegang.

De nieuwe tabellen hebben eigenaarscontrole via RLS. Een ander beheeraccount kan jouw privénotities of indeling niet lezen. De bestaande rechten op publicaties blijven gelden; de database staat artikelbewerking momenteel toe aan `owner` en `editor`. Andere rollen die toegang hebben tot de admin krijgen alleen de publicaties te zien die hun bestaande databasebeleid toestaat.

De SQL-functies werken met de rechten van de ingelogde gebruiker (`SECURITY INVOKER`). Ze verlenen geen extra publicatierechten. Zoeken gebeurt op de server in titel, samenvatting en tekstsecties, met 25 resultaten per pagina. Alleen de geselecteerde stukken worden volledig geladen. Voor de overige tabbladen en koppelingen worden alleen titels opgehaald.

## Bewaren en gelijktijdig werken

De indeling wordt automatisch onder je account bewaard. Teksten hebben een eigen opslagknop; Ctrl/Cmd+S werkt wanneer de focus in de werkplek staat. Een stip geeft niet opgeslagen tekst aan. Tabbladen sluiten verwijdert geen stuk: de lokale bewerking blijft tijdens dit paginabezoek beschikbaar via de lijst en **Niet opgeslagen** onderaan.

Verder typen tijdens het opslaan is mogelijk. Het antwoord van de eerdere opslag overschrijft die nieuwe aanslagen niet. Bij een andere opgeslagen versie stopt het opslaan voordat er gegevens worden gewijzigd. Je kunt de nieuwste versie ernaast lezen. **Verder met deze opgeslagen versie** vraagt bevestiging voordat het lokale schrijfvlak wordt vervangen.

Artikeltekst en secties worden samen in één transactie opgeslagen. Bestaande sectietypes, aanvullende blokgegevens, afbeeldingen, slug, status en homepage-instellingen blijven behouden. Nieuwe secties worden als alineablokken achteraan toegevoegd. Overige blokinstellingen en publicatiebeheer blijven bereikbaar via **Instellingen**.

Een mislukte opslag wordt zichtbaar gemeld. Niet opgeslagen tekst blijft in het geopende schrijfvlak; bij het verlaten of verversen van de pagina waarschuwt de browser. Dit is geen offline editor: sla je tekst op voordat je de werkplek verlaat. Bij een verlopen sessie kan opnieuw inloggen nodig zijn.

## Later uitbreiden

Slimme mappen kunnen later opgeslagen zoekregels gebruiken naast de bestaande handmatige collecties. De lijst en het schrijfvlak kunnen dan dezelfde items blijven weergeven. Notities, collecties en verbindingen zijn nu handmatig; automatische indeling is niet toegevoegd.

## Controleren

```bash
npm run test:writing
node --test tests/publications-module.test.mjs
npm run test:workspace
npm run build
```

De databasetests voeren de echte migratie uit in een tijdelijke PostgreSQL-omgeving met RLS en afzonderlijke gebruikers. De React-tests gebruiken de echte componenten met testantwoorden voor de serveracties. Ze wijzigen geen productieartikelen. De live database is apart gecontroleerd op de nieuwe tabellen, RLS en uitvoerrechten. Voor een visuele controle van jouw ingelogde beheeromgeving is jouw eigen sessie nodig.

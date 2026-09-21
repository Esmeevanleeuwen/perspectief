# Status wijzigen in Publicaties

In **Admin → Publicaties** is de kolom **Status** een keuzelijst voor accounts die publicaties mogen bewerken. Kies de nieuwe status en druk op **Opslaan**. Het artikel hoeft niet eerst open. Zoeken, filters en lijstpagina blijven in de URL staan; na het opslaan wordt de lijst vernieuwd. Een artikel kan daardoor uit een actief statusfilter verdwijnen.

De bestaande statussen blijven beschikbaar: Idee, In onderzoek, Concept, Broncheck, Redactiecheck, Klaar voor publicatie, Gepubliceerd en Gearchiveerd.

Bij **Gepubliceerd** opent de knop **Publiceren** het bestaande publicatiescherm, met websitekeuze en JPG-upload. Er wordt dus niet alleen een statuslabel veranderd: publiceren maakt nog steeds een echte gepubliceerde versie. Onderzoeken gebruiken hun bestaande Meridian-publicatievorm, met een bevestiging vooraf.

Bij een verandering naar een niet-gepubliceerde status controleert de database of er nog live versies zijn. Zo ja, wordt eerst getoond op welke websites het artikel staat. Alleen na bevestiging wordt het op alle gepubliceerde websites offline gehaald en wordt de gekozen status opgeslagen. Annuleren verandert niets. Artikeltekst, afbeelding en homepage-instelling blijven bewaard; archiveren verwijdert het artikel niet. Alleen één website offline halen kan nog steeds via Structuur & publicatie.

## Techniek en controle

`PublicationStatus.tsx` vult alleen de statuskolom; de tabel blijft server-rendered. De actie `content/status-actions.ts` controleert de ingelogde gebruiker en invoer. De nieuwe SQL-functie `admin_change_publication_status` controleert dezelfde bestaande `is_editorial()`-rechten, vergrendelt het artikel en vergelijkt `updated_at` zonder verlies van precisie. De statuswijziging en eventuele intrekkingen gebeuren in één transactie. Gedeelde artikelen kunnen via deze functie niet rechtstreeks op gepubliceerd worden gezet: zij blijven de bestaande snapshot-publicatie gebruiken. De migratie wijzigt geen bestaande artikelen of rollen.

Fouten worden bij het betreffende artikel getoond. Bij een versieconflict wordt niet overschreven en verschijnt **Ververs overzicht**. Tijdens opslaan zijn de keuzelijst en knop geblokkeerd.

Tests: `node --test tests/publication-status-react.test.mjs tests/publication-status-database.test.mjs`. De databasetests gebruiken echte gedeelde-publicatiemigraties in een tijdelijke PostgreSQL-omgeving; ze veranderen geen productieartikelen. Ze controleren onder andere rechten, terugzetten naar concept, beide websites offline halen, annuleren, versieconflicten en rollback bij een mislukte intrekking.

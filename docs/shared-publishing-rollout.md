# Meridian / Amparis — uitrolstatus

Controle: 19 september 2026.

## Live code en koppeling

De Meridian-bouwfout is gereproduceerd met een lokaal nagebootste databaseconfiguratie, zonder productiegegevens. De fout trad op bij het vooraf renderen van de homepage: de Supabase-aanroep ving het Next.js-signaal voor request-time data op als een gewone fetch-fout. De gedeelde reader wacht nu eerst op `connection()` buiten de SDK. De nieuwe geconfigureerde buildtest en de bestaande publicatie-, schrijf- en sidebar-tests zijn geslaagd. De oplossing staat op main vanaf commit `88784f7ea27cb9f3c2689e63205fa2c3f29cb213`.

Gecontroleerd via de Vercel-koppeling:

- `https://meridiancollective.nl/api/publicaties?platform=avera&limit=1`: HTTP 200, JSON met een lege Amparis-catalogus en origin `https://www.amparis.nl`.
- `https://meridiancollective.nl/artikelen/prestatiedruk`: HTTP 200, nieuwe gedeelde artikelweergave, eigen canonical, Open Graph en Article JSON-LD.
- `https://www.amparis.nl/artikelen`: HTTP 200, melding dat nog geen artikel voor Amparis is gepubliceerd.
- `https://www.amparis.nl/robots.txt`: HTTP 200, verwijst naar de sitemap op hetzelfde www-adres.
- `https://www.amparis.nl/sitemap.xml`: HTTP 200; nog leeg omdat er geen Amparis-artikelen of verslagen zijn vrijgegeven.

Vercel verwijst het adres zonder www door naar www. Die bestaande hostinginstelling is behouden. Het primaire adres in `publishing_sites` en de Amparis-voorbeeldconfiguratie is hierop aangesloten. Er zijn geen DNS-records of mailinstellingen gewijzigd.

## Nog NIET geactiveerd

De uitvoertool blokkeerde de aanvraag voor `202609180002_activate_shared_publishing.sql`. De migratie is niet toegepast. Een aansluitende read-only databasecontrole bevestigde dat er geen activatiemigratie geregistreerd is en dat de oude raw-content-leespolicy nog geldt.

Daarom is de nieuwe privacyscheiding tussen de bewerkbare tekst van bestaande gepubliceerde artikelen en de openbare versies nog niet volledig actief. Behandel wijzigingen aan bestaande gepubliceerde artikelen voorlopig NIET als een privéconcept, ook als de editor die wijziging als concept opslaat. De uitbreiding van zoeken op interne tags en de aanpassing van bestaande dossierkoppelingen uit deze activatiemigratie staan eveneens nog open.

De nieuwe gedeelde artikel-API en beide websites zijn bereikbaar. Dit betekent niet dat de volledige database-uitrol afgerond is.

## Inhoud en controlemogelijkheden

De read-only databasecontrole telde acht bestaande Meridian-edities en nul Amparis-edities. In deze uitrol zijn geen artikelen automatisch op Amparis gezet, geen nieuwe hoofdstukken aangemaakt en geen artikelteksten gewijzigd. De ingelogde beheeromgeving is niet interactief met een persoonlijk account getest.

De bestaande gebruikershandleiding staat in `docs/shared-publishing.md`; de bovenstaande activatiebeperking gaat voor op beschrijvingen van de volledig uitgerolde situatie.

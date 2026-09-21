# Vindbaarheid en automatische artikelmeldingen

Deze wijziging installeert het eerder voorbereide vindbaarheidspakket op de bestaande publicatiestructuur. Artikelteksten, titels, auteurs, rollen en gepubliceerde snapshots worden niet aangepast. Er is geen databasemigratie nodig.

## Automatisch bij publiceren

Na een geslaagde publicatie op Meridian wordt de openbare versie gecontroleerd. Alleen een indexeerbare URL op het eigen productiedomein met een eigen canonical wordt via IndexNow gemeld. De melding loopt na de respons; fouten daarin draaien een geslaagde publicatie niet terug. Er worden geen beheersessie, concepten of privégegevens naar zoekmachines verstuurd. Preview-deployments sturen niets.

De zelfstandige artikel- en afbeeldingssitemap staat op `/artikelen/sitemap.xml`. De algemene sitemap en robots.txt verwijzen naar openbare ingangen. `/feed.xml` bevat maximaal 50 nieuwe of bijgewerkte artikelen met vaste artikel-ID's. Op de homepage verschijnt een klein blok **Net gepubliceerd**, onafhankelijk van handmatig uitlichten.

Zoekbeschrijvingen krijgen een afgekorte terugvaltekst zonder een normaal woord af te breken; handmatig ingevulde SEO-beschrijvingen blijven leidend. Artikelmetadata en BreadcrumbList gebruiken zichtbare publicatiegegevens. Bronadressen worden aanklikbaar zonder opgeslagen teksten te veranderen. Afbeeldingen, canonical, noindex en publicatiedata blijven uit de vrijgegeven versie komen.

## Uurlijkse controle

GitHub Actions voert **Article discovery and retries** eenmaal per uur uit en na een wijziging op main. Een handmatige start blijft mogelijk. Na een codewijziging wacht de workflow eerst op de publieke routes en de openbare IndexNow-verificatiesleutel. Hij controleert HTTP-status, robots/noindex, canonical, leesbare tekst, metadata, schema's en mogelijke dubbele tekstblokken.

Alleen nieuwe of gewijzigde adressen worden gemeld. Geaccepteerde meldingen worden via een bewaarde wijzigingsvingerafdruk overgeslagen; fouten worden bij de volgende run opnieuw geprobeerd. Eerder gemelde adressen die uit de sitemap verdwijnen worden alleen opnieuw gemeld na controle van een intrekking, redirect, andere canonical of noindex. Dubbele inhoud en ontbrekende auteurs worden gemeld, niet automatisch veranderd.

De melding is best-effort. De directe publicatiehaak en de uurlijkse controle delen geen transactiewachtrij; een dubbele melding is mogelijk. GitHub kan een geplande run vertragen en de cache kan vervallen. Vanaf 500 artikelen moeten controles worden verdeeld. Rapporten worden 30 dagen als Actions-artifact bewaard. Er wordt geen nieuw admin-tabblad of betaalde dienst geactiveerd.

## Google Search Console

IndexNow-ontvangst (HTTP 200 of 202) is geen bewijs van indexering en is geen Google-indexeringsverzoek. Google Search Console is niet aangesloten. De optionele variabelen GOOGLE_SITE_VERIFICATION en BING_SITE_VERIFICATION ondersteunen een eigen verificatiecode, maar worden niet automatisch ingevuld. Een eigenaar of volledige gebruiker van Search Console kan de sitemap indienen en voor individuele URLs een indexeringsverzoek doen.

## Testen

`node --test tests/discovery.test.mjs`

`python3 -m unittest discover -s tests -p 'test_discovery_audit.py'`

De bestaande configured build, publicatie-, upload-, status- en werkplektests blijven afzonderlijk draaien. Geen test mag bestaande productieartikelen aanpassen.

## Officiële documentatie

- https://www.indexnow.org/documentation
- https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl
- https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview
- https://nextjs.org/docs/app/api-reference/functions/after

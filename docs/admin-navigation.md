# Admin: werkgebieden en open teksten

## Navigatie

De hoofdnavigatie staat in `src/lib/admin/navigation.ts`:

- Overzicht (`/admin`): bestaande recente publicaties.
- Werkplek (`/admin/werkplek`): schrijven, privénotities, mappen, vergelijken en bewaarde sessies.
- Onderzoeken (`/admin/onderzoeken`): het bestaande onderzoeksoverzicht.
- Publicaties (`/admin/content`): beheer-overzicht met afzonderlijke filters voor type, status en homepageplaatsing.
- Gebruikers (`/admin/gebruikers`): alleen voor owner/admin, zoals voorheen.

Onder Publicaties staan Website en, voor owner/admin, Leden & persoonlijk. De bestaande `/admin/ledencontent`-routes blijven bestaan en behouden hun eigen toegangscontrole. Ook een ledenpublicatie-editor houdt Publicaties actief in het hoofdmenu.

## Schrijven versus uitgeven

De actie Schrijven bij een websitepublicatie opent `/admin/werkplek?open=publication:<id>`. Instellingen opent de bestaande publicatie-editor. Beide gebruiken hetzelfde origineel in `content_items` en `content_sections`. Privénotities, mappen en sessies blijven in de bestaande schrijftabellen. Er wordt geen tekst gekopieerd of database gemigreerd.

Ledenpublicaties blijven technisch in `member_publications`, met de bestaande rechten en ontvangers. De nieuwe subnavigatie voegt geen leestoegang toe en zet geen tekst automatisch openbaar. Website betekent het publicatiekanaal, niet dat elk concept al openbaar is.

## Open documenttabs

Open teksten staan nu zichtbaar boven het schrijfvlak. Een lange rij kan horizontaal worden gescrold; het bestaande menu naast de lijst bevat nog steeds alle open teksten en de bewaarde sessies. Het actieve tabblad blijft zichtbaar. Pijltjestoetsen, Home en End wisselen van tab; Delete sluit de gekozen tab.

Een stip betekent niet-opgeslagen tekst. Sluiten verwijdert alleen de tab, nooit de tekst. Niet-opgeslagen bewerkingen blijven tijdens dit paginabezoek in de documentcache en zijn via Niet opgeslagen terug te halen. Opslaan blijft expliciet. Het bestaande waarschuwen bij verlaten/verversen, versieconflicten, privénotities en vergelijken blijven behouden. Bewerkingen aan een reeds gepubliceerde tekst worden bij opslaan nog steeds live verwerkt; deze wijziging introduceert geen revisiesysteem.

## Afbakening van deze stap

Onderzoeken is nog het bestaande typegefilterde overzicht, geen nieuwe zelfstandige dossierdatabase. De bestaande publicatie-instellingen openen nog op hun eigen pagina, niet in een nieuw zijpaneel. Ook het dashboard en de serverrechten zijn niet opnieuw ontworpen. Deze stap scheidt de schrijfplek van publicatiebeheer en maakt de bestaande documenttabs zichtbaar.

## Controleren

`node --test tests/admin-navigation.test.mjs tests/publications-module.test.mjs tests/writing-react.test.mjs tests/writing-database.test.mjs`

Daarna `npm run test:workspace` en `npm run build`. De tests gebruiken lokale data of mocks, geen productieaccounts. Visueel en functioneel nalopen met een eigen beheersessie blijft nodig, vooral op een smal scherm.

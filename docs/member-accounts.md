# Accounts en ledenpublicaties

De publieke homepage en openbare artikelen houden hun bestaande werking. Extra publicaties staan in een eigen bibliotheek met toegang via het account.

## Gebruik

- `/registreren`: gratis account met naam of pseudoniem, e-mail en wachtwoord.
- `/bevestigen`: nieuwe bevestigingsmail aanvragen.
- `/login`: inloggen; de eerder geopende publicatie wordt na het inloggen hervat.
- `/wachtwoord-vergeten` en `/wachtwoord-instellen`: herstel via e-mail.
- `/account/bibliotheek`: zoeken in alle beschikbare ledenpublicaties of alleen persoonlijk gedeelde teksten.
- `/account/opgeslagen`: ledenpublicaties bewaren en verwijderen uit je leeslijst.
- `/account/profiel`: eigen gegevens en profielzichtbaarheid beheren.
- `/admin/ledencontent`: artikelen en teksten aanmaken, bewerken, voorvertonen, publiceren, terugzetten naar concept en verwijderen.
- `/admin/gebruikers`: zoeken op naam/e-mail en direct een persoonlijke tekst klaarzetten.

Alleen de bestaande `owner`-rol (en `admin` waar die rol door het project wordt ondersteund) beheert ledenpublicaties en de gebruikerslijst. Dit werk geeft bestaande gebruikers geen extra rollen.

Een publicatie heeft toegang voor alle geregistreerde gebruikers of maximaal 100 geselecteerde accounts. Selecties blijven behouden tijdens zoeken. Concepten zijn alleen voor beheerders zichtbaar. De tekst en ontvangers worden in één database-transactie opgeslagen. Fouten laten de bestaande publicatie intact.

Tekst wordt als veilige platte tekst met alinea’s weergegeven. Titels, introducties en tekst van ledenpublicaties verschijnen niet in de publieke CMS-tabellen, zoekindex of sitemap. De speciale bibliotheekpagina’s gebruiken geen openbare cache en geven `noindex` mee. Ingetrokken toegang geldt ook voor directe links en opgeslagen publicaties.

## Configuratie voor e-mails

E-mailregistratie en e-mailbevestiging zijn ingeschakeld in het gekoppelde Supabase-project. Voor afgeleverde bevestigings- en herstelmails moet de providerconfiguratie daarnaast kloppen:

1. Productie: `NEXT_PUBLIC_SITE_URL=https://meridiancollective.nl` (dit is ook de standaardwaarde). Gebruik bij lokaal testen de lokale origin. Voor previews kan de automatisch ingestelde `VERCEL_URL` worden gebruikt.
2. Supabase Authentication → URL Configuration: voeg de exacte productiecallback `https://meridiancollective.nl/auth/callback` toe aan toegestane redirects, inclusief eventueel benodigde preview- en lokale callback-URL’s. Verander de Site URL van dit gedeelde project niet zonder andere apps te controleren.
3. De standaard `{{ .ConfirmationURL }}`-template werkt met de PKCE-callback in dezelfde browser. Voor bevestigen op een ander apparaat ondersteunt Meridian ook token-hash-links via `/auth/confirm?token_hash={{ .TokenHash }}&type=email` en herstel via `type=recovery`. Gebruik hiervoor een vaste, vertrouwde Meridian-origin in de betreffende template; houd rekening met de andere apps in het gedeelde project.
4. Controleer de mailprovider/SMTP en doe vóór een brede uitrol een echte registratie en wachtwoordhersteltest met een eigen mailbox. SMTP-aflevering en de dashboardinstellingen voor toegestane redirects zijn niet via de beschikbare connector te verifiëren of te wijzigen.

De Vercel-previewomgeving mist momenteel de Supabase-URL/key; de productieomgeving is wel gekoppeld. Voeg dezelfde openbare Supabase-URL/key ook aan de Preview-environment toe om daar accounts te testen. Zonder deze configuratie toont de UI een beschikbaarheidsmelding in plaats van een serverfout.

Gebruik `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` of de bestaande `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Er is geen service-role-sleutel nodig in de applicatie.

## Database en verificatie

De twee nieuwe migraties maken de ledenbibliotheek, ontvangers, bladwijzers en beveiligde beheerdersfuncties aan. Ze zijn toegepast op het bestaande Meridian-project. De tweede migratie cast het e-mailadres van het Auth-schema expliciet naar `text`.

`tests/member-access.sql` gebruikt een transactie met tijdelijke testgebruikers en een rollback. De test controleert toegang voor ontvangers, andere accounts, beheerders en anonieme sessies; afscherming van de gebruikerslijst; zelftoewijzing en rolverhoging; atomair opslaan; bladwijzers; en directe intrekking van toegang. De tests versturen geen e-mails en laten geen testgebruikers achter.

`node tests/auth-paths.test.mjs` controleert veilige interne terugkeer-URL’s. `npm run build` controleert de productiecompilatie en TypeScript.

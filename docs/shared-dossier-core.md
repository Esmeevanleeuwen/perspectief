# Gedeelde dossierkern

Meridian en Ampara gebruiken dezelfde openbare dossieridentiteit en dezelfde gedeelde bronnen, maar renderen geen gedeelde pagina of component.

## Scheiding

De centrale Supabase-laag bevat:

- `dossier_core_records`: slug, canonieke titel, samenvatting, thema’s, eigenaar en publicatiestatus;
- `dossier_presentations`: een afzonderlijke presentatie voor `meridian` en `ampara`;
- bestaande openbare documenten en claims uit de Aegis-bronlaag.

Meridian leest alleen de presentatie met `platform=meridian`. De eigen React-componenten, CSS, volgorde, teksten en interne navigatie blijven in deze repository.

## Openbare API

De Edge Function heet `dossier-core`.

- `GET ?platform=meridian` — catalogus;
- `GET ?platform=meridian&slug=<slug>` — één dossier met gedeelde kern en Meridian-presentatie;
- `GET ?platform=meridian&document=<slug>` — één brondocument met gekoppelde dossiers.

De server gebruikt `DOSSIER_CORE_API_URL` wanneer die bestaat. Anders wordt de functie-URL afgeleid van `NEXT_PUBLIC_SUPABASE_URL`. De sleutel komt uit `DOSSIER_CORE_API_KEY`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` of `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.

## Publicatie en cache

Server-fetches worden vijf minuten gecachet en hebben dossier-tags. Wanneer de centrale API niet bereikbaar of niet geconfigureerd is, blijft Meridian werken met de lokale onderzoeksinhoud. Dat is een noodroute, niet een tweede bron van waarheid.

Conceptpresentaties blijven `noindex`. Alleen een eigen Meridian-presentatie met `indexable=true` komt in de sitemap. Een Ampara-publicatie maakt dus niet automatisch een indexeerbare Meridian-pagina.

## Automatische synchronisatie

Database-triggers werken de gedeelde kern bij wanneer:

- een gepubliceerd Ampara/Aegis-dossier, inhoudsblok of status verandert;
- een Meridian-onderzoek, onderzoeksmetadata, sectie of gekoppeld artikel verandert.

De trigger synchroniseert de gedeelde identiteit en de presentatie van het platform dat de wijziging deed. De presentatie van het andere platform wordt niet overschreven.

## Redactionele grens

Een identieke dossier-slug betekent: hetzelfde maatschappelijke dossier. Het betekent niet dat beide platforms dezelfde conclusie, tekst of politieke positie hebben. Kruislinks tonen die relatie expliciet en vormen geen bewijs of instemming.

# Meridian volledige upgrade — gebaseerd op huidige GitHub main

Deze ZIP is gemaakt om over de huidige repository heen te leggen.

Huidige hoofdstructuur die is meegenomen:
- Next.js 16 App Router
- bestaande `src/app`
- bestaande artikelen en onderzoeken blijven bruikbaar als fallback
- bestaande `SiteHeader`
- bestaande `articles.ts` en `research.ts`

## Wat verandert fundamenteel

### 1. Auth
Supabase login, registratie en sessies.

### 2. Account
Een account is een samenwerkingsruimte, geen politieke profielscore.

### 3. Admin
Bevoegde gebruikers kunnen:
- artikelen aanmaken;
- analyses/casussen aanmaken;
- onderzoeken aanmaken;
- contentblokken toevoegen;
- publiceren.

### 4. Database-first zonder huidige site te breken
`/artikelen/[slug]` en `/onderzoek/[slug]` proberen eerst gepubliceerde databasecontent te vinden.

Bestaat die niet?
Dan gebruiken ze automatisch de bestaande `articles.ts` / `research.ts`.

Dus je kunt stap voor stap migreren.

### 5. Onderzoek → artikelen
Nieuwe onderzoeken staan in `content_items` met type `research`.
Via `research_children` kunnen artikelen en casussen aan een dossier worden gekoppeld.

## Installatie

1. Backup/branch maken.
2. Kopieer de inhoud van deze ZIP over de repository.
3. `npm install`
4. Maak een Supabase-project.
5. Voer `supabase/complete-schema.sql` uit.
6. Maak `.env.local` op basis van `.env.local.example`.
7. Pas `SETUP_ADMIN.sql` aan en voer hem uit.
8. Voeg de regels uit `PATCHES/globals.css.addition.txt` toe aan `src/app/globals.css`.
9. Voeg de regels uit `PATCHES/SiteHeader.module.css.addition.txt` toe aan `src/app/components/Layout/SiteHeader.module.css`.
10. `npm run build`

## Belangrijk

Deze versie verwijdert je bestaande statische content NIET.
Dat is bewust: de nieuwe database kan groeien zonder dat de huidige homepage/artikelen meteen breken.

## Logische volgende stap

Na deze upgrade:
- homepage uit database laten lezen;
- claims/bronnen/knowledge graph aan admin koppelen;
- automatische import;
- publicatieversies;
- review queue;
- samenwerkingsruimtes.

# Meridian V2 — clean architecture

Deze overlay is bedoeld voor de schone basis rond commit `3cd3fe1`.

De bestaande vormgeving en statische content blijven werken. Supabase wordt de nieuwe bron voor accounts, beheer en nieuwe content. Onderzoek wordt opgebouwd uit nodes, relaties, claims, bronnen en perspectieven. Artikelen worden daar bovenop gepubliceerd.

## Installatie

1. Werk op branch `meridian-v2-clean-architecture`.
2. Kopieer deze overlay over het project.
3. `npm install`
4. Maak `.env.local` naast `package.json`.
5. Voer in Supabase `000_reset_meridian_public.sql` uit als de oude Meridian-tabellen weg mogen.
6. Voer daarna `001_core.sql` t/m `006_indexes.sql` op volgorde uit.
7. Registreer via `/registreren`.
8. Maak jezelf owner met `007_make_owner.example.sql`.
9. Open `/admin`.
10. Migreer bestaande TypeScript-content met `npm run migrate:static-content`.
11. Voeg het onderzoek naar mannen toe met `008_seed_mannenonderzoek.sql`.

Gebruik nooit een service-role key als `NEXT_PUBLIC_*` variabele.

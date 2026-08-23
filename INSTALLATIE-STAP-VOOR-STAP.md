# Stap voor stap

## 1. Git

```bash
git switch meridian-v2-clean-architecture
```

## 2. Overlay

Kopieer de inhoud van deze map over je project en voer uit:

```bash
npm install
```

## 3. Environment

Maak `.env.local` naast `package.json`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://JOUW-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

Voor alleen de eenmalige lokale migratie:

```env
SUPABASE_SERVICE_ROLE_KEY=...
```

## 4. Supabase

Voer op volgorde uit:

- `000_reset_meridian_public.sql` — alleen als de oude public-tabellen weg mogen
- `001_core.sql`
- `002_content.sql`
- `003_research_graph.sql`
- `004_rls.sql`
- `005_views.sql`
- `006_indexes.sql`

## 5. Account

```bash
npm run dev
```

Ga naar `http://localhost:3000/registreren`.

Voer daarna `007_make_owner.example.sql` uit met je eigen e-mailadres.

## 6. Bestaande content

```bash
npm run migrate:static-content
```

Hiermee worden de bestaande `articles.ts` en `research.ts` naar Supabase gekopieerd.

## 7. Mannenonderzoek

Voer `008_seed_mannenonderzoek.sql` uit.

## 8. Publieke routes

Volg `INTEGRATIE-PUBLIEKE-PAGINAS.md`.

## 9. Controle

```bash
npm run build
```

Daarna pas committen.

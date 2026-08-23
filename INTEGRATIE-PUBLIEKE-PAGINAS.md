# Publieke pagina's aansluiten zonder de bestaande vormgeving te slopen

De overlay laat de huidige artikel- en onderzoekpagina intact. Voeg databasecontent eerst als fallback-voorkeur toe.

## `src/app/artikelen/[slug]/page.tsx`

Bovenaan:

```tsx
import { getDbContentBySlug } from "@/lib/meridian/content";
import DatabaseArticle from "@/app/components/database/DatabaseArticle";
```

Direct na `const { slug } = await params;`:

```tsx
const dbItem = await getDbContentBySlug(slug);
if (dbItem && dbItem.status === "published" && ["article","analysis","case"].includes(dbItem.content_type)) {
  return <DatabaseArticle item={dbItem} />;
}
```

Daarna blijft je bestaande `articles.ts`-logica als fallback bestaan.

## `src/app/onderzoek/[slug]/page.tsx`

Bovenaan:

```tsx
import { getDbContentBySlug } from "@/lib/meridian/content";
import DatabaseResearch from "@/app/components/database/DatabaseResearch";
```

Na het uitlezen van `slug`:

```tsx
const dbItem = await getDbContentBySlug(slug);
if (dbItem && dbItem.status === "published" && dbItem.content_type === "research") {
  return <DatabaseResearch item={dbItem} />;
}
```

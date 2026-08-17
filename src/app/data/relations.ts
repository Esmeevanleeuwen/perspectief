import { articles } from "@/app/data/articles";
import { getSystemPage } from "@/app/data/systeem";

export const articleSystemRelations: Record<string, string[]> = {
  prestatiedruk: [
    "emotie-en-sociale-intuitie",
    "groepsverwerking-en-logica",
    "perspectieven-en-journalistiek",
  ],
  "leraren-onderwijs": [
    "perspectieven-en-journalistiek",
    "groepsverwerking-en-logica",
    "kennisgraaf",
  ],
  woningonzekerheid: [
    "informatie-en-betekenis",
    "perspectieven-en-journalistiek",
    "actie-en-participatie",
  ],
};

export function getSystemRelationsForArticle(articleSlug: string) {
  return (articleSystemRelations[articleSlug] ?? [])
    .map((slug) => getSystemPage(slug))
    .filter((page) => page !== undefined);
}

export function getArticleRelationsForSystem(systemSlug: string) {
  return articles.filter((article) =>
    articleSystemRelations[article.slug]?.includes(systemSlug)
  );
}

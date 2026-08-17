import { notFound } from "next/navigation";
import { articles } from "@/app/data/articles";

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;

  const article = articles.find(
    (article) => article.slug === slug
  );

  if (!article) {
    notFound();
  }

  return (
    <main>
      <h1>{article.title}</h1>

      <p>{article.description}</p>

      <img
        src={article.image}
        alt={article.title}
      />
    </main>
  );
}
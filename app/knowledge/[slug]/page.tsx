import { getKnowledgeArticle } from "@/lib/content";

import Article from "@/components/article/Article";
import ArticleHeader from "@/components/article/ArticleHeader";
import ArticleBody from "@/components/article/ArticleBody";

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
const article = getKnowledgeArticle(slug);

return (
  <Article>
    <ArticleHeader
      title={article?.title ?? ""}
      description={article?.description}
    />

    <ArticleBody
      content={article?.content ?? ""}
    />
  </Article>
);
}
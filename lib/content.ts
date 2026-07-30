import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const CONTENT_PATH = path.join(process.cwd(), "content");

export function getKnowledgeArticles() {
  const directory = path.join(CONTENT_PATH, "knowledge", "photography");

  return fs
    .readdirSync(directory)
    .filter((file) => file.endsWith(".md"))
    .map((file) => {
      const fullPath = path.join(directory, file);
      const source = fs.readFileSync(fullPath, "utf8");

      const { data, content } = matter(source);

      return {
        ...data,
        content,
      };
    });
}
export function getKnowledgeArticle(slug: string) {
  const articles = getKnowledgeArticles();

  return articles.find(
    (article) => article.slug === slug
  );
}
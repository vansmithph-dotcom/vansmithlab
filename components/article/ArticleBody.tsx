import Markdown from "react-markdown";

interface ArticleBodyProps {
  content: string;
}

export default function ArticleBody({
  content,
}: ArticleBodyProps) {
  return (
    <article className="article-body">
      <Markdown>
        {content}
      </Markdown>
    </article>
  );
}
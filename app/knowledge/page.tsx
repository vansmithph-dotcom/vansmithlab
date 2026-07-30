import Container from "@/components/ui/Container";
import Section from "@/components/ui/Section";
import Stack from "@/components/ui/Stack";
import Heading from "@/components/ui/Heading";
import Text from "@/components/ui/Text";
import { getKnowledgeArticles } from "@/lib/content";
import Grid from "@/components/ui/Grid";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Link from "@/components/ui/Link";

export default function KnowledgePage() {

  const articles = getKnowledgeArticles();

  return (
   <Section>
  <Container>
    <Stack gap="xl">

      <Heading level={1}>
        Knowledge
      </Heading>

      <Grid columns={3}>
        {articles.map((article) => (
          <Link
            key={article.slug}
            href={`/knowledge/${article.slug}`}
          >
            <Card>
              <Badge>{article.category}</Badge>

              <Heading level={3}>
                {article.title}
              </Heading>

              <Text>
                {article.description}
              </Text>
            </Card>
          </Link>
        ))}
      </Grid>

    </Stack>
  </Container>
</Section>
  );
}
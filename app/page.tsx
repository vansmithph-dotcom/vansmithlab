import Divider from "@/components/ui/Divider";
import Badge from "@/components/ui/Badge";
import Link from "@/components/ui/Link";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";
import Section from "@/components/ui/Section";
import Stack from "@/components/ui/Stack";
import Grid from "@/components/ui/Grid";
import Heading from "@/components/ui/Heading";
import Text from "@/components/ui/Text";

export default function HomePage() {
  return (
    <main>
      <Section>
        <Container>

         <Stack gap="xl">
  <Heading level={1}>
    VAN SMITH LAB
  </Heading>


  <Grid columns={3}>
    <Link href="/knowledge">
  <Card>
    <Badge>Knowledge</Badge>

    <Heading level={3}>
      Knowledge
    </Heading>

    <Text>
      Articles, essays and visual references.
    </Text>
  </Card>
</Link>

<Card>
  <Heading level={3}>Research</Heading>
  <Text>Original investigations and AI experiments.</Text>
</Card>

<Card>
  <Heading level={3}>Collections</Heading>
  <Text>Curated libraries and thematic archives.</Text>
</Card>
  </Grid>
</Stack>

        </Container>
      </Section>
    </main>
  );
}
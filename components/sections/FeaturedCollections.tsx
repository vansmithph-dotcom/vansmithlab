import Container from "@/components/ui/Container";
import Section from "@/components/ui/Section";
import Stack from "@/components/ui/Stack";
import Grid from "@/components/ui/Grid";
import Card from "@/components/ui/Card";
import Heading from "@/components/ui/Heading";
import Text from "@/components/ui/Text";
import Badge from "@/components/ui/Badge";
import Link from "@/components/ui/Link";
import SectionHeader from "./SectionHeader";

export default function FeaturedCollections() {
  return (
    <Section>
      <Container>
        <Stack gap="xl">
          <SectionHeader
  title="Featured Collections"
  description="Curated thematic collections."
/>

          <Grid columns={3}>
            <Link href="/collections">
              <Card>
                <Badge>Collection</Badge>

                <Heading level={3}>
                  Editorial Fashion
                </Heading>

                <Text>
                  Curated editorials, campaigns and visual references.
                </Text>
              </Card>
            </Link>

            <Link href="/collections">
              <Card>
                <Badge>Collection</Badge>

                <Heading level={3}>
                  Luxury Branding
                </Heading>

                <Text>
                  Identity systems, typography and premium visual design.
                </Text>
              </Card>
            </Link>

            <Link href="/collections">
              <Card>
                <Badge>Collection</Badge>

                <Heading level={3}>
                  AI Visual Library
                </Heading>

                <Text>
                  Prompt engineering, workflows and production examples.
                </Text>
              </Card>
            </Link>
          </Grid>
        </Stack>
      </Container>
    </Section>
  );
}
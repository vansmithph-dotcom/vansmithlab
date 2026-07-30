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

export default function FeaturedResearch() {
  return (
    <Section>
      <Container>
        <Stack gap="xl">
          <SectionHeader
  title="Featured Research"
  description="Original research and analytical publications."
/>

          <Grid columns={3}>
            <Link href="/research">
              <Card>
                <Badge>Research</Badge>

                <Heading level={3}>
                  Visual Trends 2026
                </Heading>

                <Text>
                  Analysis of contemporary visual language across fashion, branding and AI.
                </Text>
              </Card>
            </Link>

            <Link href="/research">
              <Card>
                <Badge>Research</Badge>

                <Heading level={3}>
                  AI Image Models
                </Heading>

                <Text>
                  Comparing modern image generation models and production workflows.
                </Text>
              </Card>
            </Link>

            <Link href="/research">
              <Card>
                <Badge>Research</Badge>

                <Heading level={3}>
                  Luxury Brand Systems
                </Heading>

                <Text>
                  Research on visual identity systems used by luxury brands.
                </Text>
              </Card>
            </Link>
          </Grid>
        </Stack>
      </Container>
    </Section>
  );
}
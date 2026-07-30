import Container from "@/components/ui/Container";
import Section from "@/components/ui/Section";
import Stack from "@/components/ui/Stack";
import Heading from "@/components/ui/Heading";
import Text from "@/components/ui/Text";

export default function CollectionsPage() {
  return (
    <Section>
      <Container>
        <Stack gap="lg">
          <Heading level={1}>Collections</Heading>

          <Text>
            Collections bring together related articles,
            research, visual references and resources into
            curated thematic libraries for deeper exploration.
          </Text>
        </Stack>
      </Container>
    </Section>
  );
}
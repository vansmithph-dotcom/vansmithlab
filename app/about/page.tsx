import Container from "@/components/ui/Container";
import Section from "@/components/ui/Section";
import Stack from "@/components/ui/Stack";
import Heading from "@/components/ui/Heading";
import Text from "@/components/ui/Text";

export default function AboutPage() {
  return (
    <Section>
      <Container>
        <Stack gap="lg">
          <Heading level={1}>About</Heading>

          <Text>
            VAN SMITH LAB is an independent knowledge library
            dedicated to contemporary visual culture.
          </Text>

          <Text>
            The project explores photography, fashion,
            branding, architecture, design, luxury and
            artificial intelligence through original research,
            curated collections and educational resources.
          </Text>
        </Stack>
      </Container>
    </Section>
  );
}
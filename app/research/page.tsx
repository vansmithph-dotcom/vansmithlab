import Container from "@/components/ui/Container";
import Section from "@/components/ui/Section";
import Stack from "@/components/ui/Stack";
import Heading from "@/components/ui/Heading";
import Text from "@/components/ui/Text";

export default function ResearchPage() {
  return (
    <Section>
      <Container>
        <Stack gap="lg">
          <Heading level={1}>Research</Heading>

          <Text>
            Research explores visual culture through analysis,
            experimentation and documentation. Topics include
            AI, photography, branding, design systems,
            architecture and luxury industries.
          </Text>
        </Stack>
      </Container>
    </Section>
  );
}
import Container from "@/components/ui/Container";
import Section from "@/components/ui/Section";
import Stack from "@/components/ui/Stack";
import Heading from "@/components/ui/Heading";
import Text from "@/components/ui/Text";

export default function GalleryPage() {
  return (
    <Section>
      <Container>
        <Stack gap="lg">
          <Heading level={1}>Gallery</Heading>

          <Text>
            The gallery showcases selected visual projects,
            photography, AI-generated imagery and editorial
            work created or curated by VAN SMITH LAB.
          </Text>
        </Stack>
      </Container>
    </Section>
  );
}
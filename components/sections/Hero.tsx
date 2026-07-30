import Container from "@/components/ui/Container";
import Section from "@/components/ui/Section";
import Stack from "@/components/ui/Stack";
import Heading from "@/components/ui/Heading";
import Text from "@/components/ui/Text";
import Input from "@/components/ui/Input";

export default function Hero() {
  return (
    <Section>
      <Container>
        <Stack gap="xl">
          <Heading level={1}>
            VAN SMITH LAB
          </Heading>

          <Text>
            Independent Knowledge Library
            <br />
            of Contemporary Visual Culture
          </Text>

          <Input placeholder="Search the knowledge library..." />
        </Stack>
      </Container>
    </Section>
  );
}
import { ReactNode } from "react";

import Container from "@/components/ui/Container";
import Section from "@/components/ui/Section";
import Stack from "@/components/ui/Stack";

import SectionHeader from "./SectionHeader";

interface FeaturedSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export default function FeaturedSection({
  title,
  description,
  children,
}: FeaturedSectionProps) {
  return (
    <Section>
      <Container>
        <Stack gap="xl">
          <SectionHeader
            title={title}
            description={description}
          />

          {children}
        </Stack>
      </Container>
    </Section>
  );
}
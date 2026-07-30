import { ReactNode } from "react";

import Container from "@/components/ui/Container";
import Section from "@/components/ui/Section";

interface ArticleProps {
  children: ReactNode;
}

export default function Article({
  children,
}: ArticleProps) {
  return (
    <Section>
      <Container size="md">
        {children}
      </Container>
    </Section>
  );
}
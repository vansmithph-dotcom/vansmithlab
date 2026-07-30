import Heading from "@/components/ui/Heading";
import Text from "@/components/ui/Text";
import Stack from "@/components/ui/Stack";

interface SectionHeaderProps {
  title: string;
  description?: string;
}

export default function SectionHeader({
  title,
  description,
}: SectionHeaderProps) {
  return (
    <Stack gap="sm">
      <Heading level={2}>{title}</Heading>

      {description && (
        <Text>{description}</Text>
      )}
    </Stack>
  );
}
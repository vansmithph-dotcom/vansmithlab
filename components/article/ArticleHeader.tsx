import Stack from "@/components/ui/Stack";
import Heading from "@/components/ui/Heading";
import Text from "@/components/ui/Text";
import Divider from "@/components/ui/Divider";

interface ArticleHeaderProps {
  title: string;
  description?: string;
}

export default function ArticleHeader({
  title,
  description,
}: ArticleHeaderProps) {
  return (
    <Stack gap="lg">
      <Heading level={1}>{title}</Heading>

      {description && (
        <Text>{description}</Text>
      )}

      <Divider />
    </Stack>
  );
}
import Grid from "@/components/ui/Grid";
import Card from "@/components/ui/Card";
import Heading from "@/components/ui/Heading";
import Text from "@/components/ui/Text";
import Badge from "@/components/ui/Badge";
import Link from "@/components/ui/Link";
import FeaturedSection from "./FeaturedSection";


export default function FeaturedKnowledge() {
  return (
    <FeaturedSection
      title="Featured Knowledge"
      description="Selected articles from the knowledge library."
    >
      <Grid columns={3}>
        <Link href="/knowledge">
          <Card>
            <Badge>Knowledge</Badge>
            <Heading level={3}>Fashion Photography</Heading>
            <Text>
              Composition, lighting, posing and visual storytelling.
            </Text>
          </Card>
        </Link>

        <Link href="/knowledge">
          <Card>
            <Badge>Knowledge</Badge>
            <Heading level={3}>Product Photography</Heading>
            <Text>
              Marketplace, commercial and luxury product workflows.
            </Text>
          </Card>
        </Link>

        <Link href="/knowledge">
          <Card>
            <Badge>Knowledge</Badge>
            <Heading level={3}>AI Creative Tools</Heading>
            <Text>
              Midjourney, Nano Banana, Veo, Runway and modern AI workflows.
            </Text>
          </Card>
        </Link>
      </Grid>
    </FeaturedSection>
  );
}
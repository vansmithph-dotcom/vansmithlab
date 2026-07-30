import Hero from "@/components/sections/Hero";
import FeaturedKnowledge from "@/components/sections/FeaturedKnowledge";
import FeaturedResearch from "@/components/sections/FeaturedResearch";
import FeaturedCollections from "@/components/sections/FeaturedCollections";

export default function HomePage() {
  return (
    <>
      <Hero />

      <FeaturedKnowledge />

      <FeaturedResearch />

      <FeaturedCollections />
    </>
  );
}
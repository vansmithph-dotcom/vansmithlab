import type { MetadataRoute } from "next";
import { listContent } from "@/lib/content";
import { locales, sectionKeys } from "@/lib/site-data";

export const dynamic = "force-static";

const siteUrl = "https://vansmithlab.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticEntries: MetadataRoute.Sitemap = locales.flatMap((locale) => [
    { url: `${siteUrl}/${locale}/`, changeFrequency: "weekly" as const, priority: 1 },
    ...sectionKeys.map((section) => ({
      url: `${siteUrl}/${locale}/${section}/`,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
  ]);

  const sectionForContentType = (contentType: string) => {
    if (contentType === "encyclopedia") return "encyclopedia";
    if (contentType === "research" || contentType === "case_study" || contentType === "visual_analysis") return "articles";
    if (contentType === "collection") return "collections";
    return contentType;
  };

  const contentEntries: MetadataRoute.Sitemap = listContent().map((item) => ({
    url: `${siteUrl}/${item.locale}/${sectionForContentType(item.content_type)}/${item.slug}/`,
    lastModified: item.last_reviewed,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  return [...staticEntries, ...contentEntries];
}

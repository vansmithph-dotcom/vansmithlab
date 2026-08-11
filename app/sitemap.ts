import type { MetadataRoute } from "next";
import { listContent, sectionForContentType } from "@/lib/content";
import { locales, sectionKeys } from "@/lib/site-data";
import { ROLES } from "@/lib/taxonomy";

export const dynamic = "force-static";

const siteUrl = "https://vansmithlab.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticEntries: MetadataRoute.Sitemap = locales.flatMap((locale) => [
    { url: `${siteUrl}/${locale}/`, changeFrequency: "weekly" as const, priority: 1 },
    { url: `${siteUrl}/${locale}/privacy`, changeFrequency: "yearly" as const, priority: 0.2 },
    ...sectionKeys.map((section) => ({
      url: `${siteUrl}/${locale}/${section}/`,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
    // Enumerated from the taxonomy, not hardcoded: a new role must not be able
    // to exist on the site and be missing from the sitemap. Roles with no
    // entries are left out — there is nothing there to index yet.
    ...ROLES.filter((role) => listContent(locale, `glossary/${role.route}`).length > 0).map((role) => ({
      url: `${siteUrl}/${locale}/glossary/${role.route}/`,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
  ]);

  const contentEntries: MetadataRoute.Sitemap = listContent().map((item) => ({
    url: `${siteUrl}/${item.locale}/${sectionForContentType(item.content_type)}/${item.slug}/`,
    lastModified: item.last_reviewed,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  return [...staticEntries, ...contentEntries];
}

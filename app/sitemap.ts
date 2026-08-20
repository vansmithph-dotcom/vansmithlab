import type { MetadataRoute } from "next";
import { contentHref, findTranslation, listContent } from "@/lib/content";
import { locales, sectionKeys } from "@/lib/site-data";
import { ROLES } from "@/lib/taxonomy";

export const dynamic = "force-static";

const siteUrl = "https://vansmithlab.com";
const localizedAlternates = (pathname: string) => ({
  languages: {
    ru: `${siteUrl}/ru${pathname}/`,
    en: `${siteUrl}/en${pathname}/`,
    "x-default": `${siteUrl}/ru${pathname}/`,
  },
});

export default function sitemap(): MetadataRoute.Sitemap {
  const staticEntries: MetadataRoute.Sitemap = locales.flatMap((locale) => [
    { url: `${siteUrl}/${locale}/`, changeFrequency: "weekly" as const, priority: 1, alternates: localizedAlternates("") },
    { url: `${siteUrl}/${locale}/about/`, changeFrequency: "yearly" as const, priority: 0.4, alternates: localizedAlternates("/about") },
    { url: `${siteUrl}/${locale}/privacy/`, changeFrequency: "yearly" as const, priority: 0.2, alternates: localizedAlternates("/privacy") },
    ...sectionKeys.map((section) => ({
      url: `${siteUrl}/${locale}/${section}/`,
      changeFrequency: "weekly" as const,
      priority: 0.6,
      alternates: localizedAlternates(`/${section}`),
    })),
    // Enumerated from the taxonomy, not hardcoded: a new role must not be able
    // to exist on the site and be missing from the sitemap. Roles with no
    // entries are left out — there is nothing there to index yet.
    ...ROLES.filter((role) => listContent(locale, `glossary/${role.route}`).length > 0).map((role) => ({
      url: `${siteUrl}/${locale}/glossary/${role.route}/`,
      changeFrequency: "weekly" as const,
      priority: 0.6,
      alternates: localizedAlternates(`/glossary/${role.route}`),
    })),
  ]);

  const contentEntries: MetadataRoute.Sitemap = listContent().map((item) => {
    const translation = findTranslation(item.content_id, item.locale === "ru" ? "en" : "ru");
    const current = `${siteUrl}${contentHref(item)}/`;
    const source = item.locale === "ru" ? current : (translation ? `${siteUrl}${contentHref(translation)}/` : current);
    return {
      url: current,
      lastModified: item.last_reviewed,
      changeFrequency: "monthly" as const,
      priority: 0.8,
      ...(item.hero_image ? { images: [`${siteUrl}${item.hero_image.src}`] } : {}),
      alternates: {
        languages: {
          [item.locale]: current,
          ...(translation ? { [translation.locale]: `${siteUrl}${contentHref(translation)}/` } : {}),
          "x-default": source,
        },
      },
    };
  });

  return [...staticEntries, ...contentEntries];
}

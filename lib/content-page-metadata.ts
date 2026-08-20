import type { Metadata } from "next";
import { contentHref, findTranslation, localeAlternates, type ContentMetadata } from "./content";
import type { Locale } from "./site-data";
import { siteUrl } from "./structured-data";

const absolutePage = (pathname: string) => `${siteUrl}${pathname.endsWith("/") ? pathname : `${pathname}/`}`;
const absoluteAsset = (pathname: string) => pathname.startsWith("http") ? pathname : `${siteUrl}${pathname}`;

export function contentPageMetadata(locale: Locale, section: string, metadata: ContentMetadata): Metadata {
  const canonicalPath = `/${locale}/${section}/${metadata.slug}/`;
  const translation = findTranslation(metadata.content_id, locale === "ru" ? "en" : "ru");
  const languagePaths = localeAlternates(locale, canonicalPath, translation);
  if (translation) languagePaths[translation.locale] = `${contentHref(translation)}/`;
  const languages = Object.fromEntries(Object.entries(languagePaths).map(([language, pathname]) => [language, absolutePage(pathname)]));
  const hero = metadata.hero_image;
  const images = hero ? [{
    url: absoluteAsset(hero.src),
    ...(hero.width ? { width: hero.width } : {}),
    ...(hero.height ? { height: hero.height } : {}),
    ...(hero.mime_type ? { type: hero.mime_type } : {}),
    alt: hero.alt,
  }] : undefined;
  const keywords = [...new Set([...(metadata.discipline ?? []), ...(metadata.categories ?? [])])];
  const authorUrl = `${siteUrl}/${locale}/about/`;

  return {
    title: metadata.title,
    description: metadata.summary,
    ...(keywords.length ? { keywords } : {}),
    authors: [{ name: metadata.author || "VANSMITHLAB", url: authorUrl }],
    alternates: { canonical: absolutePage(canonicalPath), languages },
    openGraph: {
      title: metadata.title,
      description: metadata.summary,
      type: "article",
      url: absolutePage(canonicalPath),
      siteName: "VANSMITHLAB",
      locale: locale === "ru" ? "ru_RU" : "en_US",
      alternateLocale: [locale === "ru" ? "en_US" : "ru_RU"],
      publishedTime: `${metadata.last_reviewed}T00:00:00Z`,
      modifiedTime: `${metadata.last_reviewed}T00:00:00Z`,
      authors: [authorUrl],
      images,
    },
    twitter: {
      card: "summary_large_image",
      title: metadata.title,
      description: metadata.summary,
      images: images?.map((image) => image.url),
    },
  };
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PublishedArticle } from "@/components/PublishedArticle";
import { findTranslation, getContent, listContent, localeAlternates } from "@/lib/content";
import { isLocale } from "@/lib/site-data";
import { ROLES, roleByRoute } from "@/lib/taxonomy";

const dynamicRoles = ROLES.filter((role) => !role.hasStaticPage);

export function generateStaticParams() {
  const params = dynamicRoles.flatMap((role) =>
    listContent(undefined, `glossary/${role.route}`).map((item) => ({
      locale: item.locale,
      role: role.route,
      slug: item.slug,
    }))
  );
  return params.length ? params : [{ locale: "ru", role: dynamicRoles[0].route, slug: "__empty" }];
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; role: string; slug: string }> }): Promise<Metadata> {
  const { locale, role, slug } = await params;
  const def = roleByRoute(role);
  if (!isLocale(locale) || !def) return {};
  const section = `glossary/${def.route}`;
  const content = getContent(locale, section, slug);
  if (!content) return {};
  const { title, summary, hero_image: heroImage, content_id: contentId } = content.metadata;
  const images = heroImage ? [{ url: heroImage.src, alt: heroImage.alt }] : undefined;
  const canonical = `/${locale}/${section}/${slug}`;
  const translation = findTranslation(contentId, locale === "ru" ? "en" : "ru");
  return {
    title,
    description: summary,
    alternates: { canonical, languages: localeAlternates(locale, canonical, translation) },
    openGraph: { title, description: summary, type: "article", images },
    twitter: { card: "summary_large_image", title, description: summary, images: images?.map((image) => image.url) },
  };
}

export default async function RoleProfilePage({ params }: { params: Promise<{ locale: string; role: string; slug: string }> }) {
  const { locale, role, slug } = await params;
  const def = roleByRoute(role);
  if (!isLocale(locale) || !def) notFound();
  const section = `glossary/${def.route}`;
  const content = getContent(locale, section, slug);
  if (!content) notFound();
  return <PublishedArticle locale={locale} section={section} content={content} />;
}

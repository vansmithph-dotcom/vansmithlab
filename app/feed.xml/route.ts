import { contentHref, listContent } from "@/lib/content";
import { siteUrl } from "@/lib/structured-data";

export const dynamic = "force-static";

const escapeXml = (value: string) => value.replace(/[<>&'"]/g, (character) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[character] ?? character);
const dateOnly = /^\d{4}-\d{2}-\d{2}$/;

function safePublicationDate(value: string, now: Date) {
  const candidate = dateOnly.test(value) ? new Date(`${value}T00:00:00Z`) : new Date(value);
  if (Number.isNaN(candidate.valueOf()) || candidate > now) return now;
  return candidate;
}

function mediaType(src: string, declared?: string) {
  if (declared) return declared;
  if (/\.png$/i.test(src)) return "image/png";
  if (/\.webp$/i.test(src)) return "image/webp";
  if (/\.svg$/i.test(src)) return "image/svg+xml";
  return "image/jpeg";
}

export function GET() {
  const now = new Date();
  const items = listContent()
    .filter((item) => item.state === "published" && item.hero_image?.src)
    .sort((a, b) => b.last_reviewed.localeCompare(a.last_reviewed))
    .slice(0, 200);
  const entries = items.map((item) => {
    const link = `${siteUrl}${contentHref(item)}/`;
    const hero = item.hero_image!;
    const image = `${siteUrl}${hero.src}`;
    const published = safePublicationDate(item.last_reviewed, now).toUTCString();
    const dimensions = [hero.width ? ` width="${hero.width}"` : "", hero.height ? ` height="${hero.height}"` : ""].join("");
    return `<item><title>${escapeXml(item.title)}</title><link>${escapeXml(link)}</link><guid isPermaLink="true">${escapeXml(link)}</guid><pubDate>${published}</pubDate><description>${escapeXml(item.summary)}</description><category>${escapeXml(item.content_type)}</category><dc:language>${item.locale}</dc:language><media:content url="${escapeXml(image)}" type="${mediaType(hero.src, hero.mime_type)}" medium="image"${dimensions}><media:title>${escapeXml(item.title)}</media:title><media:description>${escapeXml(hero.alt || item.summary)}</media:description><media:credit>${escapeXml(hero.credit || "VANSMITHLAB")}</media:credit></media:content></item>`;
  }).join("");
  const document = `<?xml version="1.0" encoding="utf-8"?><rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:media="http://search.yahoo.com/mrss/"><channel><title>VANSMITHLAB — new materials</title><link>${siteUrl}/</link><description>New bilingual materials from the VANSMITHLAB encyclopedia of design and visual culture.</description><language>ru</language><lastBuildDate>${now.toUTCString()}</lastBuildDate><atom:link href="${siteUrl}/feed.xml" rel="self" type="application/rss+xml"/>${entries}</channel></rss>`;
  return new Response(document, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
}

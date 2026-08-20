import { contentHref, listContent } from "@/lib/content";
import { siteUrl } from "@/lib/structured-data";

export const dynamic = "force-static";

const escapeXml = (value: string) => value.replace(/[<>&'"]/g, (character) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[character] ?? character);

export function GET() {
  const items = listContent().filter((item) => item.content_type === "collection").sort((a, b) => b.last_reviewed.localeCompare(a.last_reviewed));
  const entries = items.map((item) => `<entry><id>${siteUrl}${contentHref(item)}/</id><title>${escapeXml(item.title)}</title><link href="${siteUrl}${contentHref(item)}/"/><updated>${item.last_reviewed}T00:00:00Z</updated><summary>${escapeXml(item.summary)}</summary></entry>`).join("");
  const updated = items[0]?.last_reviewed ?? "2026-08-20";
  return new Response(`<?xml version="1.0" encoding="utf-8"?><feed xmlns="http://www.w3.org/2005/Atom"><id>${siteUrl}/collections.xml</id><title>VANSMITHLAB — collections</title><link href="${siteUrl}/collections.xml" rel="self"/><link href="${siteUrl}/ru/collections/"/><updated>${updated}T00:00:00Z</updated><author><name>VANSMITHLAB</name></author>${entries}</feed>`, { headers: { "Content-Type": "application/atom+xml; charset=utf-8" } });
}

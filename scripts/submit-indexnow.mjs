import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";

const siteOrigin = "https://vansmithlab.com";
const host = "vansmithlab.com";
const key = "17e04db05d20dcb60079513ae6146785";
const keyLocation = `${siteOrigin}/${key}.txt`;
const sitemapPath = new URL("../out/sitemap.xml", import.meta.url);
const keyPath = new URL(`../public/${key}.txt`, import.meta.url);
const dryRun = process.argv.includes("--dry-run");
const forceAll = process.argv.includes("--all");

if (!existsSync(sitemapPath)) {
  throw new Error("out/sitemap.xml is missing; build the static export before IndexNow submission");
}

if (!existsSync(keyPath) || readFileSync(keyPath, "utf8").trim() !== key) {
  throw new Error("IndexNow verification key file is missing or invalid");
}

const decodeXml = (value) =>
  value
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&apos;", "'");

const sitemapUrls = [...readFileSync(sitemapPath, "utf8").matchAll(/<loc>(.*?)<\/loc>/g)]
  .map((match) => decodeXml(match[1].trim()))
  .filter((url) => new URL(url).origin === siteOrigin);

const allUrls = [...new Set([`${siteOrigin}/`, ...sitemapUrls])];

function changedFiles() {
  try {
    return execFileSync("git", ["diff", "--name-only", "HEAD^", "HEAD"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    })
      .split(/\r?\n/)
      .map((file) => file.trim().replaceAll("\\", "/"))
      .filter(Boolean);
  } catch {
    return [];
  }
}

function urlsForRelease(files) {
  if (forceAll || files.length === 0) return allUrls;

  const globalChange = files.some((file) =>
    /^(app|components)\//.test(file) ||
    /^lib\/(content|site-data|site-metadata|structured-data|taxonomy)\.ts$/.test(file) ||
    /^public\/(?:icon\.svg|og\.png|17e04db05d20dcb60079513ae6146785\.txt)$/.test(file)
  );

  if (globalChange) return allUrls;

  const selected = new Set();
  for (const file of files) {
    const match = file.match(
      /^content\/(ru|en)\/(analysis|articles|encyclopedia|glossary\/[^/]+)\/([^/]+)\.(?:json|md)$/
    );
    if (!match) continue;

    const [, locale, section, slug] = match;
    selected.add(`${siteOrigin}/${locale}/`);
    selected.add(`${siteOrigin}/${locale}/${section}/`);
    selected.add(`${siteOrigin}/${locale}/${section}/${slug}/`);
  }

  return allUrls.filter((url) => selected.has(url));
}

const files = changedFiles();
const urlList = urlsForRelease(files);

if (urlList.length === 0) {
  console.log("IndexNow: no public URL changed in this release; submission skipped.");
  process.exit(0);
}

if (urlList.length > 10_000) {
  throw new Error(`IndexNow URL limit exceeded: ${urlList.length}`);
}

console.log(`IndexNow: prepared ${urlList.length} changed URL(s).`);

if (dryRun) {
  console.log(JSON.stringify({ host, keyLocation, urlCount: urlList.length, sample: urlList.slice(0, 5) }, null, 2));
  process.exit(0);
}

const response = await fetch("https://www.bing.com/indexnow", {
  method: "POST",
  headers: { "content-type": "application/json; charset=utf-8" },
  body: JSON.stringify({ host, key, keyLocation, urlList }),
});

if (response.status !== 200 && response.status !== 202) {
  const detail = (await response.text()).trim();
  let verificationQueued = false;

  if (response.status === 403 && detail.includes("SiteVerificationNotCompleted")) {
    const verificationUrl = new URL("https://www.bing.com/indexnow");
    verificationUrl.searchParams.set("url", `${siteOrigin}/`);
    verificationUrl.searchParams.set("key", key);
    verificationUrl.searchParams.set("keyLocation", keyLocation);
    const verification = await fetch(verificationUrl);

    if (verification.status === 200 || verification.status === 202) {
      console.log(
        `IndexNow: key verification queued with HTTP ${verification.status}; the next release will retry the URL batch.`
      );
      verificationQueued = true;
    }
  }

  if (!verificationQueued) {
    throw new Error(`IndexNow rejected the release (${response.status})${detail ? `: ${detail}` : ""}`);
  }
} else {
  console.log(`IndexNow: accepted with HTTP ${response.status}.`);
}

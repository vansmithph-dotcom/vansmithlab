function sourceUrl(value = "") {
  try {
    return new URL(value);
  } catch {
    return null;
  }
}

function normalizedHost(value = "") {
  return value.trim().toLocaleLowerCase().replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/$/, "");
}

export function sourceDisplayTitle(source) {
  const url = sourceUrl(source.url);
  const title = source.title?.trim() ?? "";
  if (!url) return title || source.url || "Source";

  const host = url.hostname.replace(/^www\./, "");
  const titleIsHost = !title || normalizedHost(title) === host.toLocaleLowerCase();
  if (!titleIsHost) return title;

  const segments = url.pathname
    .split("/")
    .filter(Boolean)
    .map((segment) => decodeURIComponent(segment).replace(/[-_]+/g, " "));
  if (segments[0] && /^(?:[a-z]{2}|eu)$/i.test(segments[0])) segments.shift();
  return segments.length ? `${host} — ${segments.join(" / ")}` : host;
}

export function sourceDisplayMeta(source) {
  return [source.publisher?.trim(), source.accessed_at?.trim()].filter(Boolean).join(" · ");
}

export function uniqueSourcesByUrl(sources) {
  const seen = new Set();
  return sources.filter((source) => {
    const rawUrl = source.url?.trim();
    let key = rawUrl?.replace(/\/$/, "") ?? "";
    if (rawUrl) {
      try {
        const parsed = new URL(rawUrl);
        parsed.protocol = parsed.protocol.toLocaleLowerCase();
        parsed.hostname = parsed.hostname.toLocaleLowerCase();
        if (parsed.pathname !== "/") parsed.pathname = parsed.pathname.replace(/\/+$/, "");
        key = parsed.toString();
      } catch {
        // Preserve the exact path casing for non-standard URLs too.
      }
    }
    if (!key || !seen.has(key)) {
      if (key) seen.add(key);
      return true;
    }
    return false;
  });
}

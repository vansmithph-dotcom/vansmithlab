#!/usr/bin/env python3
"""Convert the .docx article corpus into content/ + knowledge/sources.json.

Reads RU masters and their EN pairs, renders the body as markdown, mints the
metadata record `lib/content.ts` expects, and builds a deduplicated source
registry from the [SOURCE] blocks.

The release gate is evidence, per VANSMITHLAB_OS/06_CONTENT_MODEL.md: an article
becomes `published` when every source it cites carries a URL that can be checked,
and stays `drafted` otherwise — never because the prose looks finished.

An existing record is merged, not replaced: hero images and anything else the
converter does not derive from the .docx are carried over untouched.

Usage: python3 scripts/convert-docx.py <articles-dir> [--dry-run]
"""
import sys, os, re, json, hashlib, datetime
from docx import Document
from docx.oxml.ns import qn

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TODAY = datetime.date.today().isoformat()

# Taxonomy v2. A person is routed by their first role, everything else by kind.
# Keep in step with lib/taxonomy.ts.
ROLE_ROUTE = {
    "architect": "architects",
    "fashion-designer": "designers",
    "artist": "artists",
    "photographer": "photographers",
    "art-director": "art-directors",
    "graphic-designer": "graphic-designers",
    "fashion-editor": "fashion-editors",
    "stylist": "stylists",
    "curator": "curators",
    "industrial-designer": "industrial-designers",
    "interior-designer": "interior-designers",
    "illustrator": "illustrators",
    "critic-theorist": "critics-theorists",
}

KIND_ROUTE = {
    "organization": ("research", "articles"),
    "material-technique": ("encyclopedia", "encyclopedia"),
    "work": ("encyclopedia", "encyclopedia"),
    "movement-style": ("encyclopedia", "encyclopedia"),
    "place": ("encyclopedia", "encyclopedia"),
    "event-exhibition": ("encyclopedia", "encyclopedia"),
    "term": ("encyclopedia", "encyclopedia"),
    "theme": ("analysis", "analysis"),
}


def route_for(kind, roles):
    """Return (content_type, directory) for one article."""
    if kind == "person":
        role = roles[0] if roles else "architect"
        seg = ROLE_ROUTE.get(role, "people")
        # `designer_profile` predates the v2 split and stays the type for
        # fashion designers so existing content keeps its content_type.
        ctype = "designer_profile" if role == "fashion-designer" else f"{role.replace('-', '_')}_profile"
        return ctype, f"glossary/{seg}"
    return KIND_ROUTE[kind]

ALIAS = {
    "istoriya-modnogo-doma-armani": "istoriya-modnogo-doma-giorgio-armani",
    "istoriya-modnogo-doma-christian-dior": "christian-dior-istoriya-modnogo-doma",
    "istoriya-modnogo-doma-louis-vuitton": "louis-vuitton-istoriya-modnogo-doma",
    "kak-religiya-povliyala-na-modu": "kak-religiya-povliyala-na-mir-mody",
}

MARKER = re.compile(r"^\[[^\]]*\]$")

# Mirrors scripts/validate-sources.py: a source is checkable if it links out or,
# for print, states author, title, publisher and year.
_PLACEHOLDER = re.compile(r"to-be-added|tbd|TODO", re.I)
_YEAR = re.compile(r"\b(1[5-9]\d{2}|20[0-4]\d)\b")


def PRINT_OK(line):
    if _PLACEHOLDER.search(line):
        return False
    if re.search(r"\bISBN\b", line, re.I):
        return True
    parts = [p for p in re.split(r"\.\s+", line.strip(" .")) if p]
    return len(parts) >= 3 and bool(_YEAR.search(parts[-1]))

# Fields the converter derives from the .docx and may therefore overwrite.
# Anything else already present in a content record — hero_image above all — was
# produced elsewhere and is carried over untouched. Rewriting a record wholesale
# silently dropped 160 hero images once; it will not happen again.
OWNED = {
    "content_type", "source_locale", "source_revision", "locale", "slug",
    "title", "summary", "discipline", "kind", "role", "body_hash",
    "claim_ids", "source_ids", "last_reviewed", "author",
    "verification_state", "confidence_score", "state",
}


def existing_records(root):
    """Index every content record by (locale, slug), wherever it currently sits."""
    import glob
    found = {}
    for f in glob.glob(os.path.join(root, "content", "*", "*", "*.json")) + \
             glob.glob(os.path.join(root, "content", "*", "*", "*", "*.json")):
        try:
            o = json.load(open(f, encoding="utf-8"))
        except Exception:
            continue
        key = (o.get("locale"), o.get("slug"))
        if key[0] and key[1]:
            found[key] = (f, o)
    return found


def ptext(p):
    return "".join(n.text or "" for n in p._p.iter(qn("w:t")))


def paras(path):
    return [x for x in (ptext(p).strip() for p in Document(path).paragraphs) if x]


def block(t, tag):
    o = c = None
    for i, s in enumerate(t):
        if o is None and re.match(rf"\[{tag}\b", s):
            o = i
        elif o is not None and s == f"[/{tag}]":
            c = i
            break
    return (o, c) if o is not None and c is not None else (None, None)


def meta_of(t):
    line = next((s for s in t[:12] if s.startswith("slug:")), "")
    return {k.strip(): v.strip() for k, v in
            (c.split(":", 1) for c in line.split("|") if ":" in c)}


def parse_source(line):
    """Return (title, publisher, url, accessed) from either generation of entry."""
    if line.startswith("title:"):
        d = {k.strip(): v.strip() for k, v in
             (c.split(":", 1) for c in line.split("|") if ":" in c)}
        return d.get("title", ""), d.get("publisher", ""), d.get("url", ""), d.get("accessed", "")
    m = re.search(r"(https?://\S+)", line)
    url = m.group(1).rstrip(".,") if m else ""
    acc = ""
    a = re.search(r"Accessed\s+(\d{4}-\d{2}-\d{2})", line)
    if a:
        acc = a.group(1)
    head = line[:m.start()].strip() if m else line.strip()
    head = re.sub(r"\s*Accessed.*$", "", head).strip(" .")
    parts = [p.strip() for p in head.split(". ") if p.strip()]
    if len(parts) >= 2:
        return ". ".join(parts[:-1]), parts[-1], url, acc
    return head, "", url, acc


def parse_source_block(lines):
    """Parse a source entry written as key/value paragraphs.

    Newer DOCX files store Title, URL, Publisher and Accessed on separate
    paragraphs, while older files keep the whole citation on one line. Keep
    both formats accepted by the converter.
    """
    fields = {}
    for raw in lines:
        if ":" not in raw:
            continue
        key, value = raw.split(":", 1)
        fields[key.strip().lower()] = value.strip()
    if fields.get("url"):
        return fields.get("title", ""), fields.get("publisher", ""), fields["url"].rstrip(".,"), fields.get("accessed", "")
    return parse_source(lines[0] if lines else "")


def sid(url):
    return "src_" + hashlib.sha1(url.encode("utf-8")).hexdigest()[:16]


def render(t):
    """Markdown body: title, subtitle, lead, then each section. Sources are data."""
    out = []
    ho, hc = block(t, "HERO")
    if ho is not None:
        hero = t[ho + 1:hc]
        out.append(f"# {hero[0]}")
        if len(hero) > 1:
            sub = re.sub(r"(?i)^subtitle:\s*", "", hero[1])
            out.append(f"*{sub}*")
        if len(hero) > 2:
            out.append("> " + " ".join(hero[2:]).strip("«»"))

    i = 0
    while i < len(t):
        m = re.fullmatch(r'\[SECTION id="([^"]+)"\]', t[i])
        if not m:
            i += 1
            continue
        j = t.index("[/SECTION]", i)
        body = t[i + 1:j]
        if body:
            out.append(f"## {body[0]}")
            out.extend(p for p in body[1:] if not MARKER.match(p))
        i = j + 1
    return "\n\n".join(out).rstrip() + "\n"


def convert(path, registry, report):
    t = paras(path)
    m = meta_of(t)
    slug, lang = m.get("slug", ""), m.get("language", "ru")
    disciplines = [d.strip() for d in m.get("discipline", "").split(",") if d.strip()]
    kind = m.get("kind", "")
    roles = [r.strip() for r in m.get("role", "").split(",") if r.strip()]
    if not slug or not kind:
        report["skipped"].append((os.path.basename(path), "no slug or kind"))
        return None
    ctype, section = route_for(kind, roles)

    ho, hc = block(t, "HERO")
    hero = t[ho + 1:hc] if ho is not None else [slug]
    title = hero[0]
    summary = re.sub(r"(?i)^subtitle:\s*", "", hero[1]) if len(hero) > 1 else ""

    # sources
    so, sc = block(t, "SOURCES")
    src_ids, uncheckable, total_sources = [], 0, 0
    if so is not None:
        blk = t[so:sc]
        k = 0
        while k < len(blk):
            s = blk[k]
            if s.startswith("[SOURCE id=") and k + 1 < len(blk):
                total_sources += 1
                end = next((j for j in range(k + 1, len(blk)) if blk[j] == "[/SOURCE]"), k + 2)
                entry = blk[k + 1:end]
                title_s, pub, url, acc = parse_source_block(entry)
                k = end
                if not url:
                    # A printed citation carries its imprint instead of a link and
                    # is perfectly checkable; only an unfinished entry blocks release.
                    if not PRINT_OK(entry[0] if entry else ""):
                        uncheckable += 1
                    continue
                i = sid(url)
                if i not in registry:
                    registry[i] = {"id": i, "title": title_s, "url": url,
                                   "publisher": pub, "source_tier": 2,
                                   "accessed_at": acc or TODAY}
                if i not in src_ids:
                    src_ids.append(i)
                continue
            k += 1
    report["unlinked_sources"] += uncheckable

    # The release gate is evidence, per 06_CONTENT_MODEL.md: a page becomes
    # `published` when every source it cites can actually be checked. Prose that
    # merely looks finished does not qualify.
    citable = total_sources > 0 and uncheckable == 0
    if citable:
        report["publishable"].add(slug)

    body = render(t)
    return {
        "locale": lang,
        "section": section,
        "slug": slug,
        "body": body,
        "metadata": {
            "content_id": "cnt_" + hashlib.sha1(slug.encode()).hexdigest()[:16],
            "primary_object_id": "",
            "content_type": ctype,
            "state": "published" if citable else "drafted",
            "source_locale": "ru",
            "source_revision": int(m.get("source_revision", "1") or 1),
            "verification_state": "unverified",
            "confidence_score": 0.0,
            "claim_ids": [],
            "source_ids": src_ids,
            "last_reviewed": TODAY,
            "author": m.get("author", "VANSMITHLAB"),
            "locale": lang,
            "slug": slug,
            "title": title,
            "summary": summary,
            "discipline": disciplines,
            "kind": kind,
            "role": roles,
            "body_hash": hashlib.sha256(body.encode("utf-8")).hexdigest(),
        },
    }


def main():
    src = sys.argv[1]
    dry = "--dry-run" in sys.argv

    objects = {}
    objdir = os.path.join(ROOT, "knowledge", "objects")
    for f in os.listdir(objdir):
        if f.endswith(".json"):
            o = json.load(open(os.path.join(objdir, f), encoding="utf-8"))
            objects[ALIAS.get(o["slug_ru"], o["slug_ru"])] = o

    registry = {}
    registry_path = os.path.join(ROOT, "knowledge", "sources.json")
    if os.path.exists(registry_path):
        try:
            previous = json.load(open(registry_path, encoding="utf-8"))
            registry.update({s["id"]: s for s in previous.get("sources", []) if s.get("id") and s.get("url")})
        except (OSError, ValueError, KeyError):
            pass
    report = {"skipped": [], "unlinked_sources": 0, "written": 0,
              "no_object": [], "publishable": set()}
    docs = []
    for f in sorted(x for x in os.listdir(src) if x.endswith(".docx") and not x.startswith("~$")):
        d = convert(os.path.join(src, f), registry, report)
        if d:
            docs.append(d)

    prior = existing_records(ROOT)
    report["kept_images"] = 0

    for d in docs:
        obj = objects.get(d["slug"])
        if obj:
            d["metadata"]["primary_object_id"] = obj["id"]
            d["metadata"]["claim_ids"] = [c["id"] for c in obj.get("claims", [])]
            d["metadata"]["verification_state"] = obj.get("verification_state", "unverified")
            d["metadata"]["confidence_score"] = obj.get("confidence_score", 0.0)
        elif d["locale"] == "ru":
            report["no_object"].append(d["slug"])

        # ---- merge over the existing record rather than replacing it -----
        # Some articles were first published under a different slug. Falling back
        # to the alias keeps their hero image and their released state instead of
        # silently demoting a live page to a draft.
        old = prior.get((d["locale"], d["slug"]))
        if not old:
            for legacy, current in ALIAS.items():
                if current == d["slug"]:
                    old = prior.get((d["locale"], legacy))
                    if old:
                        break
        if old:
            _, o = old
            carried = {k: v for k, v in o.items() if k not in OWNED}
            if carried.get("hero_image"):
                report["kept_images"] += 1
            # An identifier is not derived from prose; regenerating it on every
            # run would break the RU/EN pairing that findTranslation relies on.
            d["metadata"] = {**d["metadata"], **carried}
            if not d["metadata"].get("primary_object_id"):
                d["metadata"]["primary_object_id"] = o.get("primary_object_id", "")
            # A page that has already passed the release gate stays published.
            if o.get("state") == "published":
                d["metadata"]["state"] = "published"

        if dry:
            continue
        out = os.path.join(ROOT, "content", d["locale"], d["section"])
        os.makedirs(out, exist_ok=True)
        with open(os.path.join(out, d["slug"] + ".md"), "w", encoding="utf-8") as fh:
            fh.write(d["body"])
        with open(os.path.join(out, d["slug"] + ".json"), "w", encoding="utf-8") as fh:
            json.dump(d["metadata"], fh, ensure_ascii=False, indent=2)
        report["written"] += 1

    # A slug that moved between sections leaves its old pair of files behind, and
    # the site would then list the same article twice. Routing is derived, so the
    # correct location is always recomputable: anything elsewhere is stale.
    import glob
    want = {(d["locale"], d["slug"]): d["section"] for d in docs}
    misplaced = []
    for f in glob.glob(os.path.join(ROOT, "content", "*", "*", "*.json")) + \
             glob.glob(os.path.join(ROOT, "content", "*", "*", "*", "*.json")):
        o = json.load(open(f, encoding="utf-8"))
        key = (o.get("locale"), o.get("slug"))
        if key not in want:
            continue
        here = os.path.dirname(f).split(os.sep + "content" + os.sep + o["locale"] + os.sep)[-1]
        here = here.replace(os.sep, "/")
        if here != want[key]:
            misplaced.append((f, here, want[key]))

    removed = failed = 0
    if misplaced and not dry:
        for f, _, _ in misplaced:
            for p in (f, f[:-5] + ".md"):
                try:
                    os.remove(p)
                    removed += 1
                except OSError:
                    failed += 1
        with open(os.path.join(ROOT, "work", "misplaced-content.txt"), "w", encoding="utf-8") as fh:
            for f, here, target in misplaced:
                fh.write(f"{os.path.relpath(f, ROOT)}\t{here} -> {target}\n")

    if not dry:
        with open(os.path.join(ROOT, "knowledge", "sources.json"), "w", encoding="utf-8") as fh:
            json.dump({"generated_at": TODAY, "count": len(registry),
                       "sources": sorted(registry.values(), key=lambda s: s["url"])},
                      fh, ensure_ascii=False, indent=2)
    if misplaced:
        print(f"stale records from an earlier routing: {len(misplaced)} "
              f"| files removed: {removed} | could not remove: {failed}")
        if failed:
            print("  list written to work/misplaced-content.txt")

    print(f"documents: {len(docs)} | files written: {report['written'] * 2}")
    print(f"published (all sources citable): {len(report['publishable'])} articles")
    print(f"distinct sources with a URL: {len(registry)}")
    print(f"[SOURCE] entries that are not checkable: {report['unlinked_sources']}")
    print(f"RU articles with no knowledge object: {len(report['no_object'])}")
    if report["skipped"]:
        print("skipped:", report["skipped"])


if __name__ == "__main__":
    main()

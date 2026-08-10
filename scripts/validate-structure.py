#!/usr/bin/env python3
"""Validate .docx articles against DOCX_SCHEMA.md.

Checks every rule the schema states: required marker blocks and their closers,
the ARTICLE_META key set and taxonomy v2 vocabulary, HERO shape, TOC/section
parity, sequential `sec-N` ids, a bookmark per section, working TOC anchors,
SEO fields, and RU/EN parity across the pair.

Exit code 1 if anything fails, so it can gate a commit or a build.

Usage: python3 scripts/validate-structure.py <articles-dir> [--report <dir>]
"""
import sys, os, re, csv, json, collections
from docx import Document
from docx.oxml.ns import qn

REQUIRED_BLOCKS = ["ARTICLE_META", "HERO", "TOC", "SOURCES", "SEO", "RELEASE_CHECKLIST"]
REQUIRED_SECTIONS = ["editorial-thesis", "reader-question", "short-answer"]
META_KEYS = ["slug", "language", "discipline", "kind",
             "author", "status", "source_revision", "layout_schema", "paired_document_id"]

DISCIPLINES = {"architecture", "fashion", "art", "photography",
               "graphic-design", "product-design", "interior-design", "media-publishing"}
KINDS = {"person", "organization", "material-technique", "work",
         "movement-style", "place", "event-exhibition", "term", "theme"}
ROLES = {"architect", "artist", "fashion-designer", "photographer", "art-director",
         "graphic-designer", "fashion-editor", "stylist", "curator",
         "industrial-designer", "interior-designer", "illustrator", "critic-theorist"}


def ptext(p):
    return "".join(n.text or "" for n in p._p.iter(qn("w:t")))


def parse_meta(line):
    return {k.strip(): v.strip() for k, v in
            (c.split(":", 1) for c in line.split("|") if ":" in c)}


def block(t, tag):
    o = c = None
    for i, s in enumerate(t):
        if o is None and re.match(rf"\[{tag}\b", s):
            o = i
        elif o is not None and s == f"[/{tag}]":
            c = i
            break
    return o, c


def check(path):
    name = os.path.basename(path)
    issues = []
    doc = Document(path)
    t = [x for x in (ptext(p).strip() for p in doc.paragraphs) if x]
    xml = doc.element.xml
    joined = "\n".join(t)

    for tag in REQUIRED_BLOCKS:
        if not re.search(rf"\[{tag}\b", joined):
            issues.append(f"missing [{tag}]")
        if f"[/{tag}]" not in t:
            issues.append(f"missing [/{tag}]")

    # --- meta ------------------------------------------------------------
    meta = {}
    mo, mc = block(t, "ARTICLE_META")
    if mo is not None and mc is not None and mc > mo + 1:
        meta = parse_meta(t[mo + 1])
        for k in META_KEYS:
            if k not in meta:
                issues.append(f"meta missing {k}")
        expected = "en" if name.endswith("_EN.docx") else "ru"
        if meta.get("language") not in (None, expected):
            issues.append(f"meta language={meta['language']}, filename says {expected}")
        if meta.get("layout_schema") not in (None, "v1"):
            issues.append(f"layout_schema={meta['layout_schema']}")
        for d in [x.strip() for x in meta.get("discipline", "").split(",") if x.strip()]:
            if d not in DISCIPLINES:
                issues.append(f"unknown discipline {d}")
        if meta.get("kind") and meta["kind"] not in KINDS:
            issues.append(f"unknown kind {meta['kind']}")
        roles = [x.strip() for x in meta.get("role", "").split(",") if x.strip()]
        for r in roles:
            if r not in ROLES:
                issues.append(f"unknown role {r}")
        if roles and meta.get("kind") != "person":
            issues.append(f"role set on kind={meta.get('kind')}")
        if meta.get("kind") == "person" and not roles:
            issues.append("kind=person without a role")

    # --- hero ------------------------------------------------------------
    ho, hc = block(t, "HERO")
    if ho is not None and hc is not None:
        hero = t[ho + 1:hc]
        if len(hero) < 3:
            issues.append(f"HERO has {len(hero)} lines, expected title + Subtitle + lead")
        elif not hero[1].lower().startswith("subtitle:"):
            issues.append("HERO line 2 is not 'Subtitle: …'")

    # --- sections, TOC, bookmarks ---------------------------------------
    sec_ids = re.findall(r'\[SECTION id="([^"]+)"\]', joined)
    numbered = [s for s in sec_ids if re.fullmatch(r"sec-\d+", s)]
    stale = [s for s in sec_ids if re.fullmatch(r"\d+(-.*)?", s)]
    if stale:
        issues.append(f"pre-v1 section ids: {', '.join(stale[:5])}")
    for req in REQUIRED_SECTIONS:
        if f'[SECTION id="{req}"]' not in t:
            issues.append(f"missing [SECTION id=\"{req}\"]")
    if numbered != [f"sec-{i}" for i in range(1, len(numbered) + 1)]:
        issues.append("sec-N ids are not sequential")
    if joined.count("[SECTION") != joined.count("[/SECTION]"):
        issues.append("unbalanced SECTION tags")

    to, tc = block(t, "TOC")
    if to is not None and tc is not None:
        entries = tc - to - 1
        if entries != len(numbered):
            issues.append(f"TOC has {entries} entries but {len(numbered)} sections")

    bookmarks = set(re.findall(r'w:bookmarkStart[^>]*w:name="([^"]+)"', xml))
    anchors = re.findall(r'w:hyperlink[^>]*w:anchor="([^"]+)"', xml)
    for s in numbered + REQUIRED_SECTIONS:
        if s not in bookmarks:
            issues.append(f"no bookmark for {s}")
            break
    dead = sorted(set(anchors) - bookmarks)
    if dead:
        issues.append(f"TOC links to missing bookmark: {', '.join(dead[:4])}")
    if len(anchors) < len(numbered):
        issues.append(f"only {len(anchors)} of {len(numbered)} TOC entries are links")

    # --- seo -------------------------------------------------------------
    so, sc = block(t, "SEO")
    if so is not None and sc is not None:
        seo = "\n".join(t[so + 1:sc])
        for key in ("meta_title", "meta_description", "keywords"):
            if not re.search(rf"^{key}:\s*\S", seo, re.M):
                issues.append(f"SEO missing {key}")

    return {"file": name, "slug": meta.get("slug", ""), "language": meta.get("language", ""),
            "kind": meta.get("kind", ""), "role": meta.get("role", ""),
            "sections": len(numbered), "issues": issues}


def main():
    src = sys.argv[1]
    out = sys.argv[sys.argv.index("--report") + 1] if "--report" in sys.argv else None

    rows = [check(os.path.join(src, f)) for f in sorted(os.listdir(src))
            if f.endswith(".docx") and not f.startswith("~$")]

    # RU/EN parity
    pairs = collections.defaultdict(dict)
    for r in rows:
        m = re.match(r"(.+)_(RU|EN)\.docx$", r["file"])
        if m:
            pairs[m.group(1)][m.group(2)] = r
    for stem, pair in sorted(pairs.items()):
        if len(pair) != 2:
            missing = "EN" if "EN" not in pair else "RU"
            pair[list(pair)[0]]["issues"].append(f"{missing} counterpart missing")
            continue
        ru, en = pair["RU"], pair["EN"]
        if ru["sections"] != en["sections"]:
            ru["issues"].append(f"RU has {ru['sections']} sections, EN has {en['sections']}")
        if ru["slug"] != en["slug"]:
            ru["issues"].append("slug differs between RU and EN")
        for axis in ("kind", "role"):
            if ru[axis] != en[axis]:
                ru["issues"].append(f"{axis} differs between RU and EN")

    failed = [r for r in rows if r["issues"]]
    if out:
        os.makedirs(out, exist_ok=True)
        with open(os.path.join(out, "structure-report.csv"), "w", newline="",
                  encoding="utf-8-sig") as fh:
            w = csv.writer(fh)
            w.writerow(["file", "slug", "language", "kind", "role", "sections", "issues"])
            for r in rows:
                w.writerow([r["file"], r["slug"], r["language"], r["kind"], r["role"],
                            r["sections"], "; ".join(r["issues"])])

    print(f"{len(rows)} files | conforming {len(rows) - len(failed)} | with issues {len(failed)}")
    if failed:
        freq = collections.Counter(re.sub(r"[:(].*", "", i).strip()
                                   for r in failed for i in r["issues"])
        print("\nissue frequency:")
        for k, v in freq.most_common():
            print(f"  {v:4}x {k}")
        print("\nfirst failures:")
        for r in failed[:10]:
            print(f"  {r['file']}: {'; '.join(r['issues'][:3])}")
        sys.exit(1)


if __name__ == "__main__":
    main()

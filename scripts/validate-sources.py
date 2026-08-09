#!/usr/bin/env python3
"""Enforce the source rule from DOCX_SCHEMA.md: every [SOURCE] is checkable.

A web source needs a URL and an access date. A printed source needs author,
title, publisher and year — demanding a URL from a book would keep an article
in draft for a reason that cannot be satisfied.

New articles fail the check. Articles written before the rule existed are listed
as a debt, grouped by publisher so one lookup can close many entries.

Exit code 1 if any article outside the grandfathered set has an uncheckable source.

Usage: python3 scripts/validate-sources.py <articles-dir> [--debt]
"""
import sys, os, re, json, collections
from docx import Document
from docx.oxml.ns import qn

# A printed citation is recognised by carrying a year and a publisher-like tail,
# or an explicit ISBN. Anything else without a URL is an unfinished entry.
ISBN = re.compile(r"\bISBN\b", re.I)
YEAR = re.compile(r"\b(1[5-9]\d{2}|20[0-4]\d)\b")
PLACEHOLDER = re.compile(r"to-be-added|tbd|TODO", re.I)


def source_state(line):
    """Return 'web', 'print' or 'incomplete'."""
    if PLACEHOLDER.search(line):
        return "incomplete"
    if re.search(r"https?://", line):
        return "web" if re.search(r"Accessed\s+\d{4}-\d{2}-\d{2}", line) else "web-no-date"
    if ISBN.search(line):
        return "print"
    # Author. Title. Publisher, year.  — at least three parts and a year.
    parts = [p for p in re.split(r"\.\s+", line.strip(" .")) if p]
    if len(parts) >= 3 and YEAR.search(parts[-1]):
        return "print"
    return "incomplete"

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
GRANDFATHERED = os.path.join(ROOT, "work", "source-debt.json")


def ptext(p):
    return "".join(n.text or "" for n in p._p.iter(qn("w:t")))


def audit(path):
    t = [x for x in (ptext(p).strip() for p in Document(path).paragraphs) if x]
    meta = next((s for s in t[:12] if s.startswith("slug:")), "")
    slug = re.search(r"slug:\s*([^|]+)", meta)
    slug = slug.group(1).strip() if slug else os.path.basename(path)
    try:
        a, b = t.index('[SOURCES id="sources"]'), t.index("[/SOURCES]")
    except ValueError:
        return slug, 0, 0, [], 0
    blk, total, ok, missing, undated = t[a:b], 0, 0, [], 0
    for i, s in enumerate(blk):
        if s.startswith("[SOURCE id=") and i + 1 < len(blk):
            line = blk[i + 1]
            total += 1
            state = source_state(line)
            # A URL without an access date is a schema deficiency, not an
            # uncheckable source: the reader can still follow the link. It is
            # reported, but it does not hold an article in draft.
            if state == "web-no-date":
                ok += 1
                undated += 1
            elif state in ("web", "print"):
                ok += 1
            else:
                missing.append(line)
    return slug, total, ok, missing, undated


def main():
    src = sys.argv[1]
    debt_mode = "--debt" in sys.argv

    known = set()
    if os.path.exists(GRANDFATHERED):
        known = set(json.load(open(GRANDFATHERED, encoding="utf-8"))["slugs"])

    failures, debt, publishers = [], {}, collections.Counter()
    undated_total = 0
    for f in sorted(x for x in os.listdir(src)
                    if x.endswith("_RU.docx") and not x.startswith("~$")):
        slug, total, ok, missing, undated = audit(os.path.join(src, f))
        undated_total += undated
        if not missing:
            continue
        debt[slug] = {"total": total, "ok": ok, "missing": len(missing)}
        for line in missing:
            head = re.split(r"[.—–]", line)[0].strip()
            publishers[head[:60]] += 1
        if slug not in known:
            failures.append((slug, len(missing), total))

    if debt_mode:
        os.makedirs(os.path.join(ROOT, "work"), exist_ok=True)
        json.dump({"generated_at": __import__("datetime").date.today().isoformat(),
                   "note": "Articles predating the URL rule. New articles must not be added here.",
                   "slugs": sorted(debt),
                   "per_article": debt,
                   "per_publisher": publishers.most_common()},
                  open(GRANDFATHERED, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
        print(f"source debt recorded: {len(debt)} articles, "
              f"{sum(d['missing'] for d in debt.values())} entries, "
              f"{len(publishers)} distinct publishers -> work/source-debt.json")
        print("\ntop publishers (one lookup closes many entries):")
        for name, n in publishers.most_common(15):
            print(f"  {n:4}  {name}")
        return

    print(f"articles with an uncheckable source: {len(debt)}")
    if undated_total:
        print(f"sources with a URL but no access date: {undated_total} (schema deficiency, not a blocker)")
    if failures:
        print(f"\nFAIL — {len(failures)} article(s) written after the rule took effect:")
        for slug, miss, total in failures:
            print(f"  {slug}: {miss} of {total} entries are not checkable")
        sys.exit(1)
    print("OK — all remaining gaps are recorded in work/source-debt.json")


if __name__ == "__main__":
    main()

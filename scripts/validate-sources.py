#!/usr/bin/env python3
"""Enforce the source rule from DOCX_SCHEMA.md: every [SOURCE] carries a URL.

New articles fail the check. The 89 articles written before the rule existed are
listed as a debt, grouped by publisher so one lookup can close many entries.

Exit code 1 if any article outside the grandfathered set is missing URLs.

Usage: python3 scripts/validate-sources.py <articles-dir> [--debt]
"""
import sys, os, re, json, collections
from docx import Document
from docx.oxml.ns import qn

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
        return slug, 0, 0, []
    blk, total, with_url, missing = t[a:b], 0, 0, []
    for i, s in enumerate(blk):
        if s.startswith("[SOURCE id=") and i + 1 < len(blk):
            line = blk[i + 1]
            total += 1
            if re.search(r"https?://", line):
                with_url += 1
            else:
                missing.append(line)
    return slug, total, with_url, missing


def main():
    src = sys.argv[1]
    debt_mode = "--debt" in sys.argv

    known = set()
    if os.path.exists(GRANDFATHERED):
        known = set(json.load(open(GRANDFATHERED, encoding="utf-8"))["slugs"])

    failures, debt, publishers = [], {}, collections.Counter()
    for f in sorted(x for x in os.listdir(src)
                    if x.endswith("_RU.docx") and not x.startswith("~$")):
        slug, total, with_url, missing = audit(os.path.join(src, f))
        if not missing:
            continue
        debt[slug] = {"total": total, "with_url": with_url, "missing": len(missing)}
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

    print(f"articles with sources missing a URL: {len(debt)}")
    if failures:
        print(f"\nFAIL — {len(failures)} article(s) written after the rule took effect:")
        for slug, miss, total in failures:
            print(f"  {slug}: {miss} of {total} entries have no URL")
        sys.exit(1)
    print("OK — all remaining gaps are recorded in work/source-debt.json")


if __name__ == "__main__":
    main()

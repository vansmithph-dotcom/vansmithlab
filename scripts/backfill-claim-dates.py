# -*- coding: utf-8 -*-
"""Backfill timeline date fields onto knowledge-object claims (P-001 C2).

For every claim it extracts years from the Russian wording and writes
`date_start`, `date_end` and `date_precision`. A single year is a point in time
(precision `year`); a second distinct year forms a period (`date_end`). The word
`около`/`примерно`/`circa`/`around` immediately before a year marks `circa`.

The date fields are additive and never overwrite a date an editor has already
set. Run from the repo root:
    python scripts/backfill-claim-dates.py [--dry-run]
"""
import json, glob, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OBJ_DIR = os.path.join(ROOT, "knowledge", "objects")

YEAR = re.compile(r"\b(?:18|19|20)\d{2}\b")
CIRCA = re.compile(r"(?:около|примерно|приблизительно|circa|around)\s+(\d{4})", re.IGNORECASE)


def extract_dates(wording: str):
    years = [int(y) for y in YEAR.findall(wording)]
    if not years:
        return None
    start = min(years)
    end = max(years)
    if end == start:
        end = None
    precision = "year"
    if CIRCA.search(wording):
        precision = "circa"
    return {
        "date_start": str(start),
        "date_end": str(end) if end else None,
        "date_precision": precision,
    }


def main():
    dry = "--dry-run" in sys.argv
    total = updated = already = 0
    for path in sorted(glob.glob(os.path.join(OBJ_DIR, "*.json"))):
        with open(path, encoding="utf-8") as fh:
            obj = json.load(fh)
        changed = False
        for claim in obj.get("claims", []):
            total += 1
            if claim.get("date_start"):
                already += 1
                continue
            dates = extract_dates(claim.get("wording_ru", ""))
            if not dates:
                continue
            claim.update(dates)
            changed = True
            updated += 1
        if changed and not dry:
            with open(path, "w", encoding="utf-8") as fh:
                json.dump(obj, fh, ensure_ascii=False, indent=2)
    print(f"claims: {total} | updated: {updated} | already dated: {already}")
    print("dry-run" if dry else "written")


if __name__ == "__main__":
    main()

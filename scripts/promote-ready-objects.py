#!/usr/bin/env python3
"""Promote only objectively release-ready knowledge objects.

This is deliberately conservative: an object is promoted only when every
claim is verified or multi_source_verified, confidence is at least 0.85, and
the object has sources and citations. Attributed, unverified, disputed, or
empty claim sets remain unchanged for editorial review.
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
changed = []
for path in sorted((ROOT / "knowledge" / "objects").glob("*.json")):
    data = json.loads(path.read_text(encoding="utf-8"))
    if data.get("verification_state") != "partially_verified":
        continue
    claims = data.get("claims") or []
    states = {claim.get("verification_state") for claim in claims}
    if not claims or not states.issubset({"verified", "multi_source_verified"}):
        continue
    if float(data.get("confidence_score", 0)) < 0.85:
        continue
    if not data.get("sources") or not data.get("citations"):
        continue
    data["verification_state"] = "multi_source_verified" if "multi_source_verified" in states else "verified"
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    changed.append(data.get("slug_ru", path.stem))
print(f"promoted: {len(changed)}")
for slug in changed:
    print(slug)

#!/usr/bin/env python3
"""Index VANSMITHLAB_OS for internal errors.

The OS is the source of truth for every other decision in the project, so a
document that points at a missing file, cites a stale count or contradicts its
own version header is a defect worth failing a build over.

Checks:
  links      — every `path.md` / `dir/file.md` reference resolves inside the OS
  code       — every `scripts/…`, `lib/…`, `schemas/…`, `app/…` path exists
  versions   — the title heading and the footer version line agree
  vocabulary — no document still uses a retired taxonomy term
  numbers    — counts cited about the corpus match the corpus
  orphans    — every OS document is reachable from 00_START_HERE.md or README.md

Exit code 1 if any error is found. Warnings do not fail the run.

Usage: python3 scripts/validate-os.py [--corpus <articles-dir>]
"""
import sys, os, re, json, collections

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OS_DIR = os.path.join(ROOT, "VANSMITHLAB_OS")

RETIRED_TERMS = {
    "photographers-art-directors": "taxonomy v1.1, retired by v2",
    "art-direction-graphic-design": "taxonomy v1.1, retired by v2",
    "`categories:`": "field retired by taxonomy v2",
    "layout_schema: v0": "never existed",
}

CODE_PREFIXES = ("scripts/", "lib/", "schemas/", "app/", "components/",
                 "knowledge/", "content/", "automation/", "database/", "tests/")


def os_files():
    out = []
    for base, _, names in os.walk(OS_DIR):
        for n in sorted(names):
            if n.endswith(".md"):
                out.append(os.path.join(base, n))
    return sorted(out)


def rel(p):
    return os.path.relpath(p, ROOT).replace(os.sep, "/")


def check():
    errors, warnings = [], []
    files = os_files()
    known = {os.path.relpath(f, OS_DIR).replace(os.sep, "/") for f in files}
    referenced = collections.defaultdict(set)

    for path in files:
        name = os.path.relpath(path, OS_DIR).replace(os.sep, "/")
        text = open(path, encoding="utf-8").read()

        # ---- references to other OS documents ---------------------------
        for m in re.finditer(r"`([A-Za-z0-9_./-]+\.md)`", text):
            target = m.group(1)
            if target.startswith(CODE_PREFIXES) or "/" in target and target.split("/")[0] in ("VANSMITHLAB_OS",):
                target = target.replace("VANSMITHLAB_OS/", "")
            cand = [target, os.path.join(os.path.dirname(name), target).replace(os.sep, "/")]
            cand = [c.replace("./", "") for c in cand]
            if not any(c in known for c in cand):
                if target.endswith(".md") and not target.startswith(CODE_PREFIXES):
                    errors.append(f"{name}: reference to missing document `{target}`")
            else:
                referenced[next(c for c in cand if c in known)].add(name)

        # ---- references to code paths -----------------------------------
        for m in re.finditer(r"`((?:" + "|".join(p.rstrip("/") for p in CODE_PREFIXES) + r")/[A-Za-z0-9_./*-]+)`", text):
            target = m.group(1)
            if "*" in target:
                continue
            if not os.path.exists(os.path.join(ROOT, target)):
                errors.append(f"{name}: reference to missing path `{target}`")

        # ---- version header vs footer -----------------------------------
        head = re.search(r"^#\s+.*?v(\d+\.\d+)\s*$", text, re.M)
        foot = re.search(r"^Version:\s*(\d+\.\d+)", text, re.M)
        if head and foot and head.group(1) != foot.group(1):
            errors.append(f"{name}: title says v{head.group(1)}, footer says {foot.group(1)}")

        # ---- retired vocabulary -----------------------------------------
        # A changelog or a superseded-proposal record is allowed to name the term
        # it retired; a live rule is not.
        for term, why in RETIRED_TERMS.items():
            if name.startswith("proposals/"):
                continue
            for line in text.splitlines():
                if term not in line:
                    continue
                if re.match(r"^\s*(Changes in|Supersedes|Status:|Version:|Note:)", line):
                    continue
                errors.append(f"{name}: uses retired term {term} ({why})")
                break

    # ---- README completeness --------------------------------------------
    # The index is the only way in for a reader who does not already know the
    # folder, so a document missing from it is effectively invisible.
    readme = os.path.join(OS_DIR, "README.md")
    if os.path.exists(readme):
        rd = open(readme, encoding="utf-8").read()
        for doc in sorted(known - {"README.md"}):
            if os.path.basename(doc) not in rd:
                errors.append(f"README.md: does not list `{doc}`")
    else:
        errors.append("README.md: missing")

    # ---- counts must agree between documents -----------------------------
    # Proposals record the state at the time they were written; only live rules
    # have to agree with each other and with the corpus.
    tables = {}
    for path in files:
        name = os.path.relpath(path, OS_DIR).replace(os.sep, "/")
        if name.startswith("proposals/"):
            continue
        for m in re.finditer(r"^\|\s*`([a-z-]+)`\s*\|.*?\|\s*(\d+)\s*\|\s*$",
                             open(path, encoding="utf-8").read(), re.M):
            tables.setdefault(m.group(1), {}).setdefault(name, m.group(2))
    for term, per_doc in tables.items():
        if len(set(per_doc.values())) > 1:
            detail = ", ".join(f"{d}={v}" for d, v in sorted(per_doc.items()))
            errors.append(f"count for `{term}` disagrees between documents: {detail}")

    # ---- the documented URL model must match the routes that exist --------
    ia = os.path.join(OS_DIR, "11_SITE_INFORMATION_ARCHITECTURE.md")
    app = os.path.join(ROOT, "app", "[locale]")
    if os.path.exists(ia) and os.path.isdir(app):
        actual = set()
        for base, _, names in os.walk(app):
            if "page.tsx" in names:
                r = os.path.relpath(base, app).replace(os.sep, "/")
                actual.add("/" + ("" if r == "." else r))
        for m in re.finditer(r"^/ru/(\S+)$", open(ia, encoding="utf-8").read(), re.M):
            documented = "/" + re.sub(r"\{(\w+)\}", r"[\1]", m.group(1).split("?")[0])
            if documented not in actual:
                errors.append(f"11_SITE_INFORMATION_ARCHITECTURE.md: documents route "
                              f"`/ru/{m.group(1)}` but `app/[locale]{documented}` has no page")

    # ---- orphans ---------------------------------------------------------
    entry = {"00_START_HERE.md", "README.md"}
    reachable = set(entry)
    frontier = set(entry)
    while frontier:
        nxt = set()
        for doc in frontier:
            for target, sources in referenced.items():
                if doc in sources and target not in reachable:
                    reachable.add(target)
                    nxt.add(target)
        frontier = nxt
    for doc in sorted(known - reachable):
        warnings.append(f"{doc}: not reachable from 00_START_HERE.md or README.md")

    return errors, warnings, files


def check_numbers(corpus_dir):
    """Counts cited in TAXONOMY.md must match the corpus they describe."""
    from docx import Document
    from docx.oxml.ns import qn

    def ptext(p):
        return "".join(n.text or "" for n in p._p.iter(qn("w:t")))

    disc, kind, role = collections.Counter(), collections.Counter(), collections.Counter()
    for f in sorted(x for x in os.listdir(corpus_dir)
                    if x.endswith("_RU.docx") and not x.startswith("~$")):
        t = [x for x in (ptext(p).strip() for p in Document(os.path.join(corpus_dir, f)).paragraphs) if x]
        line = next((s for s in t[:12] if s.startswith("slug:")), "")
        m = {k.strip(): v.strip() for k, v in (c.split(":", 1) for c in line.split("|") if ":" in c)}
        for d in [x.strip() for x in m.get("discipline", "").split(",") if x.strip()]:
            disc[d] += 1
        if m.get("kind"):
            kind[m["kind"]] += 1
        for r in [x.strip() for x in m.get("role", "").split(",") if x.strip()]:
            role[r] += 1

    text = open(os.path.join(OS_DIR, "TAXONOMY.md"), encoding="utf-8").read()
    errors = []
    for axis, counts in (("discipline", disc), ("kind", kind), ("role", role)):
        for term, actual in counts.items():
            m = re.search(rf"^\|\s*`{re.escape(term)}`\s*\|[^|]*\|(?:[^|]*\|)*?\s*(\d+)\s*\|\s*$",
                          text, re.M)
            if m and int(m.group(1)) != actual:
                errors.append(f"TAXONOMY.md: {axis} `{term}` says {m.group(1)}, corpus has {actual}")
    return errors


def main():
    errors, warnings, files = check()
    if "--corpus" in sys.argv:
        errors += check_numbers(sys.argv[sys.argv.index("--corpus") + 1])

    print(f"indexed {len(files)} documents in VANSMITHLAB_OS")
    if warnings:
        print(f"\nwarnings ({len(warnings)}):")
        for w in warnings:
            print(f"  {w}")
    if errors:
        print(f"\nERRORS ({len(errors)}):")
        for e in errors:
            print(f"  {e}")
        sys.exit(1)
    print("\nno errors")


if __name__ == "__main__":
    main()

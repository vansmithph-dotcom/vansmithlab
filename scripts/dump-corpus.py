#!/usr/bin/env python3
"""Dump the .docx article corpus into corpus.json for the relation builder.

Emits, per RU master: slug, title, the taxonomy v2 axes (discipline, kind, role),
and the body text with the [SOURCES] block removed — source titles otherwise
create false name matches against other articles.

Usage: python3 scripts/dump-corpus.py <articles-dir> <out-dir>
"""
import sys, os, re, json
from docx import Document
from docx.oxml.ns import qn


def ptext(p):
    return "".join(n.text or "" for n in p._p.iter(qn("w:t")))


def main():
    src, out = sys.argv[1], sys.argv[2]
    corpus = {}
    for f in sorted(x for x in os.listdir(src)
                    if x.endswith("_RU.docx") and not x.startswith("~$")):
        doc = Document(os.path.join(src, f))
        t = [x for x in (ptext(p).strip() for p in doc.paragraphs) if x]
        meta = next(s for s in t[:12] if s.startswith("slug:"))
        m = {k.strip(): v.strip() for k, v in
             (c.split(":", 1) for c in meta.split("|") if ":" in c)}
        slug = m["slug"]
        disciplines = [d.strip() for d in m.get("discipline", "").split(",") if d.strip()]
        roles = [r.strip() for r in m.get("role", "").split(",") if r.strip()]
        title = t[t.index("[HERO]") + 1]
        try:
            a, b = t.index('[SOURCES id="sources"]'), t.index("[/SOURCES]")
            body = t[:a] + t[b + 1:]
        except ValueError:
            body = t
        corpus[slug] = {"title": title, "discipline": disciplines,
                        "kind": m.get("kind", ""), "role": roles,
                        "file": f, "body": "\n".join(body)}
    os.makedirs(out, exist_ok=True)
    json.dump(corpus, open(os.path.join(out, "corpus.json"), "w", encoding="utf-8"),
              ensure_ascii=False)
    print(f"{len(corpus)} articles -> {os.path.join(out, 'corpus.json')}")


if __name__ == "__main__":
    main()

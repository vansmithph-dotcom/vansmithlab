# Author Expansion Handoff — resolution record

**Package:** `vansmithlab_author_expansion_handoff_2026-08-19`
**Recorded:** 2026-08-19
**Prior status:** `handoff_blocked_until_prepared_source_files_attached`
**Status now:** resolved — both gates satisfied

The package declared a hard rule — *"Do not rewrite prepared profiles;
import prepared source files first"* — and blocked itself because the 16
prepared profile DOCX files were not attached. Its own blocker text gave two
acceptable resolutions:

> Attach the 16 prepared author profile source files **or confirm they already
> exist in repo.**

The second applies. No profile was rewritten.

## Gate 1 — the 16 prepared profiles

All 16 exist in the repository, are `state: published`, have RU/EN pairs, and
render as live pages. Verified against
`indices/prepared_profiles_import_queue.csv`.

| # | Name | Repo slug |
|---|------|-----------|
| 1 | Phyllis Posnick | `phyllis-posnick-fashion-editor-image-construction` |
| 2 | Tonne Goodman | `tonne-goodman-fashion-editor-sustainability` |
| 3 | Camilla Nickerson | `camilla-nickerson-styling-character-fashion-image` |
| 4 | Lotta Volkova | `lotta-volkova-styling-subculture-fashion` |
| 5 | Charles & Ray Eames | `charles-ray-eames-design-process-media` |
| 6 | Ettore Sottsass | `ettore-sottsass-radical-design-memphis` |
| 7 | Andrée Putman | `andree-putman-interior-reduction-luxury` |
| 8 | Pierre Chareau | `pierre-chareau-maison-de-verre-interior` |
| 9 | David Downton | `david-downton-fashion-illustration-line` |
| 10 | Mats Gustafson | `mats-gustafson-fashion-illustration-watercolor` |
| 11 | Andrew Bolton | `andrew-bolton-costume-institute-fashion-curation` |
| 12 | Judith Clark | `judith-clark-fashion-exhibition-museology` |
| 13 | Claire Wilcox | `claire-wilcox-fashion-curation-victoria-albert` |
| 14 | Susan Sontag | `susan-sontag-photography-image-criticism` |
| 15 | Reyner Banham | `reyner-banham-technology-architecture-criticism` |
| 16 | Beatriz Colomina | `beatriz-colomina-architecture-media-publicity` |

Checks run: RU/EN pair present (16/16), `state: published` (16/16), live page in
static export (16/16).

## Gate 2 — the new wave

`indices/new_wave_author_queue.csv` lists 24 rows, of which one — Glenn Adamson
under `curation` — carries `duplicate_across_categories: True` and duplicates the
`theory` row. 23 distinct people.

All 23 were written and published as glossary profiles in commit `ea3ce29`,
under `content/{ru,en}/glossary/<role>/`. Verified: 23/23 present in both
locales.

The queue spells the last entry `zoe-ryan`; the Authors P1 package delivered it
as the mangled `zo-ryan`. The queue spelling was used.

## Note on the profiles as published

The Authors P1 source package was a skeleton — roughly four unique sentences per
author against 26 paragraphs of shared boilerplate. The 23 profiles were
therefore written, not revised. Because most of these people are living and the
package supplied no biographical material to verify against, they were written
as **method profiles** — working approach, what transfers and what does not, and
the substantive criticism of each position — rather than career chronologies
with unverifiable dates. Sources are the official and institutional URLs
supplied by the package.

This distinction matters if the profiles are later compared against the
"prepared" ones, which are conventional biographical entries.

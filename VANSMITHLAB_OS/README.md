# VANSMITHLAB OS

The active operating system for the VANSMITHLAB design encyclopedia. When any document outside this directory conflicts with one inside it, this directory wins.

## Read in this order

1. `00_START_HERE.md` — the routing table and the checks that gate a change
2. `01_PRODUCT_CHARTER.md`
3. `02_OPERATING_PRINCIPLES.md`
4. The work-specific document selected by the routing table
5. The matching playbook and template

## System map

| Area | Documents |
| --- | --- |
| Entry | `00_START_HERE.md` |
| Product and governance | `01_PRODUCT_CHARTER.md`, `02_OPERATING_PRINCIPLES.md`, `18_SCOPE_AND_GAP_ANALYSIS.md` |
| Knowledge and trust | `03_KNOWLEDGE_MODEL.md`, `04_DATA_ARCHITECTURE.md`, `05_EVIDENCE_POLICY.md`, `06_CONTENT_MODEL.md`, `20_ANALYSIS_EDITORIAL_STANDARD.md` |
| Taxonomy and authoring format | `TAXONOMY.md`, `DOCX_SCHEMA.md`, `GPT_ARTICLE_INSTRUCTIONS.md` |
| Language, media and AI | `07_LANGUAGE_SYSTEM.md`, `08_MEDIA_AND_RIGHTS.md`, `09_AI_OPERATING_MODEL.md`, `10_AUTOMATION_AND_ESCALATION.md`, `19_VISUAL_EDITORIAL_GUIDE.md` |
| Product experience | `11_SITE_INFORMATION_ARCHITECTURE.md`, `12_UX_UI_SYSTEM.md`, `13_PUBLICATION_AND_DISTRIBUTION.md` |
| Implementation | `14_TECHNICAL_DELIVERY.md`, `15_QUALITY_SECURITY_OPERATIONS.md`, `16_DELIVERY_ROADMAP.md` |
| External reference research | `17_REFERENCE_PATTERNS.md` |

## Playbooks

Exact repeatable paths from an idea to a result.

| File | Covers |
| --- | --- |
| `playbooks/01_RESEARCH_TO_OBJECT.md` | New knowledge object or glossary term |
| `playbooks/02_CONTENT_PRODUCTION.md` | Article, analysis, timeline, guide |
| `playbooks/03_MEDIA_PRODUCTION.md` | Image, gallery, video, diagram |
| `playbooks/04_LOCALIZATION.md` | Translation |
| `playbooks/05_AUTOMATION_RUN.md` | An AI automation run |
| `playbooks/06_PRODUCT_IMPLEMENTATION.md` | Site structure, UX, data, build, deployment |

## Templates

Required input and output forms.

| File | Used for |
| --- | --- |
| `templates/00_TASK_BRIEF.md` | Any task |
| `templates/01_CONTENT_BRIEF.md` | Commissioning content |
| `templates/02_MEDIA_BRIEF.md` | Commissioning media |
| `templates/03_REVIEW_REQUEST.md` | Escalating one of the six documented conditions to the user |
| `templates/04_IMPLEMENTATION_BRIEF.md` | Product or engineering work |

## Decisions

Architecture decision records. A decision recorded here is binding until superseded by another ADR.

| File | Decides |
| --- | --- |
| `decisions/ADR-001_AUTOMATION_ORCHESTRATION.md` | How automation runs are orchestrated |
| `decisions/ADR-002_LOCAL_SUBSCRIPTION_ORCHESTRATION.md` | Local subscription-based orchestration |
| `decisions/ADR-003_CLAIM_LEVEL_AUTO_REVISE.md` | Evidence repair, retry and blocking |
| `decisions/ADR-004_DRAFT_RESEARCH_INGEST.md` | Ingesting draft research |
| `decisions/ADR-005_DESIGNER_PROFILES_ROUTE.md` | The designer profile route |

## Proposals

Scoped documentation proposals raised under the non-negotiable rule in `00_START_HERE.md`. A proposal is not a rule until its status says so.

| File | Status |
| --- | --- |
| `proposals/P-001_KNOWLEDGE_GRAPH_CONNECTIONS.md` | Partially delivered — relation graph and corpus converter are live; terms, timeline, collections and analysis markers still open |
| `proposals/P-002_TAXONOMY_V2_FULL_DESIGN_FIELD.md` | Approved and applied; canonical text is `TAXONOMY.md` |

## Implementation notes

| File | Covers |
| --- | --- |
| `implementation/AUTOMATION_V1_BRIEF.md` | The first automation implementation |

## Open fix logs

| File | Covers |
| --- | --- |
| `work/EDUCATIONAL_P1_REQUIRED_FIXES.md` | Outstanding media-provenance fix required for the VSL_Educational_P1 package before its next update |

## Canonical rule

If an instruction is absent, do not improvise it inside a one-off article, image, workflow or component. Propose or create the missing OS rule first.

## Keeping this directory honest

`scripts/validate-os.py` indexes this folder for broken references, missing code paths, version headers that disagree with their footers, retired vocabulary, counts that contradict each other or the corpus, and documents missing from this index. Run it after any change here:

```bash
python3 scripts/validate-os.py --corpus "<articles-dir>"
```

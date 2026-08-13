# VANSMITHLAB OS — START HERE

Version: 1.0
Status: canonical operating system
Project root: `C:\Users\VAN\Documents\GitHub\vansmithlab`

## Purpose

VANSMITHLAB OS is the single operating system for an autonomous, bilingual encyclopedia of design and visual culture. It governs every decision from a raw idea through research, verification, writing, translation, visual production, website release, distribution, correction, and technical implementation.

The older `docs/` directory is a valuable source archive. This directory is the active source of truth. When documents conflict, **VANSMITHLAB_OS wins**.

## Non-negotiable rule

Before creating or changing a knowledge object, glossary entry, article, analysis, image, video, UI, schema, automation, code that serves content, or social publication:

1. Read this document.
2. Identify the work type.
3. Read the required documents in the routing table.
4. Create a brief from `templates/`.
5. Run the specified playbook.
6. Record the decision and source revision in the data layer.

If the required rule does not exist, the agent must create a scoped documentation proposal or a `review_request`; it must not silently invent a format, fact, visual rule, data field, or publication behaviour.

## Routing table

| Work | Read | Execute |
| --- | --- | --- |
| Any task | `01_PRODUCT_CHARTER.md`, `02_OPERATING_PRINCIPLES.md` | This file |
| New object or glossary term | `03_KNOWLEDGE_MODEL.md`, `04_DATA_ARCHITECTURE.md`, `05_EVIDENCE_POLICY.md` | `playbooks/01_RESEARCH_TO_OBJECT.md` |
| Assigning or changing a category | `TAXONOMY.md`, `03_KNOWLEDGE_MODEL.md`, `DOCX_SCHEMA.md` | `playbooks/02_CONTENT_PRODUCTION.md` |
| Writing or editing an article `.docx` | `DOCX_SCHEMA.md`, `TAXONOMY.md`, `05_EVIDENCE_POLICY.md` | `playbooks/02_CONTENT_PRODUCTION.md`, then the checks below |

## Checks

Reading this directory tells an agent what the rules are. It does not enforce them. These commands do, and they must pass before an article is considered done:

```bash
npm run os:index     -- --corpus "<articles-dir>"   # this directory is internally consistent
npm run os:structure -- "<articles-dir>"            # DOCX_SCHEMA.md compliance, RU/EN parity
npm run os:sources   -- "<articles-dir>"            # every [SOURCE] carries a URL
npm run os:convert   -- "<articles-dir>"            # rebuild content/ and knowledge/sources.json
npx tsc --noEmit                                    # the site still type-checks
```

`os:index` is the one to run after editing anything in this directory. It catches references to documents and code paths that do not exist, a title version that disagrees with its footer, retired vocabulary in a live rule, counts that contradict another document or the corpus, routes documented but not built, and any document missing from `README.md`.

`os:structure` and `os:sources` exit non-zero on failure, so they can gate a commit or a build. Nothing runs them automatically yet — wiring them into CI or a pre-commit hook is an open task.
| Article, timeline, guide (non-analysis) | `06_CONTENT_MODEL.md`, `05_EVIDENCE_POLICY.md`, `07_LANGUAGE_SYSTEM.md` | `playbooks/02_CONTENT_PRODUCTION.md` |
| Analysis / essay with an authorial argument | `20_ANALYSIS_EDITORIAL_STANDARD.md`, `06_CONTENT_MODEL.md`, `05_EVIDENCE_POLICY.md`, `07_LANGUAGE_SYSTEM.md`, `19_VISUAL_EDITORIAL_GUIDE.md` | `playbooks/02_CONTENT_PRODUCTION.md` |
| Image, gallery, video, diagram | `08_MEDIA_AND_RIGHTS.md`, `12_UX_UI_SYSTEM.md` | `playbooks/03_MEDIA_PRODUCTION.md` |
| Translation | `07_LANGUAGE_SYSTEM.md` | `playbooks/04_LOCALIZATION.md` |
| AI automation | `09_AI_OPERATING_MODEL.md`, `10_AUTOMATION_AND_ESCALATION.md` | `playbooks/05_AUTOMATION_RUN.md` |
| Site structure, UX or UI | `11_SITE_INFORMATION_ARCHITECTURE.md`, `12_UX_UI_SYSTEM.md` | `playbooks/06_PRODUCT_IMPLEMENTATION.md` |
| Data, API, build, deployment | `04_DATA_ARCHITECTURE.md`, `14_TECHNICAL_DELIVERY.md`, `15_QUALITY_SECURITY_OPERATIONS.md` | `playbooks/06_PRODUCT_IMPLEMENTATION.md` |

For local subscription-based automation, also read `decisions/ADR-002_LOCAL_SUBSCRIPTION_ORCHESTRATION.md`. For evidence repair, retry and blocking decisions, read `decisions/ADR-003_CLAIM_LEVEL_AUTO_REVISE.md`.

## Canonical flow

```text
Idea → brief → research → claims + evidence → verified knowledge object
→ content / media → Russian release → English adaptation → other locales
→ site, search, graph, distribution → monitoring, corrections, updates
```

No downstream item may introduce a new factual claim. It must first be added, cited, and verified in the knowledge object.

## User involvement

The system works autonomously by default. It requests the user's judgment only for one of the six documented conditions in `10_AUTOMATION_AND_ESCALATION.md`: evidence conflict, missing primary evidence, rights/brand risk, genuine editorial choice, high-impact correction, or unresolved translation.

## Current state of the build

The Next.js application exists and type-checks. As of 2026-08-09 the site renders 112 article pairs converted from the `.docx` corpus, an editorial relation graph in `knowledge/relations.json`, and a glossary split by person role. Follow the phases in `16_DELIVERY_ROADMAP.md`; do not begin with social automation or an interactive graph.

Two known debts are recorded rather than hidden:

- **Sources.** 808 of 1,137 `[SOURCE]` entries carry no URL, so 83 articles cannot pass the evidence gate and remain `drafted`. The list, grouped by publisher, is in `work/source-debt.json`.
- **Enforcement.** The checks below exist but nothing runs them automatically. Wiring them into CI or a pre-commit hook is open.

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
| Article, analysis, timeline, guide | `06_CONTENT_MODEL.md`, `05_EVIDENCE_POLICY.md`, `07_LANGUAGE_SYSTEM.md` | `playbooks/02_CONTENT_PRODUCTION.md` |
| Image, gallery, video, diagram | `08_MEDIA_AND_RIGHTS.md`, `12_UX_UI_SYSTEM.md` | `playbooks/03_MEDIA_PRODUCTION.md` |
| Translation | `07_LANGUAGE_SYSTEM.md` | `playbooks/04_LOCALIZATION.md` |
| AI automation | `09_AI_OPERATING_MODEL.md`, `10_AUTOMATION_AND_ESCALATION.md` | `playbooks/05_AUTOMATION_RUN.md` |
| Site structure, UX or UI | `11_SITE_INFORMATION_ARCHITECTURE.md`, `12_UX_UI_SYSTEM.md` | `playbooks/06_PRODUCT_IMPLEMENTATION.md` |
| Data, API, build, deployment | `04_DATA_ARCHITECTURE.md`, `14_TECHNICAL_DELIVERY.md`, `15_QUALITY_SECURITY_OPERATIONS.md` | `playbooks/06_PRODUCT_IMPLEMENTATION.md` |

## Canonical flow

```text
Idea → brief → research → claims + evidence → verified knowledge object
→ content / media → Russian release → English adaptation → other locales
→ site, search, graph, distribution → monitoring, corrections, updates
```

No downstream item may introduce a new factual claim. It must first be added, cited, and verified in the knowledge object.

## User involvement

The system works autonomously by default. It requests the user's judgment only for one of the six documented conditions in `10_AUTOMATION_AND_ESCALATION.md`: evidence conflict, missing primary evidence, rights/brand risk, genuine editorial choice, high-impact correction, or unresolved translation.

## First implementation action

The current repository has deleted Next.js root files. Restore the application skeleton before writing product code. Then follow the phases in `16_DELIVERY_ROADMAP.md`; do not begin with social automation or an interactive graph.

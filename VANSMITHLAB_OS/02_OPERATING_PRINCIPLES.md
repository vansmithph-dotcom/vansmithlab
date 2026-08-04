# Operating Principles and Decision Rules

## Principles

1. **Knowledge before content.** Create or update an object before publishing its representation.
2. **Evidence before fluency.** A good sentence is not a verified sentence.
3. **Russian master first.** All evidence, claims and editorial decisions originate in Russian; translations derive from an approved revision.
4. **One source of truth per data type.** Rules live in OS, facts in the knowledge database, approved bodies in content files, assets in media storage.
5. **Autonomy with accountability.** AI executes routine work, but every material decision is logged, reproducible and reversible.
6. **Faceless institution, attributable argument.** Neutral knowledge is institutional; analytical opinion is signed.
7. **Progressive disclosure.** Page surfaces reveal an answer first, then depth, citations and graph context.
8. **Correction is a feature.** Retraction and uncertainty are more trustworthy than silent edits.
9. **Accessibility and rights are release requirements.** They are not post-publication cleanup.
10. **Prefer a smaller correct system.** Do not automate or visualise a feature before the underlying data is stable.

## Decision hierarchy

1. `00_START_HERE.md`
2. Product Charter and this document
3. Specialized OS document
4. Playbook
5. Template
6. Brief, workflow run, or implementation detail

## Required states

Every relevant entity uses a documented state rather than an ambiguous “done”:

`idea → researching → evidence_ready → drafting → validating → localized → media_ready → published → monitoring`

Alternate terminal/holding states: `blocked`, `needs_user_input`, `retracted`, `archived`.

## What must be logged

- source collection and verification result;
- AI provider/model, template version, input/output hashes and workflow run;
- publication and translation source revisions;
- rights check for media;
- automatic decision, correction or user escalation;
- before/after version history for material changes.

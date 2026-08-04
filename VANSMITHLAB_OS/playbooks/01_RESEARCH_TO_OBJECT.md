# Playbook 01 — Idea to Verified Knowledge Object

## Input

Completed `templates/00_TASK_BRIEF.md` with a question, target object/term, scope, audience and initial source leads.

## Procedure

1. Read the routing documents in `00_START_HERE.md`.
2. Match against existing objects, aliases and glossary to prevent duplicates.
3. Create a draft object ID and controlled object type.
4. Collect sources; capture required metadata and snapshot/hash where permitted.
5. Extract atomic claims. Do not write the article first.
6. Attach citations to each material claim; score evidence, independence and conflicts.
7. Create relation candidates and timeline events only from claims.
8. Run verification gate.
9. If threshold passes, set `evidence_ready`; otherwise auto-revise, block or create an allowed review request.
10. Record revision, workflow run, decision and audit event.

## Output

A versioned Russian knowledge object, claim ledger, source/citation set, relationships and decision. It may be used by content production only when its state is `evidence_ready` or later.

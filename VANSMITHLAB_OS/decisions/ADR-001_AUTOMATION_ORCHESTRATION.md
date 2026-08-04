# ADR-001 — Automation orchestration

Status: accepted

## Decision

The first production automation uses GitHub Actions as the observable scheduler and release coordinator. Cloudflare remains the delivery platform. Figma Weave (formerly Weavy.ai) is a visual workflow tool and receives only approved media briefs; it is not the canonical database or the authority that approves evidence.

## Why

- The repository and Cloudflare deployment are already connected.
- Runs, commits, failures and rollback targets remain visible and reproducible.
- Provider secrets can live in GitHub Actions secrets rather than content or browser code.
- A failed AI step cannot replace the last valid public build.
- Visual generation remains separated from documentary evidence and rights approval.

## Release path

`request → AI research/audit/draft/localization → deterministic validation → approved Markdown + knowledge record → Git commit → Cloudflare build`.

The workflow does not commit when the decision is `BLOCKED`, `NEEDS_USER_INPUT`, or `DO_NOT_PUBLISH`.

## Rollback

Disable `.github/workflows/content-automation.yml`, revoke provider secrets, and revert the generated content commit. The previous Cloudflare deployment remains available.

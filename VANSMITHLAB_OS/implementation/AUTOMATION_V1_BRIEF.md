# Implementation Brief — Content automation v1

```yaml
feature_id: automation_content_v1
affected_pages: [encyclopedia, glossary, articles, analysis]
affected_data_domains: [knowledge_objects, claims, sources, citations, content_localizations, workflow_runs, review_requests]
affected_locales: [ru, en]
rollback_strategy: disable workflow and revert generated release commit
```

## User problem and OS rule

VANSMITHLAB needs repeatable article production without manually moving text between ChatGPT, Claude, Gemini and the website. The pipeline must enforce knowledge-before-content, Russian-master lineage and the evidence threshold in documents 02, 05, 07, 09 and 10.

## Intended journey

An idea is added as a JSON request or supplied to a manual GitHub Actions run. The system researches, audits, drafts, localizes and validates it. Passing releases are committed and Cloudflare deploys them. An allowed uncertainty creates a review request instead.

## Data ownership and validation

Version 1 stores portable knowledge/release JSON and approved Markdown in Git while the D1 schema is prepared. The public build reads only validated Markdown. D1 becomes the durable runtime store when migrations are deployed; the file contracts remain import/export and disaster-recovery formats.

## UX/UI states

- Loading: existing public release remains visible during a run.
- Empty: section page explains that no verified item exists.
- Error: workflow records failure; no public replacement occurs.
- Small screen: generated pages follow the existing responsive article layout.
- Keyboard/screen reader: semantic headings, source links and trust metadata remain available.

## Acceptance criteria and tests

- Schema rejects missing sources, claim links, confidence, lineage and unsupported states.
- No model approves its own research output.
- Russian master is generated and validated before English.
- Only `AUTO_APPROVE` writes publishable content.
- Provider keys are read only from secret environment variables.
- Lint and production build succeed with generated content.

# Data Architecture

## Data ownership

| Layer | Canonical store | Owns |
| --- | --- | --- |
| Operating rules | Git / `VANSMITHLAB_OS` | Policy, schema, prompts, playbooks |
| Approved editorial body | Git / `content` | Markdown and frontmatter of released localizations |
| Knowledge database | Cloudflare D1 | objects, claims, sources, citations, relations, translations, state, audit |
| Media archive | Cloudflare R2 | originals, derivatives, provenance and rights references |
| Execution state | Cloudflare Queues + KV | jobs, retries, locks, caches and idempotency |
| Read models | generated | pages, search index, graph, sitemap, JSON-LD, distribution packages |

## Minimum D1 domains

`knowledge_objects`, `object_localizations`, `claims`, `claim_localizations`, `sources`, `source_snapshots`, `citations`, `contradictions`, `relations`, `timeline_events`, `content_items`, `content_localizations`, `content_claims`, `media_assets`, `rights_records`, `media_derivatives`, `workflow_runs`, `agent_runs`, `validation_runs`, `decision_records`, `review_requests`, `audit_log`.

## Integrity rules

- An object ID never changes; a localized slug may change with redirect history.
- A published factual item references claims; a claim references evidence.
- A localization records the exact source revision from which it was derived.
- A media asset cannot release without origin, credit/attribution where required, rights state and accessible text.
- A fact-based graph edge needs a claim and confidence.
- Jobs carry an idempotency key; retrying can never create a duplicate object, release or post.
- Deletion means archive or retract; audit and evidence remain.

## Read/write separation

AI and editorial workflows write only to draft/controlled tables. The public site reads generated projections from approved revisions. A failed build leaves the previous validated public projection intact.

## Essential indexes

- unique object ID, object type + localized slug;
- claim by object and verification state;
- citation by claim and source;
- relation from/to object and relation type;
- content by state, locale and primary object;
- translation by locale + stale state;
- workflow by entity, state and idempotency key;
- review request by state and priority.

# Contributing to VANSMITHLAB

Thank you for your interest in VANSMITHLAB.

The project is in active early development. Contributions are welcome, but changes to the knowledge system must preserve source provenance, bilingual consistency and the project's editorial rules.

## Good first contribution areas

Useful contributions include:

- bug fixes;
- accessibility improvements;
- performance improvements;
- test coverage;
- build and deployment fixes;
- developer documentation;
- schema validation;
- broken-link detection;
- search improvements;
- QA and publishing automation.

Editorial contributions are possible, but require stricter review because they affect the public knowledge base.

## Before changing anything

Read:

1. [`VANSMITHLAB_OS/00_START_HERE.md`](./VANSMITHLAB_OS/00_START_HERE.md)
2. [`VANSMITHLAB_OS/05_EVIDENCE_POLICY.md`](./VANSMITHLAB_OS/05_EVIDENCE_POLICY.md)
3. [`VANSMITHLAB_OS/09_AI_OPERATING_MODEL.md`](./VANSMITHLAB_OS/09_AI_OPERATING_MODEL.md)
4. [`VANSMITHLAB_OS/10_AUTOMATION_AND_ESCALATION.md`](./VANSMITHLAB_OS/10_AUTOMATION_AND_ESCALATION.md)

These documents are the source of truth for repository-wide editorial and automation behavior.

## Development

```bash
npm install
npm run dev
```

Before submitting a change, run the checks that apply to your work:

```bash
npm test
npm run lint
npm run content:validate
npm run audit:site
npm run audit:seo
```

For operating-system and knowledge-structure changes, also run the relevant `os:*` validation commands defined in `package.json`.

## Pull requests

Keep pull requests focused.

Please include:

- what changed;
- why the change is needed;
- which checks were run;
- whether content, metadata, sources or routes were affected;
- screenshots for visible UI changes where useful.

Do not mix unrelated cleanup with a functional change.

## Editorial and research rules

Do not:

- invent citations;
- mark claims verified without evidence;
- remove provenance to simplify a content object;
- silently break RU/EN pairing;
- copy copyrighted third-party text into the project;
- publish AI-generated factual claims without the required verification path.

AI-assisted contributions are allowed, but the contributor remains responsible for the accuracy, licensing and reviewability of the result.

## Licensing

By contributing software code, you agree that your contribution may be distributed under the repository's MIT License.

Editorial and visual contributions require explicit licensing or permission appropriate to the submitted material.

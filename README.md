# VANSMITHLAB

**VANSMITHLAB is an independent bilingual knowledge system and encyclopedia of design and visual culture.**

It connects design history, photography, fashion, architecture, interiors, objects, materials, typography, technology and AI into a structured RU/EN research environment with source provenance, editorial rules, validation and automated quality checks.

**Live site:** https://vansmithlab.com/  
**Russian master:** https://vansmithlab.com/ru/  
**English edition:** https://vansmithlab.com/en/

> VANSMITHLAB is an early-stage, independently maintained public project. It is being developed in the open and is growing rapidly, with more than 1,000 generated RU/EN pages as of August 2026.

## Why this project exists

High-quality knowledge about design and visual culture is fragmented across museum archives, academic publications, commercial media, books and specialist websites. For Russian-speaking and Central Asian students and creative professionals, access is even more fragmented.

VANSMITHLAB is an attempt to build a durable public knowledge layer rather than a collection of isolated articles.

The project focuses on:

- bilingual Russian/English publishing;
- traceable sources and claim provenance;
- structured relationships between people, objects, movements, materials, technologies and events;
- editorial analysis alongside encyclopedic reference material;
- consistent metadata and internal linking;
- validation and QA before publication;
- AI-assisted workflows with explicit human editorial control.

## What makes VANSMITHLAB different

VANSMITHLAB treats editorial content as structured knowledge.

A published item can be connected to:

- source records;
- claims and verification state;
- timeline events;
- related knowledge objects;
- glossary profiles;
- collections and editorial routes;
- bilingual content pairs;
- publication and review metadata.

The goal is to make the system useful not only for reading, but also for research, teaching, editorial work and future machine-readable knowledge applications.

## Current status

VANSMITHLAB launched publicly in August 2026 and is under active development.

The current repository contains:

- a bilingual Next.js static site;
- a growing RU/EN content corpus;
- publishing and validation scripts;
- site and SEO audit tooling;
- editorial automation;
- project-wide operating rules in [`VANSMITHLAB_OS/`](./VANSMITHLAB_OS/);
- AI-agent instructions for Claude, Codex, Gemini and other development tools.

The project is maintained primarily by one independent creator, so automation and strong quality gates are essential to keeping a large bilingual corpus consistent.

## AI-assisted, evidence-constrained workflow

AI is used as a development and editorial tool, not as a substitute for provenance.

The project includes explicit rules for:

- evidence and source quality;
- claim verification;
- bilingual synchronization;
- duplicate-content detection;
- schema and metadata validation;
- escalation when automated checks fail;
- preventing fabricated citations or unsupported verification states.

Claude is already used in the development workflow for code maintenance, publishing automation, QA, search improvements, refactoring and security fixes.

See [`CLAUDE.md`](./CLAUDE.md) and [`VANSMITHLAB_OS/`](./VANSMITHLAB_OS/) for the active operating model.

## Architecture

The public site is a static Next.js export.

```text
app/                  Next.js application
content/              RU/EN editorial and knowledge content
public/               Public static assets
scripts/              Build, publishing, QA and automation tools
tests/                Automated tests
VANSMITHLAB_OS/       Product, editorial, evidence and automation rules
CLAUDE.md              Claude-specific operating instructions
AGENTS.md              General agent instructions
```

## Local development

Requirements:

- Node.js 20.9+
- npm

Install dependencies and start development:

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
```

The project uses a static export suitable for deployment to Cloudflare Pages.

## Quality checks

Useful project commands include:

```bash
npm test
npm run lint
npm run content:validate
npm run audit:site
npm run audit:seo
npm run os:structure
npm run os:sources
npm run os:index
```

Exact requirements for content and automation changes are defined in [`VANSMITHLAB_OS/00_START_HERE.md`](./VANSMITHLAB_OS/00_START_HERE.md).

## Contributing

VANSMITHLAB is still early and its contribution model is intentionally conservative while the knowledge architecture stabilizes.

Bug reports, documentation improvements, accessibility fixes, build improvements, QA tooling and carefully scoped code contributions are welcome.

Before contributing, read [`CONTRIBUTING.md`](./CONTRIBUTING.md).

## Licensing

The **software source code** in this repository is available under the MIT License. See [`LICENSE`](./LICENSE).

Editorial texts, research content, original images, commissioned visuals, trademarks and other creative assets are **not automatically covered by the MIT License**. See [`CONTENT_LICENSE.md`](./CONTENT_LICENSE.md) for the current scope.

This separation keeps the software genuinely open source without unintentionally relicensing authored editorial or visual work.

## Project links

- Website: https://vansmithlab.com/
- GitHub: https://github.com/vansmithph-dotcom/vansmithlab

\# Folder Structure

Version: 1.0



\## Purpose



This document defines the complete directory structure of VAN SMITH LAB.



Every directory has a single responsibility.



The directory structure must remain predictable, scalable and easy to navigate.



\---



\## Principles



The folder structure shall be:



\- Modular

\- Consistent

\- Scalable

\- Human-readable

\- AI-friendly



Files should always be stored in their logical location.



\---



\# Project Structure



/

│

├── docs/

├── architecture/

├── implementation/

│

├── src/

├── content/

├── assets/

├── public/

├── config/

├── scripts/

├── data/

├── ai/

├── search/

├── tests/

│

├── .github/

│

├── package.json

├── tsconfig.json

├── next.config.ts

├── tailwind.config.ts

├── eslint.config.js

├── .gitignore

├── .editorconfig

└── README.md



\---



\# Source Code



src/



Contains application source code only.



Example:



src/



&#x20;   app/



&#x20;   components/



&#x20;   layouts/



&#x20;   modules/



&#x20;   hooks/



&#x20;   lib/



&#x20;   services/



&#x20;   styles/



&#x20;   types/



&#x20;   utils/



\---



\# Content



content/



Contains all editorial content.



Nothing inside this directory is generated.



\---



\## Knowledge



content/



&#x20;   knowledge/



&#x20;       brands/



&#x20;       people/



&#x20;       companies/



&#x20;       products/



&#x20;       collections/



&#x20;       campaigns/



&#x20;       technologies/



&#x20;       materials/



&#x20;       ai-models/



&#x20;       software/



&#x20;       equipment/



&#x20;       buildings/



&#x20;       places/



\---



\## Editorial



content/



&#x20;   research/



&#x20;   editorials/



&#x20;   comparisons/



&#x20;   guides/



&#x20;   references/



&#x20;   glossary/



\---



\## Media Content



content/



&#x20;   galleries/



&#x20;   videos/



&#x20;   timelines/



&#x20;   collections/



\---



\## Shared Content



content/



&#x20;   authors/



&#x20;   licenses/



&#x20;   templates/



\---



\# Assets



assets/



Contains editable project assets.



Example:



assets/



&#x20;   images/



&#x20;   icons/



&#x20;   logos/



&#x20;   fonts/



&#x20;   diagrams/



&#x20;   illustrations/



Assets are source files used during development.



\---



\# Public



public/



Contains production-ready static files.



Example:



public/



&#x20;   favicon.ico



&#x20;   robots.txt



&#x20;   sitemap.xml



&#x20;   images/



&#x20;   videos/



\---



\# Configuration



config/



Contains all project configuration.



Example:



config/



&#x20;   app.config.ts



&#x20;   site.config.ts



&#x20;   ai.config.ts



&#x20;   search.config.ts



\---



\# Scripts



scripts/



Contains automation scripts.



Example:



scripts/



&#x20;   build/



&#x20;   import/



&#x20;   export/



&#x20;   validation/



&#x20;   indexing/



&#x20;   migration/



\---



\# Data



data/



Contains generated structured data.



Example:



data/



&#x20;   graph/



&#x20;   indexes/



&#x20;   metadata/



&#x20;   cache/



Generated data may be rebuilt at any time.



\---



\# AI



ai/



Contains AI resources.



Example:



ai/



&#x20;   prompts/



&#x20;   templates/



&#x20;   workflows/



&#x20;   context/



&#x20;   providers/



&#x20;   schemas/



\---



\# Search



search/



Contains search engine resources.



Example:



search/



&#x20;   indexes/



&#x20;   synonyms/



&#x20;   stopwords/



&#x20;   ranking/



\---



\# Tests



tests/



Contains automated tests.



Example:



tests/



&#x20;   unit/



&#x20;   integration/



&#x20;   build/



&#x20;   search/



&#x20;   validation/



\---



\# GitHub



.github/



Contains repository automation.



Example:



.github/



&#x20;   workflows/



&#x20;   ISSUE\_TEMPLATE/



&#x20;   PULL\_REQUEST\_TEMPLATE/



\---



\# Naming Rules



Directories:



\- lowercase

\- kebab-case



Files:



\- lowercase

\- kebab-case



Examples:



knowledge-object.ts



build-index.ts



search-engine.ts



visual-system.md



\---



\# Empty Directories



Empty directories should contain:



.gitkeep



when necessary.



\---



\# File Placement



Every file belongs to one directory only.



Duplicate files should not exist.



Generated files must never replace source files.



\---



\# Scalability



New modules may be added without changing the existing directory hierarchy.



Large sections should be extended by creating new subdirectories rather than expanding individual folders indefinitely.



\---



\# Consistency



The folder structure follows:



\- Manifest

\- Architecture

\- Knowledge Model

\- Editorial Policy

\- Source Policy

\- Verification Policy



The directory structure serves as the physical organization of the VAN SMITH LAB project and provides a stable foundation for future development.


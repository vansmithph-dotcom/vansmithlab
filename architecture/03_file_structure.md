\# File Structure

Version: 1.0



\## Purpose



This document defines how files are organized inside VAN SMITH LAB.



Every file has a single responsibility and a predictable location.



\---



\## Principles



\- One responsibility per file

\- Predictable organization

\- Consistent naming

\- Modular structure

\- Easy navigation



\---



\## Knowledge Content



content/

├── knowledge/

├── research/

├── collections/

├── timelines/

├── galleries/

└── videos/



\---



\## Knowledge Object



Every knowledge object is stored in its own directory.



Example:



content/

└── knowledge/

&#x20;   └── prada/

&#x20;       ├── index.md

&#x20;       ├── metadata.json

&#x20;       ├── sources.json

&#x20;       ├── relationships.json

&#x20;       ├── timeline.json

&#x20;       ├── gallery.json

&#x20;       └── versions/



\---



\## Research



Example:



content/

└── research/

&#x20;   └── luxury-brand-positioning/

&#x20;       ├── index.md

&#x20;       ├── metadata.json

&#x20;       ├── references.json



\---



\## Collections



Example:



content/

└── collections/

&#x20;   └── fashion-designers/

&#x20;       ├── index.md

&#x20;       ├── metadata.json



\---



\## Timelines



Example:



content/

└── timelines/

&#x20;   └── prada-history/

&#x20;       ├── index.md

&#x20;       ├── events.json



\---



\## Galleries



Example:



content/

└── galleries/

&#x20;   └── prada-fw-2026/

&#x20;       ├── index.md

&#x20;       ├── images.json



\---



\## Videos



Example:



content/

└── videos/

&#x20;   └── prada-documentary/

&#x20;       ├── index.md

&#x20;       ├── transcript.md

&#x20;       ├── chapters.json



\---



\## Metadata Files



metadata.json



Stores:



\- title

\- slug

\- description

\- language

\- version

\- publication date



\---



\## Sources



sources.json



Stores:



\- source list

\- reliability

\- access dates

\- references



\---



\## Relationships



relationships.json



Stores:



\- related objects

\- relationship types

\- identifiers



\---



\## Timeline



timeline.json



Stores chronological events.



\---



\## Gallery



gallery.json



Stores:



\- image identifiers

\- captions

\- credits

\- licenses



\---



\## Versions



versions/



Stores previous object versions.



Example:



versions/

├── v1.0.json

├── v1.1.json

└── v1.2.json



\---



\## Assets



assets/



Suggested structure:



assets/

├── images/

├── videos/

├── icons/

├── fonts/

└── diagrams/



\---



\## Configuration



config/



Suggested files:



config/

├── site.json

├── navigation.json

├── languages.json

├── categories.json

├── object-types.json



\---



\## Search



search/



Suggested files:



search/

├── index.json

├── objects.json

├── categories.json

└── tags.json



\---



\## AI



ai/



Suggested structure:



ai/

├── prompts/

├── templates/

├── workflows/

└── rules/



\---



\## Scripts



scripts/



Suggested structure:



scripts/

├── build/

├── validation/

├── deployment/

├── metadata/

└── search/



\---



\## Naming Convention



Files:



\- lowercase

\- kebab-case

\- descriptive



Directories:



\- lowercase

\- singular when representing a single object

\- plural for collections



\---



\## File Independence



Each file should have a clearly defined purpose.



Files should avoid storing duplicated information whenever possible.



\---



\## Maintainability



The file structure is designed for long-term growth while preserving consistency and readability.


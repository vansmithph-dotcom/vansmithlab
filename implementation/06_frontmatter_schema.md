\# Front Matter Schema

Version: 1.0



\## Purpose



This document defines the canonical Front Matter schema used by every knowledge object in VAN SMITH LAB.



The Front Matter is the primary metadata layer for all editorial content.



Every knowledge object must follow this schema.



\---



\## Principles



The schema shall be:



\- Consistent

\- Predictable

\- Machine-readable

\- Human-readable

\- Versioned

\- Extensible



\---



\# Format



Front Matter uses YAML.



Example:



\---

id:

type:

slug:

title:

...

\---



\---



\# Required Fields



\## id



Type:



String



Description:



Permanent unique identifier.



Example:



id: brand\_prada



Rules:



\- Required

\- Unique

\- Never changes



\---



\## type



Type:



String



Defines the knowledge object type.



Examples:



brand



person



company



product



technology



place



research



gallery



video



timeline



Rules:



\- Required

\- Controlled vocabulary



\---



\## slug



Type:



String



Human-readable URL identifier.



Example:



slug: prada



Rules:



\- Lowercase

\- Hyphen-separated

\- Unique



\---



\## title



Type:



String



Official object title.



Example:



title: Prada



Required.



\---



\## summary



Type:



String



Short description used for previews and search.



Recommended:



50–250 characters.



\---



\## language



Type:



String



Example:



language: ru



Supported values:



\- ru

\- en



\---



\## status



Type:



String



Allowed values:



\- draft

\- review

\- verified

\- published

\- archived



\---



\## verification



Type:



String



Allowed values:



\- verified

\- partially-verified

\- unverified



\---



\## confidence



Type:



Integer



Range:



0–100



Represents editorial confidence.



\---



\## version



Type:



String



Example:



1.0



Updated after publication changes.



\---



\## created



Type:



Date



ISO 8601.



Example:



2026-07-30



\---



\## updated



Type:



Date



ISO 8601.



Updated automatically.



\---



\# Classification



\## categories



Type:



Array



Example:



categories:



\- luxury

\- fashion



\---



\## tags



Type:



Array



Example:



tags:



\- italy

\- milan

\- ready-to-wear



\---



\# Relationships



\## relationships



Type:



Array



Contains references to other knowledge objects.



Example:



relationships:



\- brand\_miu\_miu

\- person\_miuccia\_prada



\---



\# Sources



\## sources



Type:



Array



Contains source identifiers.



Example:



sources:



\- src\_001

\- src\_017



Source metadata is stored separately.



\---



\# Authors



\## author



Type:



String



Editorial author.



Example:



author: VAN SMITH LAB



\---



\## reviewers



Type:



Array



Editorial reviewers.



Optional.



\---



\# SEO



\## seo



Contains:



title



description



keywords



canonical



og-image



Example:



seo:



title: Prada



description: ...



\---



\# Media



\## cover



Type:



String



Primary image.



Example:



cover:



images/prada-cover.webp



\---



\## gallery



Type:



Array



Gallery identifiers.



Optional.



\---



\# Timeline



\## timeline



Type:



String



Timeline identifier.



Optional.



\---



\# Translation



\## translations



Type:



Array



Example:



translations:



\- en



\---



\# AI Metadata



\## ai



Contains AI-related metadata.



Fields:



generated



translated



media-generated



reviewed



Example:



ai:



generated: true



translated: true



reviewed: true



\---



\# Build Metadata



\## build



Contains implementation metadata.



Fields:



indexed



graph



published



search



These values are maintained automatically.



\---



\# Example



\---

id: brand\_prada

type: brand

slug: prada

title: Prada

summary: Italian luxury fashion house.

language: ru

status: published

verification: verified

confidence: 98

version: 1.0

created: 2026-07-30

updated: 2026-07-30



categories:

&#x20; - luxury

&#x20; - fashion



tags:

&#x20; - italy

&#x20; - milan

&#x20; - ready-to-wear



relationships:

&#x20; - person\_miuccia\_prada



sources:

&#x20; - src\_001



author: VAN SMITH LAB



cover: images/prada.webp



translations:

&#x20; - en



ai:

&#x20; generated: false

&#x20; translated: false

&#x20; reviewed: true



build:

&#x20; indexed: true

&#x20; graph: true

&#x20; published: true

&#x20; search: true

\---



\# Validation Rules



Every knowledge object must:



\- contain all required fields;

\- contain valid field types;

\- contain valid identifiers;

\- contain valid references;

\- pass schema validation.



Validation failures prevent publication.



\---



\# Extensibility



New fields may be added without breaking existing content.



Existing required fields must remain backward compatible.



\---



\# Consistency



Every knowledge object in VAN SMITH LAB uses this Front Matter schema.



The Front Matter serves as the canonical metadata contract between editorial content, AI systems, the knowledge graph, search engine and application code.


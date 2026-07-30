\# Content Structure

Version: 1.0



\## Purpose



This document defines the canonical content organization of VAN SMITH LAB.



All editorial content is stored as Markdown and organized according to the Knowledge Model.



Every knowledge object is an independent, self-contained content unit.



\---



\## Principles



The content system shall be:



\- Structured

\- Predictable

\- Modular

\- Human-readable

\- AI-friendly

\- Version-controlled



Content must never depend on application code.



\---



\# Content Root



content/



All editorial information is stored inside this directory.



\---



\# Primary Structure



content/



&#x20;   knowledge/



&#x20;   research/



&#x20;   editorials/



&#x20;   comparisons/



&#x20;   guides/



&#x20;   references/



&#x20;   glossary/



&#x20;   galleries/



&#x20;   timelines/



&#x20;   collections/



\---



\# Knowledge Objects



Knowledge objects are grouped by object type.



Example:



content/



&#x20;   knowledge/



&#x20;       brands/



&#x20;       companies/



&#x20;       people/



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



\# Object Structure



Every knowledge object has its own directory.



Example:



content/



&#x20;   knowledge/



&#x20;       brands/



&#x20;           prada/



\---



\# Required Files



Example:



prada/



&#x20;   index.md



&#x20;   sources.json



&#x20;   relationships.json



\---



\## index.md



Contains the canonical editorial content.



Responsibilities:



\- Front Matter

\- Main article

\- Structured sections

\- Internal links



\---



\## sources.json



Contains every verified source used by the object.



Includes:



\- Source ID

\- URL

\- Type

\- Reliability

\- Publication Date



\---



\## relationships.json



Defines graph relationships.



Includes:



\- Related Objects

\- Parent Objects

\- Child Objects

\- Similar Objects



\---



\# Optional Files



Objects may additionally contain:



gallery.md



timeline.md



notes.md



history.md



faq.md



media.json



translations.json



Optional files should only exist when needed.



\---



\# Research



Research documents remain independent.



Example:



content/



&#x20;   research/



&#x20;       luxury/



&#x20;       fashion/



&#x20;       ai/



&#x20;       photography/



Research documents are not knowledge objects.



\---



\# Editorials



Editorial content:



content/



&#x20;   editorials/



&#x20;       future-of-fashion.md



&#x20;       ai-in-design.md



Editorials represent expert analysis rather than reference knowledge.



\---



\# Comparisons



Example:



content/



&#x20;   comparisons/



&#x20;       prada-vs-miu-miu.md



&#x20;       midjourney-vs-flux.md



Comparisons reference multiple knowledge objects.



\---



\# Guides



Example:



content/



&#x20;   guides/



&#x20;       color-management.md



&#x20;       fashion-photography-lighting.md



Guides explain workflows and practical knowledge.



\---



\# References



Reference documents contain structured factual information.



Examples:



\- terminology

\- standards

\- specifications

\- definitions



\---



\# Glossary



Glossary entries define terminology.



Each entry should remain concise and link to related knowledge objects.



\---



\# Galleries



Gallery pages contain curated visual collections.



Images reference existing knowledge objects.



Gallery content should not duplicate editorial articles.



\---



\# Timelines



Timeline pages organize chronological events.



Timeline events reference knowledge objects whenever possible.



\---



\# Collections



Collections group existing knowledge objects.



Collections do not duplicate content.



\---



\# Internal Links



Content links use permanent object identifiers.



Broken links are not permitted.



Link validation occurs during the build process.



\---



\# Images



Images are referenced, not embedded as source files.



Media metadata remains separate from editorial content.



\---



\# Languages



Each knowledge object may contain multiple language versions.



Translations remain associated with the same object identifier.



\---



\# Versioning



Every content modification is tracked through Git.



Editorial history remains recoverable.



\---



\# Validation



Content validation checks:



\- Front Matter

\- Required files

\- Internal links

\- Relationships

\- Sources

\- Metadata

\- Object identifiers



Validation failures prevent publication.



\---



\# Extensibility



New content types may be added without changing the existing structure.



Existing object identifiers must never change.



\---



\# Consistency



The content structure follows:



\- Manifest

\- Editorial Policy

\- Knowledge Model

\- Source Policy

\- Verification Policy

\- Architecture



The content structure represents the canonical knowledge repository of VAN SMITH LAB.


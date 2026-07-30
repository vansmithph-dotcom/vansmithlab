\# Data Schema

Version: 1.0



\## Purpose



This document defines the logical data schema used by VAN SMITH LAB.



The schema standardizes how every knowledge object is stored, validated and connected.



\---



\## Core Entity



KnowledgeObject



Every published item is represented by a single Knowledge Object.



\---



\## KnowledgeObject



Fields:



\- id

\- type

\- slug

\- title

\- summary

\- content

\- language

\- status

\- verificationStatus

\- confidenceLevel

\- version

\- createdAt

\- updatedAt



\---



\## Object Types



Supported values:



\- Brand

\- Person

\- Company

\- Product

\- Collection

\- Campaign

\- Material

\- Technology

\- AI Model

\- Workflow

\- Prompt

\- Equipment

\- Software

\- Building

\- Place

\- Research

\- Gallery

\- Video

\- Timeline



\---



\## Metadata



Metadata fields:



\- seoTitle

\- seoDescription

\- canonicalURL

\- keywords

\- language

\- publicationDate

\- lastUpdated



\---



\## Categories



Category



Fields:



\- id

\- name

\- slug

\- parentId



\---



\## Tags



Tag



Fields:



\- id

\- name

\- slug



\---



\## Source



Fields:



\- id

\- title

\- author

\- publisher

\- publicationDate

\- url

\- language

\- type

\- reliability

\- accessDate



\---



\## Relationship



Fields:



\- id

\- sourceObject

\- targetObject

\- relationshipType



\---



\## Media



Fields:



\- id

\- type

\- filename

\- caption

\- credits

\- license

\- source

\- createdAt



\---



\## Gallery



Fields:



\- id

\- title

\- media

\- captions



\---



\## Timeline Event



Fields:



\- id

\- date

\- title

\- description

\- relatedObject



\---



\## Version



Fields:



\- objectId

\- version

\- updatedAt

\- summary



\---



\## Search Index



Indexed fields:



\- title

\- summary

\- content

\- categories

\- tags

\- relatedObjects



\---



\## Verification



Allowed values:



\- Verified

\- Multi-source Verified

\- Partially Verified

\- Unverified

\- Rumor

\- Retracted



\---



\## Confidence



Allowed values:



\- High

\- Medium

\- Low

\- Unknown



\---



\## Status



Allowed values:



\- Draft

\- Review

\- Published

\- Archived



\---



\## Language



Each language version references the same object identifier.



Translations are linked to the original object.



\---



\## Required Fields



Every Knowledge Object must contain:



\- id

\- type

\- slug

\- title

\- language

\- status

\- version



Objects missing required fields are invalid.



\---



\## Schema Evolution



The schema is extensible.



New fields may be added while maintaining backward compatibility.



Existing field names should remain stable whenever possible.


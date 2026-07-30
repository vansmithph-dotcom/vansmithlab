\# Context Builder

Version: 1.0



\## Purpose



This document defines the Context Builder subsystem of VAN SMITH LAB.



The Context Builder assembles the minimum required context for every AI task.



It is the bridge between the knowledge base and AI providers.



The Context Builder is the only component responsible for deciding what information is sent to AI.



\---



\## Objectives



The Context Builder shall:



\- Build task-specific context

\- Reduce token usage

\- Improve response quality

\- Maintain consistency

\- Preserve provider independence

\- Prevent information overload



\---



\## Principles



The Context Builder shall be:



\- Deterministic

\- Modular

\- Minimal

\- Explainable

\- Reproducible



Only relevant context is included.



\---



\# Architecture



Editorial Task



↓



Task Analyzer



↓



Context Selection



↓



Dependency Resolution



↓



Context Assembly



↓



Validation



↓



AI Router



\---



\# Context Sources



The Context Builder may use:



\- Documentation

\- Architecture

\- Implementation

\- Knowledge Objects

\- Research

\- Sources

\- Templates

\- Configuration

\- Taxonomy

\- Graph Data



Every source has a defined priority.



\---



\# Documentation Layer



The documentation layer includes:



docs/



architecture/



implementation/



These documents define project rules.



\---



\# Knowledge Layer



The knowledge layer includes:



content/



research/



collections/



timelines/



galleries/



references/



Knowledge content is task-dependent.



\---



\# Configuration Layer



Configuration includes:



\- AI configuration

\- Prompt templates

\- Search configuration

\- Editorial configuration

\- Graph configuration



Configuration is read-only.



\---



\# Task Analyzer



The Task Analyzer determines:



\- Task type

\- Required knowledge

\- Required documentation

\- Required templates

\- Required output format



The analyzer never selects unnecessary files.



\---



\# Supported Task Types



Examples:



Research



Writing



Translation



Verification



Metadata



Relationship Analysis



Graph Update



Search Optimization



Media Generation



Deployment



Validation



Each task has its own context profile.



\---



\# Context Profiles



Every task profile defines:



Required documents



Optional documents



Maximum context size



Expected output



Validation rules



Profiles are versioned.



\---



\# Dependency Resolution



The Context Builder automatically resolves:



Referenced documents



Referenced objects



Parent objects



Related objects



Configuration dependencies



Dependencies are recursive but bounded.



\---



\# Priority Rules



Highest priority:



Current task



↓



Current Knowledge Object



↓



Referenced Knowledge Objects



↓



Project Documentation



↓



Architecture



↓



Implementation



↓



General Knowledge



The priority order remains configurable.



\---



\# Context Assembly



The Context Builder assembles:



Task Description



↓



Documentation



↓



Knowledge



↓



Configuration



↓



Templates



↓



Expected Output



↓



Validation Rules



The output is deterministic.



\---



\# Context Size



Context should include only the minimum information required.



Large documents may be partially included.



Irrelevant sections are omitted.



\---



\# Context Compression



Compression may include:



Removing duplicate information



Removing unused sections



Removing obsolete versions



Summarizing large datasets



Compression never changes factual meaning.



\---



\# Object Selection



When processing a Knowledge Object, include:



Current object



Parent objects



Direct relationships



Referenced objects



Editorial metadata



Extended graph traversal is optional.



\---



\# Template Selection



The Context Builder selects:



Prompt template



Output schema



Validation schema



Formatting rules



Templates are version-controlled.



\---



\# Output Formats



Supported outputs include:



Markdown



JSON



YAML



CSV



Plain Text



The required format is selected automatically.



\---



\# Validation



Context validation checks:



Missing documents



Broken references



Duplicate files



Invalid versions



Circular dependencies



Invalid context blocks



Invalid context is rejected.



\---



\# Caching



Frequently used contexts may be cached.



Cache invalidation occurs automatically after:



Documentation updates



Knowledge updates



Configuration updates



Template updates



\---



\# Logging



Every context build records:



Task ID



Context Version



Selected Documents



Selected Objects



Token Estimate



Build Duration



Logs support debugging and optimization.



\---



\# Performance



The Context Builder should:



Minimize token usage



Reduce latency



Avoid duplicate processing



Reuse cached contexts



Performance scales with project size.



\---



\# Security



The Context Builder excludes:



Secrets



API keys



Environment variables



Private credentials



Draft content unless explicitly requested



Sensitive information is never included automatically.



\---



\# Extensibility



Future context sources may include:



External APIs



Academic databases



Vector indexes



Semantic memory



User workspaces



The architecture remains provider-independent.



\---



\# Directory Mapping



Typical project structure:



docs/



architecture/



implementation/



content/



research/



templates/



config/



graph/



search/



media/



Only relevant directories are loaded for each task.



\---



\# Example Context Profiles



Research



\- Editorial Policy

\- Source Policy

\- Verification

\- Research Template



Writing



\- Editorial Policy

\- Knowledge Model

\- Page Template

\- Current Knowledge Object



Translation



\- Translation Rules

\- Current Knowledge Object

\- Terminology

\- Style Guide



Verification



\- Source Policy

\- Verification Rules

\- Sources

\- Current Knowledge Object



Graph Update



\- Knowledge Object

\- Relationships

\- Graph Configuration



Media Generation



\- Visual System

\- Media Pipeline

\- Prompt Template

\- Current Knowledge Object



\---



\# Consistency



The Context Builder follows:



\- Manifest

\- Editorial Policy

\- Knowledge Model

\- Source Policy

\- Verification Policy

\- AI Workflow

\- Architecture



The Context Builder is the canonical mechanism that transforms the project's documentation and knowledge base into precise, task-specific AI context while minimizing complexity, token usage and ambiguity.


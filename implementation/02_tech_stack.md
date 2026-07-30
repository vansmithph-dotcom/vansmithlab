\# Tech Stack

Version: 1.0



\## Purpose



This document defines the official technology stack of VAN SMITH LAB.



Only approved technologies should be used during implementation to ensure consistency, maintainability and long-term stability.



\---



\## Principles



The technology stack shall be:



\- Stable

\- Modern

\- Well documented

\- Modular

\- Replaceable

\- AI-friendly



The stack should remain as small as possible while providing all required functionality.



\---



\# Architecture



The platform follows a static-first architecture with optional server-side services.



Content



↓



Build Pipeline



↓



Static Website



↓



CDN



↓



User



\---



\# Core Technologies



\## Runtime



Node.js (LTS)



\---



\## Package Manager



npm



\---



\## Language



TypeScript



TypeScript is the primary programming language for the project.



JavaScript should only be used when required by third-party tools.



\---



\## Frontend



React



Provides:



\- Component architecture

\- Reusability

\- Maintainability

\- Ecosystem compatibility



\---



\## Framework



Next.js



Responsibilities:



\- Routing

\- Static Site Generation

\- Metadata

\- Image Optimization

\- API Routes (when required)



Static generation is preferred whenever possible.



\---



\## Styling



Tailwind CSS



Responsibilities:



\- Layout

\- Typography

\- Responsive Design

\- Utility Classes



Custom CSS should be minimal.



\---



\## Icons



Lucide Icons



Provides:



\- Consistent icon system

\- Tree shaking

\- SVG support



\---



\## Content Format



Markdown (.md)



Markdown is the canonical content format.



All editorial content is stored as Markdown.



\---



\## Metadata



YAML Front Matter



Every knowledge object contains structured metadata.



\---



\## Data Format



JSON



Used for:



\- Relationships

\- Search Indexes

\- Configuration

\- Generated Data



\---



\## Search



Local Search Index



The search system operates on generated indexes.



No external search service is required.



\---



\## Knowledge Graph



JSON-based graph.



Relationships are generated during the build process.



\---



\## Images



Supported formats:



\- WebP

\- AVIF

\- PNG

\- JPEG



Preferred format:



WebP



\---



\## Video



Supported formats:



\- MP4

\- WebM



\---



\## Fonts



Self-hosted fonts whenever possible.



External font dependencies should be minimized.



\---



\## Version Control



Git



Repository hosted on GitHub.



\---



\## Development Environment



Visual Studio Code



Recommended extensions:



\- ESLint

\- Prettier

\- Markdown

\- GitHub Copilot

\- GitLens



\---



\## AI Tools



Approved AI tools:



\- ChatGPT

\- Claude

\- Gemini

\- Nano Banana

\- Weavy



These tools assist with:



\- Research

\- Writing

\- Translation

\- Metadata

\- Image Generation

\- Workflow Automation



\---



\## Build Automation



Build process should support:



\- Static generation

\- Metadata generation

\- Search index generation

\- Knowledge graph generation

\- Sitemap generation



\---



\## Deployment



Cloudflare



Responsibilities:



\- CDN

\- DNS

\- HTTPS

\- Edge Caching

\- Static Hosting



\---



\## Analytics



Analytics must:



\- Respect user privacy

\- Minimize tracking

\- Avoid unnecessary cookies



\---



\## Security



Security principles:



\- HTTPS only

\- No secrets in source code

\- Environment variables for sensitive data

\- Dependency updates

\- Secure headers



\---



\## Dependency Policy



Every dependency must be:



\- Actively maintained

\- Well documented

\- Widely adopted

\- Replaceable



Unused dependencies should be removed.



\---



\## Upgrade Policy



Technology upgrades should:



\- Preserve compatibility

\- Be documented

\- Be tested before deployment



Major upgrades require validation.



\---



\## Consistency



All implementation decisions must remain compatible with:



\- Documentation

\- Architecture

\- Editorial Workflow

\- Knowledge Model



The technology stack provides the implementation foundation for VAN SMITH LAB.


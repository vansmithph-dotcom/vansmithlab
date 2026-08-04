# VANSMITHLAB

VANSMITHLAB is an independent bilingual encyclopedia of design and visual culture. The active product, editorial and automation rules live in [`VANSMITHLAB_OS/`](./VANSMITHLAB_OS/).

## Local development

```bash
npm install
npm run dev
```

The public Russian master is available at `/ru/`; English is available at `/en/`.

## Production build

```bash
npm run build
```

The initial site is a static Next.js export. The build writes deployable files to `out/`.

## Cloudflare Pages

Connect this repository to a Cloudflare Pages project using the **Next.js (Static HTML Export)** framework preset.

- Production branch: `main`
- Build command: `npm run build`
- Build output directory: `out`

After the first successful deployment, add `vansmithlab.com` in the project’s **Custom domains** settings. The apex domain must be an active Cloudflare zone; configure it through the Pages custom-domain flow rather than adding a DNS record manually.

## Content and automation

No content, media or automation change may bypass `VANSMITHLAB_OS/00_START_HERE.md`. The current public sample objects are intentional placeholders until the D1 knowledge core and verification pipeline are connected.

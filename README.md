# Yasir Quazi — A Map of Works

A small portfolio hub: a dark burgundy desk with a parchment map, where each project
is a hand-made artifact you can open. Built with [Astro](https://astro.build) as a static
site for Cloudflare Pages.

## Run it

```bash
npm install
npm run dev      # local preview
npm run build    # static site in dist/
```

## Deploy (Cloudflare Pages)

Connect this repo in Cloudflare Pages with:
- Build command: `npm run build`
- Output directory: `dist`

## Where things live

| What | Where |
|---|---|
| Projects (titles, descriptions, links, case-study URLs) | `src/data/projects.js` |
| Your name and social links on the stamp | `src/data/site.js` |
| The map (home page) | `src/pages/index.astro` |
| Project detail pages | `src/pages/work/[slug].astro` |
| Artifact images, desk objects, sounds | `public/art`, `public/table` |
| Favicon set | `public/icons` |
| Fonts (self-hosted) | `public/fonts` |
| Blender render scripts for the objects and artifacts | `tools/blender` |
| Drawing code for the artifact relief maps | `tools/art` |

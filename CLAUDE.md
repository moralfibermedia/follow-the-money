# CLAUDE.md — Moral Fiber Media / FactPuzzles

## Project Overview
Monorepo for FactPuzzles by Moral Fiber Media — interactive civic puzzles built on public data. "Follow the Money" uses OpenSecrets donation data. "Who Said It?" uses public hearing transcripts and court opinions.

## Key Principles
- **Puzzles, not games.** Always use "puzzles" in user-facing copy.
- **Editorial control is 100% human.** Claude builds/deploys. The human picks content. Never generate puzzle content autonomously.
- **Every claim is sourced.** Every correct match reveals the source link.
- **Tagline:** "We do the research. You solve the puzzle."
- **CC BY 4.0** for original content. **CC BY-NC-SA 3.0** for OpenSecrets-derived puzzles.

## Architecture
Single Netlify site at `followthemoney.moralfibermedia.com`, **built with Eleventy 3** (July 2026 migration): Netlify runs `npm run build` → publishes `_site/`. Sources live in `src/` (layouts, templates, assets); **`data/puzzles.json` is the single source of truth — every puzzle page, the index, and the sitemap are generated from it.** Bespoke visual reports (`doj/`, `2026-ga-elections-legislation/`) and `review/` pass through verbatim; preview art stays beside each puzzle's old content dir. The pre-migration arcade pages are archived at `/v1/{id}/` (noindex) and paired with the live pages on `/compare/`, which also hosts the `design-feedback` Netlify Form. Workspace dirs (`template/` — now deprecated, `marketing/`, `scripts/`, `drafts/`, `data/` except `comment-counts.json`) never ship; internal root `.md` docs are 404'd in `netlify.toml`.

## Git Config
- **GitHub org:** moralfibermedia
- **Git user.name:** moralfibermedia
- **Git user.email:** mf@moralfibermedia.com

## Design System
Read `.claude/skills/mfm-editorial-design/SKILL.md` — typography (Playfair Display, Source Serif 4, JetBrains Mono), colors (ink/paper/red/gold), components.

## Deployment
Read `.claude/skills/netlify-deploy/SKILL.md` — workflows, site registry, shared files, troubleshooting, new puzzle checklist.

## Common Tasks

### Build a new puzzle (any mechanic)
Human provides the content + sources; **the page is generated — do not write HTML**.
1. Add the entry to `data/puzzles.json` with the right `template` (`barchart`, `text-match`, `rank`, `over-under`, `timeline`) and its content fields (companies / facts+answers / items / cards / events — copy an existing entry of the same template as the schema). Timeline events follow the **triangulation standard**: 3 sources each (gov/SEC → company → media).
2. Drop `preview.json` + render `preview.png` (1200×630) into the page's content dir (`puzzles/{id}/` or the series dir) via the `fact-puzzle-preview` skill.
3. `npm run build` — the page, hub listing, and sitemap entry all generate. Verify the puzzle solves headless, then PR; the deploy preview is the review surface.
Optional page copy: bespoke article paragraphs go in `src/_data/prose.json` keyed by id (otherwise composed from hook/subtitle/hint). Featured placement: add the id to `src/_data/site.json` `featured`.

### Draft-first workflow (unverified data)
Build the entry but stage the page under `drafts/{id}/` conventions and open a PR — drafts are noindexed, appear in the Review Desk verify queue (`scripts/build-review-desk.py`), and publish by flipping into the manifest after human verification. Say "publish {id}" to run the checklist.

### Draft channel posts for a puzzle
Write platform-tailored promo copy into `marketing/{campaign}/{channel}.md` (substack, bluesky, x, facebook, sezus, tiktok, youtube) per the `mfm-editorial-design` skill ("Channel-specific posts") and `marketing/README.md`. Every link gets `?utm_source={platform}&utm_medium={email|social}&utm_campaign={campaign}`.

### Add a fighter
Add to `data/fighters.json` — `/fighters/` regenerates at build. The 9 featured on every page's tail live in `src/_data/featuredFighters.json`; Inspired By in `src/_data/inspired.json`.

### Design changes
Layout/typography live once in `src/_includes/` + `src/assets/site.css` — edit there, never per-page. The v2 editorial treatment (article-first, puzzle-as-figure, 4-size scale) is the house format; `/compare/` collects invited design feedback.

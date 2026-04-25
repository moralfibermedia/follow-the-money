# CLAUDE.md — Moral Fiber Media / FactPuzzles

## Project Overview
Monorepo for FactPuzzles by Moral Fiber Media — interactive civic puzzles built on public data. "Follow the Money" uses OpenSecrets donation data. "Who Said It?" uses public hearing transcripts and court opinions.

## Key Principles
- **Puzzles, not games.** Always use "puzzles" in user-facing copy.
- **Editorial control is 100% human.** Claude builds/deploys. The human picks content. Never generate puzzle content autonomously.
- **Every claim is sourced.** Every correct match reveals the source link.
- **Tagline:** "We do the reading. You solve the puzzle."
- **CC BY 4.0** for original content. **CC BY-NC-SA 3.0** for OpenSecrets-derived puzzles.

## Architecture
Single Netlify site at `follow-the-money.moralfibermedia.com`. All pages deploy from one GitHub repo (`moralfibermedia/follow-the-money`). Puzzle index is `index.html` at repo root. Each page lives in its own folder (`puzzles/`, `fighters/`, `legal/`, `doj/`) with an `index.html` and `preview.png`. Shared `robots.txt`, `_headers`, and `netlify.toml` at repo root. Data in `data/`, templates in `template/` (workspace-only, blocked from serving by `netlify.toml`).

## Git Config
- **GitHub org:** moralfibermedia
- **Git user.name:** moralfibermedia
- **Git user.email:** mf@moralfibermedia.com

## Design System
Read `.claude/skills/mfm-editorial-design/SKILL.md` — typography (Playfair Display, Source Serif 4, JetBrains Mono), colors (ink/paper/red/gold), components.

## Deployment
Read `.claude/skills/netlify-deploy/SKILL.md` — workflows, site registry, shared files, troubleshooting, new puzzle checklist.

## Common Tasks

### Build a new bar-chart puzzle
Human provides: company names, OpenSecrets amounts/percentages/URLs, title, hint, subtitle.
1. Add entry to `data/puzzles.json`
2. Stamp into `template/puzzle-template-barchart.html`
3. Generate preview image (1200x630), copy shared files
4. Output to `puzzles/{id}/`, update root `index.html`

### Build a new text-match puzzle
Human provides: quotes/facts, speakers/answers, source links, title, hint.
Use `template/puzzle-template-text.html` or `tools/index.html` (puzzle builder).

### Add a fighter
Add to `data/fighters.json`, rebuild `fighters/index.html`.

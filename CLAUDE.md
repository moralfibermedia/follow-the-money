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
Single Netlify site at `followthemoney.moralfibermedia.com`. All pages deploy from one GitHub repo (`moralfibermedia/follow-the-money`). Puzzle index is `index.html` at repo root. Each page lives in its own folder (`puzzles/`, `fighters/`, `legal/`, `doj/`) with an `index.html` and `preview.png`. Shared `robots.txt`, `_headers`, and `netlify.toml` at repo root. Data in `data/`, templates in `template/` (workspace-only, blocked from serving by `netlify.toml`).

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

**Zero-spend companies** (no direct federal contributions in the cycle) use the first-class `.bar-chart.zero-spend` tile, not an inline-styled bar row — silence is editorial, not missing data. Flag with `zero_spend: true` in `data/puzzles.json` and `zeroSpend: true` in `preview.json`. Reference: HTML example commented in `template/puzzle-template-barchart.html` above `<div class="charts-grid">`.

### Build a new text-match puzzle
Human provides: quotes/facts, speakers/answers, source links, title, hint.
Use `template/puzzle-template-text.html` or `tools/index.html` (puzzle builder).

### Build a new rank puzzle
Order 4 items by a metric (most→least), one submit, then a full value reveal.
Human provides: 4 items (name, raw value, formatted display, correct rank 1–4, source URL/label), the metric + direction, title, hook, episode name.
1. Add entry to `data/puzzles.json` with `"template": "rank"` and an `items` array: `[{ id, name, value, display, rank, source_url, source_label }]`
2. Stamp into `template/puzzle-template-rank.html` — follow the `TEMPLATE CONFIG` comment at the top of the file. The markup order of the `.rank-item` cards is the starting scramble the player sees (hand-pick it; it's never shuffled at runtime). `data-rank` is the authoritative correct position — never derived from values. Bar widths are computed by JS from `data-value`, so no percentages to stamp.
3. Pick the license block: CC BY 4.0 is active by default (public-domain data). If any data is from OpenSecrets, swap in the commented CC BY-NC-SA 3.0 block AND update the JSON-LD `license`.
4. Generate preview image (1200x630), copy shared files, output to `puzzles/{id}/`, update root `index.html`.

### Build a new over/under puzzle
Higher-or-lower deck: 6 cards, card 1 is the revealed anchor, 5 guess rounds with count-up reveals and streak tracking.
Human provides: 6 entities in narrative order (name, raw value, prefix/suffix, formatted display, context line, source URL), the metric, title, hook, episode name.
1. Add entry to `data/puzzles.json` with `"template": "over-under"` and a `cards` array: `[{ id, name, value, prefix, suffix, display, context, source_url, source_label }]`
2. Stamp into `template/puzzle-template-overunder.html` — follow the `TEMPLATE CONFIG` comment. The DOM order of the `.ou-card` entries **is** the play order (no shuffle); the first card is the revealed anchor. **Avoid equal values** — a tie counts as correct for either guess. `data-prefix`/`data-suffix` support $, %, or vote counts.
3. Pick the license block (CC BY 4.0 default; CC BY-NC-SA 3.0 if OpenSecrets).
4. Generate preview image, copy shared files, output to `puzzles/{id}/`, update root `index.html`.

### Build a new timeline puzzle
Arrange 5 real events chronologically; dates hidden until the reveal. Fits court records, dockets, votes, rulemaking milestones.
Human provides: 5 events (short title, one-line description, ISO date, correct order 1–5, source URL/label), title, hook, episode name.
1. Add entry to `data/puzzles.json` with `"template": "timeline"` and an `events` array: `[{ id, title, description, date, rank, source_url, source_label }]` (`date` is ISO `YYYY-MM-DD`)
2. Stamp into `template/puzzle-template-timeline.html` — follow the `TEMPLATE CONFIG` comment. The markup order of the `.timeline-event` cards is the starting scramble. `data-rank` is the correct chronological position (1 = earliest). Only `data-date` is stamped — the date chip is formatted from it by JS and stays hidden until reveal, so keep `.event-desc` free of date giveaways.
3. Pick the license block (CC BY 4.0 default; CC BY-NC-SA 3.0 if OpenSecrets). These can live under `puzzles/{id}/` or a series folder (e.g. `just-the-facts/{slug}/`) with a `path` field in the entry.
4. Generate preview image, copy shared files, update root `index.html`.

**Note on previews:** the `fact-puzzle-preview` skill ships a sibling `render-*.mjs` renderer per series/mechanic when the first real puzzle lands — the rank/over-under/timeline mechanics don't have one yet. Author it then (copy an existing renderer, swap the card markup, keep the Playwright→Sharp toolchain).

### Add a fighter
Add to `data/fighters.json`, rebuild `fighters/index.html`.

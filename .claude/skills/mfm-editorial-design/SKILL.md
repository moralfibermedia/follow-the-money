---
name: mfm-editorial-design
description: Moral Fiber Media editorial design system. Use this skill whenever building HTML pages, infographics, interactive content, puzzles, or any web-based deliverable for Moral Fiber Media. Triggers on any request involving moralfibermedia.com content, Georgia RICO Part Duex episodes, DOJ bar rule content, civic journalism visuals, Follow the Money puzzles, or any MFM-branded output. Also use when the user references "our design language," "editorial style," "MFM brand," or asks for content in the Moral Fiber Media voice. This skill defines the complete visual identity — typography, color, layout patterns, section components, licensing, and social links — so every build is consistent.
---

# Moral Fiber Media — Editorial Design System

## Identity

Moral Fiber Media is independent civic journalism. The design language is **newspaper editorial meets digital broadsheet** — authoritative, high-contrast, punchy, and source-transparent. It should feel like a front page that takes itself seriously but talks to you like a person.

The aesthetic is NOT lifestyle influencer, NOT corporate SaaS, NOT generic AI slop. It is bold, opinionated, fact-dense, and unapologetically loud.

**Terminology**: We build "puzzles," not "games." We call them "puzzles" in all user-facing text — buttons, labels, share text, meta descriptions.

---

## Typography

Three fonts. No substitutions. No fallbacks to Inter, Roboto, Arial, or system fonts.

| Role | Font | Weights | Usage |
|------|------|---------|-------|
| **Display** | Playfair Display | 700, 900 | Headlines, card totals, section heads, verdicts, CTAs, puzzle names |
| **Body** | Source Serif 4 | 300, 400, 600 (+ italic) | Body text, descriptions, editorial prose, intro bars |
| **System/Label** | JetBrains Mono | 400, 700 | Kickers, datelines, section labels, metadata, URLs, countdowns, license text |

### Scale

- **Masthead headline**: clamp(32px, 6vw, 56px), weight 900
- **Index page headline**: clamp(36px, 7vw, 64px) for hub/directory pages
- **Puzzle name**: clamp(22px, 4vw, 36px), weight 900, italic, color var(--red)
- **Section heads**: 22px Playfair, weight 900
- **Card totals / big numbers**: 28-30px Playfair, weight 900
- **Intro/hook text**: 18px Source Serif, weight 300, italic
- **Body text**: 14-16px Source Serif
- **Subtitle**: 16-18px Source Serif, italic
- **Labels/kickers**: 10-11px JetBrains Mono, letter-spacing 3-4px, uppercase
- **URLs/metadata**: 9-10px JetBrains Mono
- **Score/counter numbers**: 28px Playfair, weight 900

---

## Color

CSS variables:
- --ink: #0d0d0d (primary text, borders, dark backgrounds)
- --paper: #f2ede4 (page background, light text on dark)
- --red: #d63031 (emphasis, accents, CTAs, puzzle names)
- --gold: #b8860b (interactive hover states, selection, "See Full List")
- --muted: #6b6256 (secondary text, labels, descriptions)
- --rule: #c0b89a (divider lines, subtle borders)
- --green: #27ae60 (success/match states)
- --rep-red: #8b1a1a (Republican data bars)
- --dem-blue: #1a3a5c (Democrat data bars)

Gold highlight for strong inside dark bars: #f0c040

---

## Borders & Weight

Borders are thick and intentional — not hairlines.

- Masthead top rule: 5px solid var(--ink)
- Masthead bottom rule: 2px solid var(--ink)
- Cards, tiles, tray, sections: 3px solid var(--ink)
- Social/action buttons: 2px solid var(--ink)
- Dividers between items: 1px solid var(--rule)
- License block top: 3px solid var(--ink)
- Dashed drop zones: 2px dashed var(--rule)
- Fighters "See Full List": 2px dashed var(--gold)

---

## Layout

### Container
Max-width: 960px, centered, padding 32px 24px

### Full-Bleed Breakouts
High-impact sections (masthead, intro bar, victory banner) break out to full viewport width. Use .full-bleed on masthead, .full-bleed-edge on dark-background bars with padding: 22px max(32px, calc(50vw - 460px)).

---

## Page Structure

Every MFM page follows this skeleton:

- MASTHEAD (full-bleed): kicker > HEADLINE > puzzle tag > puzzle name > subtitle > dateline
- INTRO BAR (full-bleed-edge, ink bg): hook text, strong = gold
- MAIN CONTENT
- VICTORY BANNER (full-bleed-edge): message, source links, Share, More Puzzles
- BUTTON ROW: Reset Puzzle + Share Puzzle + More Puzzles
- SHARE & FOLLOW: section head + puzzle suggestion CTA + social buttons
- INSPIRED BY: 5 numbered link cards (identical across all puzzles)
- PRO-DEMOCRACY FIGHTERS: ink-bg header + 9 fighter cards (open by default) + gold "See the Full List" button
- LICENSE BLOCK: LICENSE tag + CREDIT tag

---

## Key Components

### Puzzle Branding (in masthead)
Format: "Puzzle #N" in a JetBrains tag (ink bg, paper text), "Episode Name" in Playfair italic red below it.

**Heading semantics (SEO — non-negotiable).** Exactly **one `<h1>` per page**, and it must be **unique** = the puzzle/page name (the episode name), never the series wordmark. The big "FOLLOW THE MONEY" / "JUST THE FACTS" wordmark is a brand mark, not a heading — mark it up as `<div class="wordmark">` (CSS targets `.masthead .wordmark`), and make the episode-name element the `<h1 class="episode-name">`. Do NOT make the shared series wordmark the `<h1>` — 13 puzzles once shared an identical `<h1>FOLLOW THE MONEY</h1>` and it diluted every page's heading signal (fixed 2026-06-24).

### Public Comment CTA (open-rulemaking puzzles)
Reusable, **data-driven, optional** block for puzzles tied to an open public-comment period (e.g. a proposed federal rule). Ink bg / gold accent, intro-bar family; full-bleed bar placed below the victory/complete reveal, above the button row. Renders only when the puzzle data carries `commentUrl` + `commentDeadline`.
- Pure-JS live countdown reads `data-deadline`; auto-flips to a **closed** state past it (no manual edit ever).
- Closed state fetches `/data/comment-counts.json` same-origin and shows a POSTED comment count — labelled **"comments posted," never "received."** The count is a **bonus layer**: if the JSON is missing/null/errors, the closed state still renders with a working link. The number is never load-bearing.
- Server side: a scheduled GitHub Action (`comment-counts.yml`) writes the JSON; needs the `REGULATIONS_GOV_API_KEY` secret. The `/data/*` netlify 404 needs a per-file allow-rule so the JSON serves. Reference implementation: `just-the-facts/who-spends-your-money/`. See `netlify-deploy` skill.

### Button Row
Three actions: Reset (outline), Share (filled ink, red hover), More Puzzles (outline, gold hover). "More Puzzles" links to the root index (`/`) on `followthemoney.moralfibermedia.com`.

### Fighters Section
Ink-background header (3px ink border, paper-color label + italic muted teaser) sits above a grid of 9 fighter cards (auto-fill, min 260px columns, 1.5px rule border per card, ink icon block on the left). The section is **open by default** — no toggle. Below the grid: a prominent gold-filled "See the Full List →" button (3px gold border, Playfair 16/900) that links to `/fighters`. Hover state on the button shifts to red. The same 9 fighters appear across every puzzle for series consistency — to refresh the lineup, edit them once and propagate.

### Inspired By
Five numbered link cards (rotating ink/red number badge, Playfair bold title, italic muted description, JetBrains mono URL). Editorial intent: these are organizations the FactPuzzles series itself is inspired by — civic-action, accountability, and democracy-research orgs — not arbitrary mentions. Identical across every puzzle.

### License Block
- LICENSE tag (ink bg): license name + deed link
- CREDIT tag (muted bg): "Created by Moral Fiber Media + Data from [source]"

### Zero-Spend Tile (bar-chart puzzles)
When a company made **no direct federal contributions** in the puzzle's cycle, the chart card replaces its bar rows with an editorial empty state — silence is the political statement, not missing data. Use `.bar-chart.zero-spend` with two `.zero-spend-rule` ink hairlines bracketing a `.zero-spend-message` in Source Serif italic at full ink color (not muted gray). The `card-total` stays at "$0". Reference: `template/puzzle-template-barchart.html` (CSS block + commented HTML example just above `<div class="charts-grid">`). Data schema in `data/puzzles.json` flags this with `"zero_spend": true` and `"zero_spend_message": "..."`. The OG preview equivalent (`preview.json`) uses `"zeroSpend": true` on the chart entry.

---

## Social Channels

Always include when Share & Follow is present:

- YouTube: https://www.youtube.com/@MoralFiberMedia
- TikTok: https://www.tiktok.com/@moralfibermedia
- Bluesky: https://bsky.app/profile/moralfibermedia.bsky.social
- Sez.us: https://sez.us/user/MoralFiberMedia
- Substack: https://moralfibermedia.com

Label the last one "Substack" (not "Newsletter").

---

## Licensing

### MFM original content
CC BY 4.0. Use for: episodes, infographics, fighters index, any page without third-party SA-licensed data.
Link: https://creativecommons.org/licenses/by/4.0/

### When using ShareAlike (SA) third-party data
The entire derivative work inherits the more restrictive license. You cannot split licenses — the SA clause means the whole piece inherits CC BY-NC-SA 3.0.

OpenSecrets data is CC BY-NC-SA 3.0.
- Credit page: https://www.opensecrets.org/open-data/credit-opensecrets
- Every Follow the Money puzzle using OpenSecrets data is CC BY-NC-SA 3.0
- Credit: "Created by Moral Fiber Media + Data from OpenSecrets.org"

---

## Site Architecture

**Single-site monorepo.** All pages deploy from one GitHub repo (`moralfibermedia/follow-the-money`) as **one Netlify site at `followthemoney.moralfibermedia.com`**, served as paths under that domain. (An older multi-subdomain layout — `hardware-giants.moralfibermedia.com`, etc. — is **deprecated**; do not use per-puzzle subdomains. `puzzles.moralfibermedia.com` is a legacy CNAME that resolves to the same site, but the canonical host is `followthemoney.moralfibermedia.com` — use it for every canonical/OG/cross-link URL.)

- `/` — Puzzle index (repo `index.html`)
- `/puzzles/{slug}/` — Follow the Money bar-chart + special-edition puzzles
- `/just-the-facts/{slug}/` — **Just the Facts** text-match series (non-OpenSecrets, CC BY 4.0)
- `/fighters/` — Pro-Democracy Fighters directory
- `/legal/` — Privacy & Terms

Deployment, the full site map, and the new-puzzle checklist live in the `netlify-deploy` skill.

### Navigation links (all absolute, single domain)
- Each puzzle: "More Puzzles" in button row + victory banner -> `/` (root index)
- Each puzzle: "See the Full List" in fighters section -> `/fighters`
- Fighters directory: "Back to Puzzles" -> `/`
- Puzzle index: "Play Now" buttons -> `/puzzles/{slug}` (or `/just-the-facts/{slug}`)

### Architecture principles
- Each page is a complete, standalone HTML file — no external CSS/JS, no build step
- The editorial design skill is the consistency layer — shared at build time, not runtime
- Duplication across files is intentional resilience, not tech debt
- Consider migrating to Eleventy (11ty) with shared partials at ~15-20 pages

---

## Animation

- Page load: fadeIn with staggered delays (0.1s increments)
- Bars/charts: CSS transitions, 0.8s cubic-bezier ease on width
- Hover: 0.15-0.2s transitions
- Wrong/error: shake keyframe (translateX +/-8px, 0.5s)
- Victory: scale-up entrance (0.95 to 1, 0.6s) + smooth scroll to center after 200ms delay
- Confetti: gravity-fall keyframes with random rotation
- Fighters toggle: arrow rotates 180 degrees, list animates via max-height (0.4s)

---

## Responsive

- Max-width container: 960px, padding 32px 24px
- Full-bleed sections stretch to viewport edges on wide screens
- Cards grid collapses to single column at 700px
- Social buttons: flex-wrap with flex-grow; column at 500px
- Company tiles: 160x110 desktop, 120x85 mobile
- Font clamps handle headline scaling automatically
- Always test at iPhone SE width (375px)

---

## Editorial Voice

- **Direct**: "Your comment is legally binding." Not "Consider submitting a comment."
- **Evidence-first**: Every claim sourced.
- **Compressed**: 80%+ reduction from source material.
- **Transparent**: "I listen in on these meetings so you don't have to."
- **Closing kickers**: Tight, evidence-adjacent, one sentence. Not preachy.
- **Puzzle hooks**: Lead with the consumer decision, not the category. "Weekend DIY" not "The hardware store bracket."
- **Signature thread**: Check the Facts > Match Company to Fact > Dive Deeper

---

## Checklist Before Shipping

- All three fonts loading from Google Fonts
- CSS variables used consistently (no hardcoded colors)
- Borders at 3px on major containers
- Masthead: kicker > headline > puzzle tag > puzzle name > subtitle > dateline
- Full-bleed applied to masthead, intro bar, victory banner
- All external links open in new tabs
- Social links point to current handles (5 platforms)
- Correct license (CC BY 4.0 for original, CC BY-NC-SA 3.0 for OpenSecrets derivatives)
- Moral Fiber Media links to moralfibermedia.com
- "More Puzzles" points to the root index (`/`) on followthemoney.moralfibermedia.com
- "See the Full List" points to `/fighters`
- Exactly one `<h1>` per page = the unique puzzle/episode name (series wordmark is a `.wordmark` div, NOT the h1)
- JSON-LD present (`BreadcrumbList` + `Quiz`), with the correct per-page license (CC BY-NC-SA 3.0 for OpenSecrets puzzles, CC BY 4.0 for original)
- New page URL added to `/sitemap.xml`
- Fighters section present with current featured fighters
- Victory banner smooth-scrolls into view
- All buttons say "puzzle" not "game"
- Mobile tested at 375px
- No generic AI fonts (Inter, Roboto, Arial, system-ui)
- Any zero-spend company uses the `.bar-chart.zero-spend` tile (not an inline-styled bar row) so the empty state reads as editorial, not missing data

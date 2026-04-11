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
- INSPIRED BY: numbered link list
- PRO-DEMOCRACY FIGHTERS: expandable toggle, 3-4 featured + "See Full List"
- LICENSE BLOCK: LICENSE tag + CREDIT tag

---

## Key Components

### Puzzle Branding (in masthead)
Format: "Puzzle #N" in a JetBrains tag (ink bg, paper text), "Episode Name" in Playfair italic red below it.

### Button Row
Three actions: Reset (outline), Share (filled ink, red hover), More Puzzles (outline, gold hover). Links to puzzles.moralfibermedia.com.

### Fighters Expandable Section
Toggle button (3px ink border) expands a grid of fighter cards. Features 3-4 named fighters + gold dashed "See the Full List" link to fighters.moralfibermedia.com. Content can vary per puzzle. Arrow rotates 180 degrees on open.

### License Block
- LICENSE tag (ink bg): license name + deed link
- CREDIT tag (muted bg): "Created by Moral Fiber Media + Data from [source]"

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

Single-file HTML pages deployed as individual Netlify sites with Squarespace DNS subdomains:

- puzzles.moralfibermedia.com — Puzzle index
- hardware-giants.moralfibermedia.com — Puzzle #1
- grocery-run.moralfibermedia.com — Puzzle #2
- your-whole-paycheck.moralfibermedia.com — Puzzle #3
- fighters.moralfibermedia.com — Pro-Democracy Fighters directory

### Navigation links
- Each puzzle: "More Puzzles" in button row + victory banner -> puzzle index
- Each puzzle: "See the Full List" in fighters section -> fighters directory
- Fighters directory: "Back to Puzzles" -> puzzle index
- Puzzle index: "Play Now" buttons -> each puzzle subdomain

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
- "More Puzzles" points to puzzles.moralfibermedia.com
- "See the Full List" points to fighters.moralfibermedia.com
- Fighters section present with current featured fighters
- Victory banner smooth-scrolls into view
- All buttons say "puzzle" not "game"
- Mobile tested at 375px
- No generic AI fonts (Inter, Roboto, Arial, system-ui)

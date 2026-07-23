---
name: netlify-deploy
description: Step-by-step deployment of static HTML/CSS/JS files to Netlify with GitHub integration and custom domain configuration on moralfibermedia.com via Squarespace DNS. Use this skill whenever the user wants to publish, deploy, update, or host any file or project to Netlify — including first-time deploys, pushing updates to a live site, or troubleshooting the Netlify site. Also triggers for questions like "how do I make this live", "push this to Netlify", "update the live site", or "deploy this puzzle".
---

# Netlify Deployment — Moral Fiber Media

## Overview

MFM uses a single-site monorepo architecture: one GitHub repo (`moralfibermedia/follow-the-money`) deployed as one Netlify site at `followthemoney.moralfibermedia.com`. All pages are served as paths under that domain.

**Stack:** Eleventy 3 (src/ → `npm run build` → `_site/`) → GitHub → Netlify auto-deploy (build command `npm run build`, publish `_site`, Node 20) → Squarespace CNAME → followthemoney.moralfibermedia.com. **Pages are generated from `data/puzzles.json`** — see CLAUDE.md Common Tasks; never hand-edit page HTML.

---

## Site Map

All pages are served from one Netlify site at `followthemoney.moralfibermedia.com`. `data/puzzles.json` is the source of truth — when in doubt, read it.

| Page | Path | Repo folder |
|------|------|-------------|
| Puzzle index (home) | `/` | `index.html` (repo root) |
| Puzzle #1: Hardware Giants | `/puzzles/hardware-giants/` | `puzzles/hardware-giants/` |
| Puzzle #2: Grocery Run | `/puzzles/grocery-run/` | `puzzles/grocery-run/` |
| Puzzle #3: Your Whole Paycheck | `/puzzles/your-whole-paycheck/` | `puzzles/your-whole-paycheck/` |
| Puzzle #4: Can You Hear Me Now? | `/puzzles/can-you-hear-me-now/` | `puzzles/can-you-hear-me-now/` |
| Puzzle #5: Stream Wars | `/puzzles/stream-wars/` | `puzzles/stream-wars/` |
| Puzzle #6: Fill 'Er Up | `/puzzles/fill-er-up/` | `puzzles/fill-er-up/` |
| Puzzle #7: Who Owns Your Feed? | `/puzzles/who-owns-your-feed/` | `puzzles/who-owns-your-feed/` |
| Puzzle #8: Morning Fix | `/puzzles/morning-fix/` | `puzzles/morning-fix/` |
| Puzzle #9: Now Boarding | `/puzzles/now-boarding/` | `puzzles/now-boarding/` |
| Puzzle #11: Office Supplies | `/puzzles/office-supplies/` | `puzzles/office-supplies/` |
| Special Edition: Georgia on My Mind | `/puzzles/georgia-on-my-mind/` | `puzzles/georgia-on-my-mind/` |
| Special Edition: Behind the Bench | `/puzzles/behind-the-bench/` | `puzzles/behind-the-bench/` |
| Just the Facts: Who Spends Your Money? | `/just-the-facts/who-spends-your-money/` | `just-the-facts/who-spends-your-money/` |
| Report: 2026 GA Election Bills | `/2026-ga-elections-legislation/` | `2026-ga-elections-legislation/` |
| Fighters index | `/fighters/` | `fighters/` |
| Legal / Privacy | `/legal/` | `legal/` |
| DOJ Bar Rule Infographic | `/doj/bar-rule-infographic/` | `doj/bar-rule-infographic/` |
| DOJ Bar Rule Action | `/doj/bar-rule-action/` | `doj/bar-rule-action/` |

Numbers reflect editorial order, not release order — gaps (e.g. #10) are normal when later-numbered puzzles ship first. Keep numbers stable once assigned; never renumber a live puzzle (URLs and PR history depend on them).

**GitHub repo:** moralfibermedia/follow-the-money
**Git email:** mf@moralfibermedia.com
**Git username:** moralfibermedia

---

## Repo Structure

```
follow-the-money/
├── index.html           ← puzzle index (site homepage)
├── preview.png          ← OG image for homepage
├── robots.txt           ← site-wide, allow search engines, block AI scrapers
├── _headers             ← site-wide X-Robots-Tag: noai, noimageai
├── netlify.toml         ← publish dir + redirect rules
├── puzzles/
│   ├── hardware-giants/
│   │   ├── index.html
│   │   └── preview.png
│   ├── grocery-run/
│   │   ├── index.html
│   │   └── preview.png
│   └── ...
├── fighters/
│   ├── index.html
│   └── preview.png
├── legal/
│   ├── index.html
│   └── preview.png
├── doj/
│   ├── bar-rule-infographic/
│   │   ├── index.html
│   │   └── preview.png
│   └── bar-rule-action/
│       ├── index.html
│       └── preview.png
├── data/                ← workspace only (blocked by netlify.toml)
├── template/            ← workspace only (blocked by netlify.toml)
├── marketing/           ← social/newsletter post drafts, workspace only (blocked)
└── scripts/             ← workspace only (blocked by netlify.toml)
```

`robots.txt` and `_headers` live at the repo root only — they apply site-wide.

**Post-migration (July 2026) essentials:** sources in `src/` (layouts `src/_includes/`, shared CSS/JS `src/assets/`, data plumbing `src/_data/`); all puzzle pages + index + `/fighters/` + `/legal/` + `sitemap.xml` are build outputs. Passthrough verbatim: `doj/`, `2026-ga-elections-legislation/`, `review/`, `drafts/` (if present), preview art (`**/preview.png|json`), `_headers`, `robots.txt`, `data/comment-counts.json` (the Action-written feed — must keep serving). Arcade archive at `/v1/` + `/compare/` (both noindex). Netlify Forms (`review-desk-done`, `design-feedback`) live in served HTML — keep the static form markup or detection breaks at deploy. A broken build blocks deploys: verify `npx eleventy` locally and rely on deploy previews + one-click rollback.

**Blocked from serving (`netlify.toml` `force = true` 404s):** `/data/*` (except `comment-counts.json`), `/template/*`, `/scripts/*`, `/index/*`, `/.claude/*`, `/vision/*`, `/marketing/*`. **Gotcha:** the repo root publishes as-is, so root-level `.md` files ARE served by default. Internal docs (`CLAUDE.md`, `follow-the-money-roadmap.md`, `follow-the-money-vision.md`, `claude-code-spec.md`) are individually 404'd in `netlify.toml`; `LICENSE` and `README.md` stay public. **When you add a new internal root doc, block it there or it goes live.**

---

## Workflow A: Add a New Puzzle

### 1. Create the puzzle folder

```bash
mkdir -p puzzles/new-puzzle-slug
```

### 2. Build the page

- Create `puzzles/new-puzzle-slug/index.html` from template (`template/puzzle-template-barchart.html` for bar-chart puzzles, `template/puzzle-template-text.html` for text-match)
- For bar-chart puzzles: if any company made **no direct federal contributions** in the cycle, use the `.bar-chart.zero-spend` variant defined in the template (HTML example is in a comment just above `<div class="charts-grid">`). Mirror the data side: `"zero_spend": true` + `"zero_spend_message"` in `data/puzzles.json`, `"zeroSpend": true` in `preview.json`. Silence is a political statement — render it as editorial weight, not muted/missing.
- Generate `puzzles/new-puzzle-slug/preview.png` (1200x630) via the `fact-puzzle-preview` skill

### 3. Set URLs in the HTML

All cross-links use absolute URLs on the single domain:

```html
<link rel="canonical" href="https://followthemoney.moralfibermedia.com/puzzles/new-puzzle-slug">
<meta property="og:url" content="https://followthemoney.moralfibermedia.com/puzzles/new-puzzle-slug">
<meta property="og:image" content="https://followthemoney.moralfibermedia.com/puzzles/new-puzzle-slug/preview.png">
<meta name="twitter:image" content="https://followthemoney.moralfibermedia.com/puzzles/new-puzzle-slug/preview.png">
```

Navigation links:
- More Puzzles → `https://followthemoney.moralfibermedia.com`
- Fighters list → `https://followthemoney.moralfibermedia.com/fighters`
- Privacy & Terms → `https://followthemoney.moralfibermedia.com/legal`
- Substack → `https://moralfibermedia.com` (external, different site)

### 4. Update the puzzle index

Add a new card to `index.html` (repo root) with a link to `/puzzles/new-puzzle-slug/`.

### 5. Commit and push

```bash
git add puzzles/new-puzzle-slug/ index.html
git commit -m "Add new puzzle: [name]"
git push
```

Netlify auto-deploys from main. Changes are live within 30-60 seconds.

---

## Workflow B: Push Updates

```bash
git add [changed files]
git commit -m "Description of changes"
git push
```

One push deploys all changes across all pages simultaneously. No need to push to multiple repos.

---

## Workflow C: First-Time Netlify Setup

This only needs to be done once for the entire site.

### 1. Push repo to GitHub

```bash
git remote add origin https://github.com/moralfibermedia/follow-the-money.git
git push -u origin main
```

### 2. Create Netlify site

- Log into app.netlify.com
- "Add new site" → "Import an existing project"
- Connect to GitHub → Select `moralfibermedia/follow-the-money`
- Build command: (blank)
- Publish directory: `.`
- Deploy

### 3. Add custom domain

In Netlify → Site settings → Domain management:
- Click "Add domain alias"
- Enter: `followthemoney.moralfibermedia.com`

In Squarespace → Domains → moralfibermedia.com → DNS Settings:
- Add CNAME record:
  - Host: `followthemoney`
  - Value: `[site-name].netlify.app`
  - TTL: default

### 4. SSL

Back in Netlify → Domain management → HTTPS:
- Click "Verify DNS configuration"
- SSL provisions automatically via Let's Encrypt

### 5. DNSSEC considerations

If DNSSEC is enabled on Squarespace:
- New CNAME records may take longer to propagate (minutes to hours)
- If the subdomain doesn't resolve, try:
  1. Flush Google DNS cache at https://developers.google.com/speed/public-dns/cache
  2. Flush the main domain first (moralfibermedia.com, type A), then the subdomain (type CNAME)
  3. Wait 30-60 minutes and try again

**Auth note:** Use a Personal Access Token (PAT, prefixed `ghp_`) for HTTPS pushes on Mac. If you get a 403, update credentials in Keychain Access.

---

## Shared Files Reference

### robots.txt (repo root, site-wide)

```
# Allow search engines, block AI scrapers
User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

User-agent: DuckDuckBot
Allow: /

User-agent: GPTBot
Disallow: /

User-agent: ChatGPT-User
Disallow: /

User-agent: Google-Extended
Disallow: /

User-agent: CCBot
Disallow: /

User-agent: anthropic-ai
Disallow: /

User-agent: ClaudeBot
Disallow: /

User-agent: FacebookBot
Disallow: /

User-agent: Bytespider
Disallow: /

User-agent: Perplexitybot
Disallow: /

User-agent: Diffbot
Disallow: /

User-agent: Applebot-Extended
Disallow: /

User-agent: *
Allow: /
```

### _headers (repo root, site-wide)

```
/*
  X-Robots-Tag: noai, noimageai
```

### netlify.toml (repo root)

Blocks access to workspace-only folders (`data/`, `template/`, `scripts/`, `index/`, `.claude/`, `vision/`) with `status = 404, force = true` redirects.

**Serving one file out of a blocked folder:** if a page needs to `fetch()` a file under `data/` at runtime (e.g. the Public Comment CTA reads `/data/comment-counts.json`), add a per-file allow-rule **above** the `/data/*` block — Netlify uses first-match-wins:

```toml
[[redirects]]
  from = "/data/comment-counts.json"
  to = "/data/comment-counts.json"
  status = 200
# ...then the existing /data/* 404 force rule below it
```

### Scheduled data (GitHub Actions)

`.github/workflows/comment-counts.yml` refreshes `data/comment-counts.json` daily from regulations.gov (POSTED comment counts for the Public Comment CTA). It **needs repo secret `REGULATIONS_GOV_API_KEY`** (free at api.data.gov/signup), set in GitHub → Settings → Secrets and variables → Actions. Without it the Action no-ops and the CTA degrades gracefully. The Action fails soft (never writes null/0) and commits only on change as `moralfibermedia`.

---

## Troubleshooting

### 403 on git push
- Wrong GitHub account cached in macOS Keychain
- Fix: update credentials in Keychain Access or erase and re-enter
- Verify: `git remote -v` should show `moralfibermedia/follow-the-money`

### 404 on a puzzle page
- File must be named `index.html` inside its folder
- Check the folder path matches the URL path
- Check Netlify deploy log for errors

### SSL not provisioning
- Click "Verify DNS configuration" in Netlify (triggers provisioning)
- DNS must resolve before SSL can be issued
- If stuck, try "Renew certificate"

### Commits showing wrong author
- Set per-repo: `git config user.name "moralfibermedia"` and `git config user.email "mf@moralfibermedia.com"`

---

## SEO Tags Per Page

Each page should have in its `<head>`:
- `<title>` — "Follow the Money — [Episode Name] | Moral Fiber Media"
- `<meta name="description">` — unique, 50-160 characters
- `<link rel="canonical">` — `https://followthemoney.moralfibermedia.com/path/`
- Open Graph tags: og:title, og:description, og:url, og:image, og:site_name, og:type
- Twitter Card: summary_large_image with title, description, image
- OG image: absolute URL `https://followthemoney.moralfibermedia.com/path/preview.png`

See mfm-editorial-design skill for full SEO tag specification.

---

## New Puzzle Deployment Checklist

- [ ] HTML file built and tested locally
- [ ] Placed at `puzzles/{slug}/index.html`
- [ ] Preview image (1200x630) at `puzzles/{slug}/preview.png`
- [ ] SEO meta tags present with correct absolute URLs
- [ ] Exactly one unique `<h1>` (the puzzle name); JSON-LD (`BreadcrumbList` + `Quiz`) present
- [ ] All cross-links correct (More Puzzles → root, See Full List → /fighters/, Privacy → /legal/)
- [ ] Puzzle index (`index.html` at root) updated with new card
- [ ] New URL added to `/sitemap.xml` (root)
- [ ] Committed and pushed to GitHub
- [ ] OG preview tested at opengraph.xyz
- [ ] Site map in this skill updated

---
name: netlify-deploy
description: Step-by-step deployment of static HTML/CSS/JS files to Netlify with GitHub integration and custom domain configuration on moralfibermedia.com via Squarespace DNS. Use this skill whenever the user wants to publish, deploy, update, or host any file or project to Netlify — including first-time deploys, pushing updates to a live site, or troubleshooting the Netlify site. Also triggers for questions like "how do I make this live", "push this to Netlify", "update the live site", or "deploy this puzzle".
---

# Netlify Deployment — Moral Fiber Media

## Overview

MFM uses a single-site monorepo architecture: one GitHub repo (`moralfibermedia/follow-the-money`) deployed as one Netlify site at `follow-the-money.moralfibermedia.com`. All pages are served as paths under that domain.

**Stack:** Static HTML monorepo → GitHub → Netlify auto-deploy → Squarespace CNAME → follow-the-money.moralfibermedia.com

---

## Site Map

All pages are served from one Netlify site at `follow-the-money.moralfibermedia.com`:

| Page | Path | Repo folder |
|------|------|-------------|
| Puzzle index (home) | `/` | `index.html` (repo root) |
| Puzzle #1: Hardware Giants | `/puzzles/hardware-giants/` | `puzzles/hardware-giants/` |
| Puzzle #2: Grocery Run | `/puzzles/grocery-run/` | `puzzles/grocery-run/` |
| Puzzle #3: Whole Paycheck | `/puzzles/your-whole-paycheck/` | `puzzles/your-whole-paycheck/` |
| Puzzle #4: Telecom | `/puzzles/can-you-hear-me-now/` | `puzzles/can-you-hear-me-now/` |
| Special Edition: Georgia | `/puzzles/georgia-on-my-mind/` | `puzzles/georgia-on-my-mind/` |
| Fighters index | `/fighters/` | `fighters/` |
| Legal / Privacy | `/legal/` | `legal/` |
| DOJ Bar Rule Infographic | `/doj/bar-rule-infographic/` | `doj/bar-rule-infographic/` |
| DOJ Bar Rule Action | `/doj/bar-rule-action/` | `doj/bar-rule-action/` |

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
└── scripts/             ← workspace only (blocked by netlify.toml)
```

`robots.txt` and `_headers` live at the repo root only — they apply site-wide.

---

## Workflow A: Add a New Puzzle

### 1. Create the puzzle folder

```bash
mkdir -p puzzles/new-puzzle-slug
```

### 2. Build the page

- Create `puzzles/new-puzzle-slug/index.html` from template
- Generate `puzzles/new-puzzle-slug/preview.png` (1200x630)

### 3. Set URLs in the HTML

All cross-links use absolute URLs on the single domain:

```html
<link rel="canonical" href="https://follow-the-money.moralfibermedia.com/puzzles/new-puzzle-slug">
<meta property="og:url" content="https://follow-the-money.moralfibermedia.com/puzzles/new-puzzle-slug">
<meta property="og:image" content="https://follow-the-money.moralfibermedia.com/puzzles/new-puzzle-slug/preview.png">
<meta name="twitter:image" content="https://follow-the-money.moralfibermedia.com/puzzles/new-puzzle-slug/preview.png">
```

Navigation links:
- More Puzzles → `https://follow-the-money.moralfibermedia.com`
- Fighters list → `https://follow-the-money.moralfibermedia.com/fighters`
- Privacy & Terms → `https://follow-the-money.moralfibermedia.com/legal`
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
- Enter: `follow-the-money.moralfibermedia.com`

In Squarespace → Domains → moralfibermedia.com → DNS Settings:
- Add CNAME record:
  - Host: `follow-the-money`
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

Blocks access to workspace-only folders (`data/`, `template/`, `scripts/`, `index/`, `.claude/`, `vision/`).

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
- `<link rel="canonical">` — `https://follow-the-money.moralfibermedia.com/path/`
- Open Graph tags: og:title, og:description, og:url, og:image, og:site_name, og:type
- Twitter Card: summary_large_image with title, description, image
- OG image: absolute URL `https://follow-the-money.moralfibermedia.com/path/preview.png`

See mfm-editorial-design skill for full SEO tag specification.

---

## New Puzzle Deployment Checklist

- [ ] HTML file built and tested locally
- [ ] Placed at `puzzles/{slug}/index.html`
- [ ] Preview image (1200x630) at `puzzles/{slug}/preview.png`
- [ ] SEO meta tags present with correct absolute URLs
- [ ] All cross-links correct (More Puzzles → root, See Full List → /fighters/, Privacy → /legal/)
- [ ] Puzzle index (`index.html` at root) updated with new card
- [ ] Committed and pushed to GitHub
- [ ] OG preview tested at opengraph.xyz
- [ ] Site map in this skill updated

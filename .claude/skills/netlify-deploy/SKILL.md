---
name: netlify-deploy
description: Step-by-step deployment of static HTML/CSS/JS files to Netlify with GitHub integration and custom subdomain configuration on moralfibermedia.com via Squarespace DNS. Use this skill whenever the user wants to publish, deploy, update, or host any file or project to Netlify — including first-time deploys, pushing updates to a live site, adding a custom domain or subdomain, or troubleshooting a Netlify site. Also triggers for questions like "how do I make this live", "push this to Netlify", "add a subdomain for this", "update the live site", or "deploy this puzzle".
---

# Netlify Deployment — Moral Fiber Media

## Overview

MFM uses a static single-file architecture: standalone HTML pages deployed as individual Netlify sites, each with a custom subdomain on moralfibermedia.com via Squarespace DNS.

**Stack:** Static HTML → GitHub repo → Netlify auto-deploy → Squarespace CNAME → moralfibermedia.com subdomain

---

## Site Registry

Current live sites and their mappings:

| Site | Netlify app | GitHub repo | Subdomain |
|------|------------|-------------|-----------|
| Puzzle index | follow-the-money-index.netlify.app | follow-the-money-index | follow-the-money-index.moralfibermedia.com |
| Puzzle #1 | follow-the-hardware-giants-money.netlify.app | follow-the-hardware-giants-money | follow-the-hardware-giants-money.moralfibermedia.com |
| Puzzle #2 | follow-the-money-grocery.netlify.app | follow-the-money-grocery | follow-the-money-grocery.moralfibermedia.com |
| Puzzle #3 | follow-the-money-whole-paycheck.netlify.app | follow-the-money-whole-paycheck | follow-the-money-whole-paycheck.moralfibermedia.com |
| Puzzle #4 | follow-the-money-telecom.netlify.app | follow-the-money-telecom | follow-the-money-telecom.moralfibermedia.com |
| Special Edition | follow-the-money-georgia.netlify.app | follow-the-money-georgia | follow-the-money-georgia.moralfibermedia.com |
| Fighters | fighters-index.netlify.app | fighters-index | fighters-index.moralfibermedia.com |
| Legal | legal.netlify.app | legal | legal.moralfibermedia.com |

**GitHub org:** moralfibermedia
**Git email:** mf@moralfibermedia.com
**Git username:** moralfibermedia

---

## Repo Structure

Every site follows this structure:

```
repo-name/
├── index.html       ← the page (renamed from descriptive filename)
├── preview.png      ← 1200x630 OG preview image
├── robots.txt       ← allow search engines, block AI scrapers
└── _headers         ← X-Robots-Tag: noai, noimageai
```

The `robots.txt` and `_headers` files are identical across all sites.

---

## Workflow A: First Deploy (New Site)

### 1. Prepare files locally

```bash
mkdir site-name
cd site-name

# Copy/rename the HTML file
cp /path/to/follow-the-money-whatever.html index.html

# Copy/rename the preview image
cp /path/to/preview-whatever.png preview.png

# Copy shared files (same for every site)
cp /path/to/robots.txt .
cp /path/to/_headers .
```

### 2. Set up Git

```bash
git init
git config user.name "moralfibermedia"
git config user.email "mf@moralfibermedia.com"
git add .
git commit -m "First deploy of [descriptive name]"
```

### 3. Create GitHub repo

Go to github.com/moralfibermedia → New Repository:
- Name: `site-name` (match the Netlify site name)
- Public
- Do NOT initialize with README (you already have files)

```bash
git branch -M main
git remote add origin https://github.com/moralfibermedia/site-name.git
git push -u origin main
```

**Auth note:** Use a Personal Access Token (PAT, prefixed `ghp_`) for HTTPS pushes on Mac. If you get a 403, the Keychain may have cached old credentials — update them in Keychain Access or use:
```bash
git credential-osxkeychain erase
host=github.com
protocol=https
```

### 4. Connect Netlify

- Log into app.netlify.com
- "Add new site" → "Import an existing project"
- Connect to GitHub → Select the `moralfibermedia/site-name` repo
- Build settings: leave blank (no build command needed for static files)
- Deploy

### 5. Add custom subdomain

In Netlify → Site settings → Domain management:
- Click "Add domain alias"
- Enter: `site-name.moralfibermedia.com`
- Netlify will say "Check DNS configuration"

In Squarespace → Domains → moralfibermedia.com → DNS Settings:
- Add CNAME record:
  - Host: `site-name` (just the subdomain prefix)
  - Value: `site-name.netlify.app`
  - TTL: default

### 6. SSL

Back in Netlify → Domain management → HTTPS:
- Click "Verify DNS configuration"
- SSL provisions automatically via Let's Encrypt
- No separate manual step needed

### 7. DNSSEC considerations

If DNSSEC is enabled on Squarespace:
- New CNAME records may take longer to propagate (minutes to hours)
- If the subdomain doesn't resolve, try:
  1. Flush Google DNS cache at https://developers.google.com/speed/public-dns/cache
  2. Flush the main domain first (moralfibermedia.com, type A), then the subdomain (type CNAME)
  3. Wait 30-60 minutes and try again
- In extreme cases, temporarily disable DNSSEC, add the record, wait for propagation, then re-enable

### 8. Verify

- Check `site-name.netlify.app` loads
- Check `site-name.moralfibermedia.com` loads
- Check HTTPS is active (padlock icon)
- Test OG preview: paste URL into https://www.opengraph.xyz/

---

## Workflow B: Push Updates to a Live Site

```bash
cd site-name

# Make your changes to index.html (or other files)

git add .
git commit -m "Description of changes"
git push
```

Netlify auto-deploys from main branch. Changes are live within 30-60 seconds of push.

**If pushing updates to multiple sites** (e.g., updating social links or fighters list across all puzzles), repeat for each repo. This is the main pain point of the single-file architecture — shared changes must be pushed individually. Consider Eleventy migration at ~15-20 sites.

---

## Workflow C: Adding a Custom Subdomain to an Existing Site

1. In Netlify → Site settings → Domain management → "Add domain alias"
2. Enter: `new-subdomain.moralfibermedia.com`
3. In Squarespace DNS → Add CNAME: `new-subdomain` → `site-name.netlify.app`
4. Back in Netlify → HTTPS → "Verify DNS configuration"
5. Wait for SSL provisioning

---

## Shared Files Reference

### robots.txt (same for all sites)

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

### _headers (same for all sites)

```
/*
  X-Robots-Tag: noai, noimageai
```

---

## Troubleshooting

### 403 on git push
- Wrong GitHub account cached in macOS Keychain
- Fix: update credentials in Keychain Access or erase and re-enter
- Verify: `git remote -v` should show `moralfibermedia/repo-name`

### Site deploys but subdomain doesn't resolve
- CNAME not propagated yet — wait 10-60 minutes
- DNSSEC re-signing — flush Google DNS cache, wait
- Wrong CNAME value — must point to `site-name.netlify.app` exactly

### SSL not provisioning
- Click "Verify DNS configuration" in Netlify (triggers provisioning)
- DNS must resolve before SSL can be issued
- If stuck, try "Renew certificate"

### 404 on the live site
- File must be named `index.html` — not `follow-the-money-grocery.html`
- Check Netlify deploy log for errors

### Commits showing wrong author
- Set per-repo: `git config user.name "moralfibermedia"` and `git config user.email "mf@moralfibermedia.com"`
- Rewrite history: `git filter-branch --env-filter 'export GIT_AUTHOR_NAME="moralfibermedia" GIT_AUTHOR_EMAIL="mf@moralfibermedia.com" GIT_COMMITTER_NAME="moralfibermedia" GIT_COMMITTER_EMAIL="mf@moralfibermedia.com"' -- --branches --tags && git push --force`

---

## SEO Files Per Site

Each site should have in its `<head>`:
- `<title>` — "Follow the Money — [Episode Name] | Moral Fiber Media"
- `<meta name="description">` — unique, 50-160 characters, names the three companies
- `<link rel="canonical">` — moralfibermedia.com subdomain URL (not netlify.app)
- Open Graph tags: og:title, og:description, og:url, og:image, og:site_name, og:type
- Twitter Card: summary_large_image with title, description, image
- OG image reference: `/preview.png` (served from same deploy folder)

See mfm-editorial-design skill for full SEO tag specification.

---

## New Puzzle Deployment Checklist

- [ ] HTML file built and tested locally
- [ ] File renamed to `index.html`
- [ ] Preview image (1200x630) renamed to `preview.png`
- [ ] `robots.txt` and `_headers` copied into folder
- [ ] SEO meta tags present (title, description, canonical, OG, Twitter)
- [ ] All cross-links correct (More Puzzles → index, See Full List → fighters)
- [ ] Git config set to moralfibermedia / mf@moralfibermedia.com
- [ ] Committed and pushed to GitHub
- [ ] Netlify site created and connected to repo
- [ ] Custom subdomain added in Netlify
- [ ] CNAME added in Squarespace DNS
- [ ] SSL verified in Netlify
- [ ] OG preview tested at opengraph.xyz
- [ ] Puzzle index updated with new card and Play Now link
- [ ] Index page redeployed
- [ ] Site registry in this skill updated

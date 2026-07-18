# marketing/ — social & newsletter post drafts

Working copy for promo content. **Not part of the website.** This whole folder is blocked from serving (`netlify.toml` → `/marketing/*` returns 404), so nothing here is ever web-accessible. Drafts, notes, and campaign copy live here so the repo root stays clean.

## Layout

```
marketing/
  README.md                     ← this file (conventions)
  <campaign>/                    ← one folder per puzzle/campaign
    substack.md                 ← newsletter (long, ~200 words)
    bluesky.md                  ← ≤300 chars incl. URL
    x.md                        ← ≤280 chars (links count as 23)
    facebook.md                 ← 2–4 sentences; OG card does the visual work
    sezus.md                    ← civic microblog; lead with the public-record angle
    tiktok.md                   ← video: on-screen script + caption; link in bio
    youtube.md                  ← Short (title+description) or community post
  announcement/                 ← the series launch announcement
  guides/                       ← production guides (e.g. Canva beat-sync)
```

Not every campaign needs every channel — write the ones you'll actually post to.

## UTM convention (so Netlify Analytics → Top Sources can attribute clicks)

Append to every link that points at the site:

- `utm_source` = the **specific platform**, spelled the same way every time: `substack`, `bluesky`, `x`, `facebook`, `tiktok`, `youtube`, `sezus`. **This is the field you vary per channel.** (A generic `social` bucket can't tell Bluesky from X; UTMs also attribute clicks when the referrer is stripped — which is why so much shows as "Direct.")
- `utm_medium` = the **kind** of channel: `email` for the newsletter, `social` for organic posts.
- `utm_campaign` = **one slug per post**, matching the campaign folder name (e.g. `golden-parachutes`).

Pattern:

```
https://followthemoney.moralfibermedia.com/puzzles/<slug>?utm_source=<platform>&utm_medium=<email|social>&utm_campaign=<campaign>
```

The trailing-slash 301 on `/puzzles/<slug>` preserves the query string, so tracking survives the redirect either way.

## Voice

Direct, evidence-first, punchy — never preachy. Lead with the relatable hook, not the category. Every claim sourced. Signature: *"We do the research. You solve the puzzle."* Full system: the `mfm-editorial-design` skill (see its "Channel-specific posts" section for per-platform format rules).

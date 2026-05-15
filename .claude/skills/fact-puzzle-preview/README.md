# fact-puzzle-preview

Renders the 1200×630 `preview.png` that ships alongside each Follow the Money puzzle's `index.html`. Same image that Facebook, X, LinkedIn, Discord, and opengraph.xyz pick up from the page's Open Graph meta tags.

This is a Claude Code skill — drop the folder into `.claude/skills/` at the root of `moralfibermedia/follow-the-money` and Claude will use it whenever you ask it to make a preview.

## Install

```bash
cd .claude/skills/fact-puzzle-preview
npm install
```

The `postinstall` hook downloads the Chromium binary Playwright needs (one-time, ~150MB). If the auto-install hangs in a CI environment, run `npx playwright install chromium` manually.

## Usage

Each puzzle needs a `preview.json` next to its `index.html`. Schema is in `SKILL.md`. Example in `example.json`.

```bash
# Generate preview.png next to the JSON
node .claude/skills/fact-puzzle-preview/render.mjs puzzles/who-owns-your-feed/preview.json

# Or specify an output path
node .claude/skills/fact-puzzle-preview/render.mjs puzzles/who-owns-your-feed/preview.json -o /tmp/check.png
```

After deploy, validate the social card on https://www.opengraph.xyz/url/<URL> or in the Facebook / X / LinkedIn debuggers.

## Asking Claude Code to do it

Once the skill is installed, you can just say:

> "Regenerate the preview for the morning-fix puzzle."

Claude Code will read `SKILL.md`, find or write the `preview.json`, run `render.mjs`, and confirm the output. If the puzzle data hasn't been captured yet, it will pull the percentages from the puzzle's `index.html` and prompt you to confirm before writing the JSON.

## Bulk regenerate

After a template change (e.g. you tweak typography or move the OpenSecrets chip), every existing preview is stale. Regenerate all of them:

```bash
for f in puzzles/*/preview.json; do
  node .claude/skills/fact-puzzle-preview/render.mjs "$f"
done
```

Commit the regenerated PNGs in a single "refresh previews" commit so git history reflects the template change.

## Offline rendering

The template loads Google Fonts at render time. If you need to build without network (CI without egress, plane), self-host the three fonts:

1. Download Playfair Display (700, 900, 700-italic, 900-italic), Source Serif 4 (300, 400, 600, italic variants), and JetBrains Mono (400, 700) as woff2.
2. Place them in `fonts/` next to `template.html`.
3. Replace the `<link href="https://fonts.googleapis.com/...">` in the template with `@font-face` declarations pointing at the local files.

The downside is committing ~400KB of font files to the repo, which is why the default uses Google Fonts.

## What this does NOT do

- It does not generate the puzzle page itself. That's still hand-built (or built by whatever puzzle generator you've got).
- It does not write the OG meta tags into `index.html`. Those live in the puzzle template and need to be set when the puzzle is created. The meta tag for `og:image` should point at the production canonical URL: `https://followthemoney.moralfibermedia.com/puzzles/<slug>/preview.png`.
- It does not push to Netlify. Commit the PNG; the next deploy preview picks it up.

## Adapting for other puzzle series

When *Just the Facts* or *Say / Do* puzzles need previews, copy this skill folder, rename, and swap `template.html`. Keep `render.mjs` mostly as-is — the JSON schema and CLI surface should stay consistent across series so the user experience doesn't shift.

---
name: fact-puzzle-preview
description: Generate 1200×630 Open Graph preview PNGs for Moral Fiber Media Follow the Money puzzles. Triggers whenever the user asks to create, regenerate, or update a preview image, OG image, social card, or share image for a FactPuzzle, Follow the Money puzzle, or any puzzle in the moralfibermedia.com puzzles/ directory. Also triggers for phrases like "make a preview", "OG image", "social preview", "share image", "preview.png", or when validating/checking how a puzzle URL will look on opengraph.xyz, Facebook, X, LinkedIn, or Discord. Use this skill instead of hand-rolling HTML each time — the template enforces the MFM editorial design system (Playfair Display, Source Serif 4, JetBrains Mono, paper/ink palette) and the OpenSecrets attribution chip.
---

# FactPuzzle Preview Generator

Generates the 1200×630 `preview.png` that ships next to each puzzle's `index.html`. The image is what Facebook, X, LinkedIn, Discord, and opengraph.xyz render when the puzzle URL is shared.

The MFM design system is defined in the `mfm-editorial-design` skill — this skill applies that system to a fixed preview layout. Don't redesign; just feed in the puzzle data.

**Eleventy note (July 2026):** page HTML is generated, but `preview.json`/`preview.png` still live in each puzzle's content dir (`puzzles/{id}/`, series dirs) and are passthrough-copied at build — renderer paths and workflow unchanged. The preview doubles as the in-article figure cover on every page.

## When to use

- User asks to make / regenerate / update a preview for a puzzle
- User shares a puzzle URL and asks to check it on opengraph.xyz or generate a share image
- Building a new puzzle and you've reached the deploy step (preview.png is part of the deliverable, same path as index.html)

## When NOT to use

- The user only wants meta tag updates without a new image. Edit `index.html` directly instead.

## Three renderers — pick by puzzle type

- **Bar-chart / Follow the Money (OpenSecrets):** `render.mjs` + `template.html` — FOLLOW THE MONEY headline, A/B/C bars, OpenSecrets attribution chip. Inputs: the bar-chart `preview.json` documented below.
- **Text-match / Just the Facts (non-OpenSecrets):** `render-text.mjs` — editorial card with the puzzle name, hook, and answer tiles (which don't spoil the matching), no attribution chip. Uses a **different** `preview.json` shape (`episode`, `subjects`, `subtitle`, `matchVerb`, `dataLabel`, `dataSource: null`) — see the header comment in `render-text.mjs`. Run: `node .claude/skills/fact-puzzle-preview/render-text.mjs just-the-facts/<slug>/preview.json`. Reference output: `just-the-facts/who-spends-your-money/`.
- **New mechanics (rank / over-under / timeline) or any puzzle needing a configurable license:** `render-card.mjs` — same editorial card as `render-text.mjs`, but the license badge is **parameterized** (`"license"`) and an OpenSecrets-style gold attribution chip renders when `"dataSource"` is set. Use this for CC BY-NC-SA 3.0 puzzles (OpenSecrets) and any card where CC BY 4.0 isn't the right badge. `preview.json` shape: `kicker`, `episode`, `subjects`, `subtitle`, `matchVerb`, `dataLabel`, `dataSource` (`null` or `"OpenSecrets.org"`), `license`. Reference outputs: `puzzles/golden-parachutes/`, `puzzles/lobby-or-not/`, `puzzles/the-docket/`.

Other future series (Say/Do contradiction, etc.) get their own sibling renderer the same way — copy a renderer, swap the card markup, keep the playwright→sharp toolchain.

## Inputs

One `preview.json` per puzzle, sitting next to `index.html`:

```json
{
  "number": 7,
  "episode": "Who Owns Your Feed?",
  "subjects": ["Facebook", "YouTube", "TikTok"],
  "subjectsNoun": "platforms in your pocket",
  "matchVerb": "Can you match the app to the cash?",
  "charts": [
    { "letter": "A", "dem": 88.8, "rep": 11.2 },
    { "letter": "B", "dem": 90.5, "rep": 9.6 },
    { "letter": "C", "dem": 83.2, "rep": 16.8 }
  ],
  "dataLabel": "2024 Cycle · Federal · Corporate PAC",
  "dataSource": "OpenSecrets.org"
}
```

Field rules:
- `number`: integer 1–99. Renders as zero-padded "07" in the corner stamp. Optional when `special: true`.
- `special`: optional boolean. When `true`, the corner stamp renders as "★" and the puzzle tag reads "Special Edition" instead of "#NN". Use for non-numbered specials like Georgia on My Mind.
- `episode`: the puzzle's display name. Shows in red Playfair italic at 52px (auto-shrinks to 44px above ~22 characters).
- `subjects`: array of 2–4 short brand names. Joined with commas in the hook line.
- `subjectsNoun`: short phrase that follows the brand list. E.g. `"platforms in your pocket"`, `"streaming giants"`, `"morning rituals"`, `"gas stations"`. Plural noun phrase, no leading "Three".
- `matchVerb`: the call to action, full sentence with question mark. Rendered in red.
- `charts`: exactly 3 entries, letters A/B/C, each with `dem` and `rep` percentages. The pair should sum to 100 ±0.2. Order is the order they'll render on the right side.
- `charts[].zeroSpend`: optional boolean. When `true`, the row renders as a hatched "$0 — No Federal Contributions" panel instead of two bars; `dem`/`rep` can be omitted (default 0) and the sum check is skipped. Use this for any company that made zero direct federal contributions in the cycle (e.g. T-Mobile in Puzzle #4). Custom message via `charts[].zeroMessage`.
- `dataLabel`: small caption above the charts. Defaults to `"2024 Cycle · Federal · Corporate PAC"` if omitted.
- `dataSource`: shows in the gold-highlighted attribution chip top-right. Defaults to `"OpenSecrets.org"`. Omit / set to `null` to drop the chip entirely (rare — only for puzzles built on non-OpenSecrets data).

## How to run

From the project root, with the skill installed at `.claude/skills/fact-puzzle-preview/`:

```bash
# one-time setup (or after a clean checkout)
cd .claude/skills/fact-puzzle-preview
npm install

# generate a preview
node .claude/skills/fact-puzzle-preview/render.mjs puzzles/who-owns-your-feed/preview.json
```

Output: `puzzles/who-owns-your-feed/preview.png` at 1200×630.

The script writes the PNG next to the input JSON. If you want it elsewhere, pass `-o /custom/path.png`.

## Verifying the result

1. Open the generated PNG. The headline reads "FOLLOW *THE MONEY*" with the episode name below in red italic. The OpenSecrets chip is top-right (ink background, "Data" muted, source name in gold `#f0c040`). The puzzle number is in the red rotated stamp.
2. Check the three bar charts match the JSON percentages — bar widths and right-side labels should agree.
3. If the episode title overflows two lines, shorten it or accept the auto-shrink. The template hard-stops at 44px.

## Common mistakes to avoid

- **Don't bake the company names into the chart rows.** The whole point is that the preview shows A/B/C *without* revealing the answer, so the puzzle still functions for someone who clicks through from the social card. Subjects go in the hook line only.
- **Don't reorder charts to be tidy.** The chart order in `preview.json` must match the order on the live puzzle page (which is randomized per puzzle but fixed once shipped). If you reorder for visual balance, the social card will lie about the puzzle's actual layout.
- **Don't use percentages that don't sum to 100.** The bars render as raw percentages of the track width, so 47 + 47 will leave a visible gap; 60 + 50 will overflow. Either trust the source data or normalize before writing JSON.
- **Don't change the canvas size.** The OG meta tags declare 1200×630 — if the render comes out at any other size, validators flag it.
- **Don't bypass the chip for OpenSecrets puzzles.** The user has been explicit: when the puzzle is built on OpenSecrets data, the attribution must be visible at every social-card render size, not just in fine print.

## Related skills

- `mfm-editorial-design` — full design system (typography, color, layout patterns). The template in this skill is one application of it; read the design system if anything needs to change.
- `netlify-deploy` — once the PNG is generated and committed, the deploy preview rebuild picks it up automatically.

## Troubleshooting

- **"Cannot find module 'playwright'"** — run `npm install` inside `.claude/skills/fact-puzzle-preview/`.
- **"Failed to launch browser"** — Playwright needs a browser binary. Run `npx playwright install chromium` once.
- **Fonts render as Times New Roman** — the script loads Google Fonts at render time and needs network access. If offline, see "Offline rendering" in README.md.
- **Text overflows in the headline area** — episode names over ~22 characters auto-shrink to 44px. Longer than ~30 characters will still overflow; shorten the name.
- **The OpenSecrets chip is missing** — check `dataSource` is set in preview.json. It defaults to `"OpenSecrets.org"` but explicit `null` will suppress it.

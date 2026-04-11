# Claude Code Architecture Spec — Moral Fiber Media

## Current State

Eight standalone Netlify sites, each backed by a GitHub repo under the `moralfibermedia` org. Each repo contains 4 files: `index.html`, `preview.png`, `robots.txt`, `_headers`. Two custom skills (`mfm-editorial-design`, `netlify-deploy`) define the design system and deployment workflow.

## Proposed Claude Code Workflow

### Repository Structure

Consolidate from 8+ individual repos into one monorepo:

```
moralfibermedia/follow-the-money/
├── .claude/
│   ├── skills/
│   │   ├── mfm-editorial-design/SKILL.md
│   │   └── netlify-deploy/SKILL.md
│   └── settings.json
├── template/
│   ├── puzzle-template.html        ← canonical puzzle template
│   ├── robots.txt                  ← shared across all sites
│   └── _headers                    ← shared across all sites
├── puzzles/
│   ├── hardware-giants/
│   │   ├── index.html
│   │   └── preview.png
│   ├── grocery-run/
│   │   ├── index.html
│   │   └── preview.png
│   ├── your-whole-paycheck/
│   │   ├── index.html
│   │   └── preview.png
│   ├── can-you-hear-me-now/
│   │   ├── index.html
│   │   └── preview.png
│   └── georgia-on-my-mind/
│       ├── index.html
│       └── preview.png
├── index/
│   ├── index.html                  ← puzzle hub
│   └── preview.png
├── fighters/
│   ├── index.html
│   └── preview.png
├── legal/
│   ├── index.html
│   └── preview.png
├── data/
│   ├── puzzles.json                ← all puzzle metadata
│   └── fighters.json               ← all fighter entries
├── scripts/
│   ├── build-puzzle.py             ← generates puzzle HTML from template + data
│   ├── build-index.py              ← regenerates index from puzzles.json
│   ├── build-fighters.py           ← regenerates fighters from fighters.json
│   ├── generate-preview.py         ← generates OG preview images
│   └── deploy.sh                   ← pushes each folder to its Netlify site
└── README.md
```

### Why a Monorepo

- **Single source of truth**: one template, one data file, one place to update shared elements
- **Claude Code works best with one repo**: it can see all files, run scripts, and make coordinated changes
- **Shared elements update once**: change the social links or fighters list → rebuild all affected pages from one command
- **Data-driven builds**: puzzles.json holds the company data, build-puzzle.py stamps it into the template. No more find-and-replace surgery

### Data Format

#### puzzles.json
```json
{
  "puzzles": [
    {
      "id": "hardware-giants",
      "number": 1,
      "type": "standard",
      "title": "Hardware Giants",
      "subtitle": "Three hardware stores. Three donation profiles.",
      "hook": "Weekend DIY — which parking lot do you pull into?",
      "hint": "Hint: Look at the total spend and party lean",
      "share_text": "Three hardware stores. Three donation profiles. Can you match the company to the cash?",
      "subdomain": "follow-the-hardware-giants-money",
      "companies": [
        {
          "id": "lowes",
          "name": "Lowe's",
          "display_name": "Lowe's",
          "dem_amount": 376328,
          "dem_pct": 58.9,
          "rep_amount": 262572,
          "rep_pct": 41.1,
          "total": 638900,
          "leading_party": "dem",
          "opensecrets_url": "https://www.opensecrets.org/orgs/lowe-s-companies/recipients?id=D000027296"
        },
        {
          "id": "homedepot",
          "name": "Home Depot",
          "display_name": "Home<br>Depot",
          "dem_amount": 1265546,
          "dem_pct": 46.17,
          "rep_amount": 1475768,
          "rep_pct": 53.83,
          "total": 2741314,
          "leading_party": "rep",
          "opensecrets_url": "https://www.opensecrets.org/orgs/home-depot/recipients?id=D000000419"
        },
        {
          "id": "ace",
          "name": "Ace Hardware",
          "display_name": "Ace<br>Hardware",
          "dem_amount": 38250,
          "dem_pct": 35.27,
          "rep_amount": 70209,
          "rep_pct": 64.73,
          "total": 108459,
          "leading_party": "rep",
          "opensecrets_url": "https://www.opensecrets.org/orgs/ace-hardware/recipients?id=D000042548"
        }
      ]
    }
  ]
}
```

#### fighters.json
```json
{
  "fighters": [
    {
      "name": "Brian Tyler Cohen",
      "url": "https://www.youtube.com/briantylercohen",
      "description": "Political commentary · YouTube",
      "long_description": "Political commentator breaking down the news with clarity and urgency. Host of No Lie with Brian Tyler Cohen.",
      "display_url": "youtube.com/briantylercohen"
    }
  ]
}
```

### Build Scripts

#### build-puzzle.py
- Reads `template/puzzle-template.html`
- Reads a puzzle entry from `puzzles.json`
- Stamps in: company names, amounts, percentages, URLs, puzzle branding, hints, share text
- Handles special cases (e.g., T-Mobile $0 card)
- Copies `robots.txt` and `_headers` from template/
- Outputs to `puzzles/{id}/index.html`

#### build-index.py
- Reads all entries from `puzzles.json`
- Generates the puzzle hub page with live cards and coming soon
- Outputs to `index/index.html`

#### build-fighters.py
- Reads `fighters.json`
- Generates both the full fighters page and the expandable teaser blocks
- Outputs to `fighters/index.html`
- Also patches the expandable section in each puzzle HTML

#### generate-preview.py
- Reads puzzle metadata from `puzzles.json`
- Generates 1200x630 OG preview images
- Outputs to each puzzle folder as `preview.png`

#### deploy.sh
- Iterates over each site folder
- Commits and pushes changes to the corresponding GitHub repo
- Can target a single site or all sites

### Claude Code Commands

Typical interactions in Claude Code:

```
> Build puzzle #5 "Stream Wars" with this data: Netflix (65% Dem, $1.2M), Disney (52% Rep, $3.1M), Amazon (82% Dem, $5.1M)

Claude Code:
1. Adds entry to puzzles.json
2. Runs build-puzzle.py for stream-wars
3. Runs generate-preview.py for stream-wars
4. Runs build-index.py to add the new card
5. Commits and pushes all changes
```

```
> Add Stacey Abrams to the fighters list: https://staceyabrams.com/

Claude Code:
1. Looks up the URL, writes a description
2. Adds entry to fighters.json
3. Runs build-fighters.py
4. Commits and pushes
```

```
> Update the social links — add Threads

Claude Code:
1. Updates the template
2. Rebuilds all puzzles, index, and fighters
3. Commits and pushes all changes
```

```
> The OpenSecrets data for Puzzle #2 is outdated, here are the new numbers

Claude Code:
1. Updates puzzles.json
2. Rebuilds just that puzzle
3. Regenerates preview
4. Commits and pushes
```

### CI/CD via GitHub Actions

Optional but useful once the monorepo is set up:

```yaml
# .github/workflows/deploy.yml
name: Deploy to Netlify

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.12'

      - name: Install dependencies
        run: pip install Pillow

      - name: Build all sites
        run: |
          python scripts/build-puzzle.py --all
          python scripts/build-index.py
          python scripts/build-fighters.py
          python scripts/generate-preview.py --all

      - name: Deploy puzzle index
        uses: nwtgck/actions-netlify@v3
        with:
          publish-dir: ./index
          production-deploy: true
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID_INDEX }}

      # Repeat for each site, or use a matrix strategy
```

With GitHub Actions, the workflow becomes:
1. Claude Code edits `puzzles.json` and pushes
2. GitHub Actions automatically rebuilds all affected HTML and deploys to Netlify
3. You don't touch a terminal

### Migration Path

**Phase 1 — Now (no breaking changes):**
- Create the monorepo with current files
- Add puzzles.json and fighters.json (extract data from existing HTML)
- Write build scripts
- Install skills in the repo
- Keep existing individual repos as deployment targets

**Phase 2 — Automation:**
- Set up GitHub Actions for auto-build on push
- Use Netlify API or `netlify-cli` for programmatic deploys from the monorepo
- Individual repos become deployment targets only (no manual editing)

**Phase 3 — Eleventy (at ~15-20 puzzles):**
- Migrate from raw Python build scripts to 11ty
- Shared layouts replace duplicated HTML
- Single Netlify site with path-based routing instead of subdomains
- `puzzles.moralfibermedia.com/hardware-giants` instead of `follow-the-hardware-giants-money.moralfibermedia.com`

### What Claude Code Needs

- **GitHub access**: PAT with repo scope for `moralfibermedia` org
- **Skills installed**: both .skill files in `.claude/skills/`
- **Python available**: for build scripts and image generation (Pillow)
- **No Netlify CLI required in Phase 1**: deployment still happens via git push → Netlify auto-deploy from GitHub

### What Stays the Same

- Single-file HTML pages (no framework)
- MFM editorial design system
- CC BY-NC-SA 3.0 for puzzles, CC BY 4.0 for originals
- OpenSecrets as primary data source
- The 4+1+4 index cadence
- The expandable fighters teaser per puzzle

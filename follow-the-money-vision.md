# Follow the Money — Phase 4+ Vision

## The Arc

Phase 1: Static HTML, manual builds (now)
Phase 2: Monorepo, Claude Code, auto-deploy
Phase 3: Eleventy, shared layouts, single site
**Phase 4: Additional data sources, new puzzle types**
**Phase 5: Editorial tooling, internal workflows, scale**
**Phase 6: Platform — API, embeds, civic data infrastructure**

---

## Phase 4 — Beyond OpenSecrets

### New Data Sources

OpenSecrets covers federal PAC + individual contributions. But political money flows through many other channels:

| Source | What It Covers | Format | License |
|--------|---------------|--------|---------|
| **FEC.gov** | Raw federal campaign finance filings | Bulk CSV, API | Public domain |
| **FollowTheMoney.org** (NIMP) | State-level campaign finance | API, bulk data | Varies by state |
| **OpenStates.org** | State legislator votes, bills, committees | API | Open data |
| **USAspending.gov** | Federal contracts and grants | API, bulk | Public domain |
| **SEC EDGAR** | Executive compensation, lobbying disclosures | XBRL, bulk | Public domain |
| **IRS 990s** (ProPublica) | Nonprofit financials, including PACs | API | Public domain |
| **Lobbying Disclosure Act** (Senate.gov) | Federal lobbying registrations | Bulk data | Public domain |
| **Inaugural Committee disclosures** | Inaugural donations | PDF/structured releases | Public record |
| **Ballotpedia** | Election results, candidate info | Scraped / API | CC BY-SA |
| **GovTrack.us** | Congressional votes, bill tracking | API, bulk | Public domain |

### New Puzzle Types

The matching mechanic scales beyond donation profiles:

**"How'd They Vote?"**
Three politicians. Three voting records on a specific bill. Match the legislator to the vote.
Data source: GovTrack.us, OpenStates.org

**"Who Got the Contract?"**
Three federal agencies. Three contractor companies. Match the company to the government contract.
Data source: USAspending.gov

**"Lobby This"**
Three industries. Three lobbying spend profiles. Match the industry to the spending pattern.
Data source: OpenSecrets lobbying data

**"Pay Day"**
Three CEOs. Three compensation packages. Match the executive to the pay.
Data source: SEC EDGAR proxy filings

**"Dark Money"**
Three 501(c)(4) organizations. Three spending profiles. Match the org to the spend.
Data source: IRS 990s via ProPublica Nonprofit Explorer

**"State of Play"**
Three state legislatures. Three policy outcomes. Match the statehouse to the result.
Data source: OpenStates.org

### Licensing Implications

Each data source has its own license. The puzzle inherits the most restrictive:

- **Public domain sources** (FEC, SEC, USAspending) → puzzle stays CC BY 4.0
- **OpenSecrets** → puzzle inherits CC BY-NC-SA 3.0
- **Ballotpedia** (CC BY-SA) → puzzle inherits CC BY-SA 3.0
- **State-level data** → varies, check per state

Public domain sources are the most flexible — puzzles built on FEC data directly could be CC BY 4.0 instead of NC-SA. That opens commercial possibilities (syndication, embedding in news sites) that OpenSecrets-derived puzzles can't do.

### Data Architecture

puzzles.json evolves to support multiple source types:

```json
{
  "id": "lobby-this",
  "number": 12,
  "type": "lobby",
  "data_source": "opensecrets_lobbying",
  "data_license": "CC BY-NC-SA 3.0",
  "cycle": "2024",
  "entities": [
    {
      "id": "pharma",
      "name": "Pharmaceuticals / Health Products",
      "metric_label": "Total Lobbying Spend",
      "metric_value": 374230000,
      "metric_formatted": "$374.2M",
      "breakdown": [
        { "label": "No. of Lobbyists", "value": "1,847" },
        { "label": "No. of Revolving Door", "value": "643" }
      ],
      "source_url": "https://www.opensecrets.org/industries/lobbying?ind=H04"
    }
  ]
}
```

The template system needs to support:
- Different chart types (bar split, single bar, comparison table)
- Different metrics (dollars, percentages, vote counts, ranks)
- Different source attribution per puzzle type
- Variable number of data points per entity

---

## Phase 5 — Editorial Tooling & Scale

### The Crossword Model

Crossword puzzles succeeded because of editorial control, not crowd-sourcing. Will Shortz didn't open a portal for readers to publish their own crosswords in the New York Times. Constructors submitted puzzles, an editor decided what got published, and the editorial filter *was* the product. The quality and voice came from curation.

Follow the Money works the same way. The audience suggests themes (via social, email, Substack comments). MFM researches, verifies, builds, and publishes. The editorial layer is the brand — remove it and you're just a form that generates HTML.

### Internal Puzzle Builder

The submission UI still exists — but as an internal editorial tool, not a public-facing feature.

```
┌─ MFM PUZZLE BUILDER (internal) ─────────┐
│                                          │
│  Puzzle Name: [________________]         │
│  Category:    [dropdown]                 │
│  Type:        [standard / special / new] │
│                                          │
│  Company 1: [name] [opensecrets URL]     │
│  Company 2: [name] [opensecrets URL]     │
│  Company 3: [name] [opensecrets URL]     │
│                                          │
│  [Auto-fetch data from source]           │
│                                          │
│  Hook:     [________________]            │
│  Hint:     [________________]            │
│  Subtitle: [________________]            │
│                                          │
│  [Preview]  [Build]  [Deploy]            │
└──────────────────────────────────────────┘
```

This is the CMS that doesn't need to be a CMS. It's a UI on top of `puzzles.json` that:
- Auto-scrapes OpenSecrets pages for party split data (when possible)
- Validates the triplet has enough variation to be a real puzzle
- Generates the preview image
- Stamps data into the template
- Pushes to GitHub → auto-deploys via CI/CD
- Updates the puzzle index

One person can build and ship a puzzle in under 10 minutes.

### Editorial Workflow

```
Idea → Research → Verify → Build → Review → Deploy
 │        │          │        │        │        │
Reader  OpenSecrets  Cross-   Puzzle   Visual   Auto
tip or  + primary    check    Builder  check    via
MFM     sources      against  tool     on       CI/CD
idea                 FEC raw           mobile
```

The audience participates by suggesting themes and sharing puzzles — not by building them. Suggestions arrive through existing channels:
- "You should do one about airlines" (social comment)
- "Has anyone looked at pharma companies?" (Substack reply)
- "What about the companies on the Resist and Unsubscribe list?" (email)

MFM decides what gets built, when, and how. That's the job.

### Scale Without Dilution

At 50+ puzzles, the editorial challenge shifts from "what should we build" to "what's the right cadence and sequencing." The internal tools solve this:

- **Puzzle pipeline**: a backlog in `puzzles.json` with status fields (idea / researching / verified / built / live)
- **Data freshness**: flag puzzles when a new election cycle drops and OpenSecrets data updates
- **Series planning**: thematic groupings (Suburban Gauntlet, Digital Life, etc.) with editorial calendar
- **Quality gate**: every puzzle reviewed on mobile before deploy

The tools scale the *production* without scaling the *editorial voice*. One person with good tools can maintain a library of 100+ puzzles. The NYT crossword has published 25,000+ puzzles with a staff you can count on one hand.

---

## Phase 6 — Platform

### API

A read-only public API serving puzzle data:

```
GET /api/puzzles                    → list all puzzles
GET /api/puzzles/hardware-giants    → single puzzle with full data
GET /api/fighters                   → full fighters list
GET /api/sources                    → data source registry
```

Backed by `puzzles.json` and `fighters.json` — start by serving the static JSON files directly, then move to a proper API if traffic warrants it.

### Embeddable Puzzles

An embed code that news sites, educators, and civic orgs can drop into their pages:

```html
<iframe 
  src="https://followthemoney.moralfibermedia.com/embed/hardware-giants" 
  width="100%" 
  height="600" 
  frameborder="0">
</iframe>
```

Or a web component:

```html
<script src="https://followthemoney.moralfibermedia.com/widget.js"></script>
<follow-the-money puzzle="hardware-giants"></follow-the-money>
```

This is where the CC BY 4.0 (public domain data) puzzles have an advantage — news sites can embed them without NC restrictions.

### Civic Data Infrastructure

The long-term vision: MFM becomes a layer between raw government data and public understanding.

```
Raw Data          MFM Layer              Public
─────────         ──────────             ──────
FEC filings  →    Cleaned, structured →  Puzzles
SEC EDGAR    →    Cross-referenced   →   Embeds
OpenStates   →    Contextualized     →   API
USAspending  →    Made interactive   →   Classrooms
```

Not competing with OpenSecrets or ProPublica — partnering. They do the collection and analysis. MFM does the last mile: making it touchable, shareable, playable.

### Education Use Case

Teachers could:
- Browse puzzles by topic (campaign finance, lobbying, voting records)
- Embed puzzles in LMS (Canvas, Google Classroom)
- Create custom triplets from the submission form
- Download puzzle data for classroom exercises
- Access a "Teacher Guide" with discussion questions per puzzle

This is where the mission statement lands hardest: *"Democracy doesn't work when only insiders understand it."* A 10th grader matching companies to donation profiles learns more about campaign finance in 60 seconds than in a week of textbook reading.

---

## Technology Evolution

| Phase | Stack | Data | Deploy |
|-------|-------|------|--------|
| 1 (now) | Static HTML, manual | Hardcoded in HTML | Git push × 8 |
| 2 | Monorepo, Python scripts | puzzles.json | Claude Code → git push |
| 3 | Eleventy, shared layouts | puzzles.json | CI/CD auto-deploy |
| 4 | Eleventy + new templates | Multi-source JSON | CI/CD |
| 5 | + internal puzzle builder | JSON + pipeline status | CI/CD + editorial queue |
| 6 | + API + embeds | Database-backed | Full CI/CD + CDN |

### When to Jump

- **Phase 2**: Now. The manual workflow doesn't scale past puzzle #8.
- **Phase 3**: At ~15-20 puzzles. When updating shared elements is taking longer than building new puzzles.
- **Phase 4**: When you have a partner or data source that unlocks a new puzzle type. Don't build infrastructure for data you haven't used yet.
- **Phase 5**: When you're personally bottlenecked on production speed, not ideas. The internal tools earn their existence when the editorial backlog outpaces your ability to build.
- **Phase 6**: When a news org or school asks to embed a puzzle. That's the market signal that the API is worth building.

### What Never Changes

- Puzzles, not games
- Facts, not opinions
- Sourced, not asserted
- Free, not paywalled
- Editorially controlled — MFM decides what gets published
- The audience suggests, MFM builds — like crossword constructors and Will Shortz
- Check the Facts → Match Company to Fact → Dive Deeper

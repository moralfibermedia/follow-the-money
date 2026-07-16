# Follow the Money — Puzzle Series Roadmap

**Series concept**: Interactive matching games where players guess which company matches which political donation profile. Built on OpenSecrets data (CC BY-NC-SA 3.0), published free under the same license. Each puzzle targets a real consumer decision — the "which giant gets my money" moment.

**Format**: Three companies per puzzle. Bar charts showing party split + total spend. Drag/tap to match. Correct match reveals OpenSecrets source URL. All three correct → confetti + citation links.

**Status key**: ✅ Shipped · 🔨 Building · 📋 Queued · 💡 Idea

**Scope**: This roadmap covers the bar-chart matching series only. The text-match series (Just the Facts, Speak Now, America's 250th text specials) is tracked separately — see `data/puzzles.json` and the `just-the-facts/`, `speak-now/`, `americas-250th/` folders.

**Last reconciled against `data/puzzles.json`: 2026-07-07.** 12 numbered bar-chart puzzles + Georgia special are live. Where a live puzzle shipped with a different lineup than this roadmap originally proposed, it's flagged with a **↳ Shipped as** note.

---

## Season 1 — The Suburban Gauntlet

The everyday purchases you can't avoid. Every puzzle in this season maps to a trip you make within 10 minutes of your house.

### ✅ E1: "Hardware Giants"
**Ace Hardware · Home Depot · Lowe's**
The original. Weekend project, need a part, which parking lot do you pull into?
OpenSecrets IDs: D000042548 · D000000419 · D000027296

### ✅ E2: "Grocery Run" — Puzzle #2
**Walmart · Kroger · Costco**
The weekly staple. Biggest consumer spend category for most households. Walmart is the country's largest employer — how does that translate to political spending?
OpenSecrets IDs: D000000367 · D000027084 · D000000703

### ✅ E3: "Your Whole Paycheck" — Puzzle #3
**Whole Foods (Amazon) · Trader Joe's · Publix**
The "premium grocery" bracket. Whole Foods is Amazon-owned now — does the donation profile look like a grocery store or a tech company? Publix is employee-owned and Florida-headquartered. (Shipped with Trader Joe's intact — the research note's Target/Albertsons swap wasn't needed.)

### ✅ E4: "Can You Hear Me Now?" — Puzzle #4
**AT&T · Verizon · T-Mobile**
The bill you pay every month and never think about. Telecom lobbying is massive — but do the donation profiles differ, or are they all buying the same access?
OpenSecrets IDs: D000000076 · D000000079 · D000000311

### ✅ E5: "Stream Wars" — Puzzle #5
**Netflix · Disney (Walt Disney Co) · Warner Bros. Discovery**
Entertainment spend. Disney is a cultural flashpoint. Netflix is "just" streaming.
↳ **Shipped as**: Disney · Netflix · **Warner Bros. Discovery** (the original idea listed Amazon/Prime Video as the third; it was swapped to WBD so the triplet is three pure media companies rather than one all-of-Amazon profile).

### ✅ E6: "Fill 'Er Up" — Puzzle #6
**ExxonMobil · Chevron · Shell**
Gas stations. The most visible price in America — posted on every corner. But the political money behind the pump is invisible. Classic follow-the-money territory.
OpenSecrets IDs: D000000129 · D000000015 · D000042525

---

## Season 2 — Your Digital Life

The subscriptions, platforms, and services you use every day without thinking about who's behind them.

### ✅ E7: "Who Owns Your Feed?" — Puzzle #7
**Meta (Facebook/Instagram) · Alphabet (Google/YouTube) · TikTok (ByteDance)**
The big platforms that touch your screen before breakfast. Massive spenders. Do they all lean the same way?
↳ **Shipped as**: YouTube (Alphabet) · Facebook (Meta) · **TikTok (ByteDance)** (the original idea listed Apple as the third; it was swapped to TikTok/ByteDance for a sharper "who owns your feed" framing around social platforms specifically). Apple is now free for the **Tech Titans** special.

### 💡 E8: "The Cloud Over Your Head"
**Amazon Web Services · Microsoft · Google Cloud**
Most people don't know the internet runs on three companies. Your hospital records, your bank, your kid's school — all sitting on one of these. Who are they funding?
*Editorial angle: you don't choose your cloud provider, but your cloud provider chooses your politicians.*
⚠️ **Data risk**: OpenSecrets tracks whole companies, not divisions — there is no separate AWS or Google Cloud profile (they roll up into Amazon and Alphabet, both already used elsewhere). Would need a reframing (e.g. "Amazon · Microsoft · Oracle" as enterprise-infrastructure players) before this is buildable. **Verify data before queuing.**

### 💡 E9: "Deliver Me"
**Uber · Lyft · DoorDash**
The gig economy trio. They spent hundreds of millions on Prop 22 in California to avoid classifying drivers as employees. Where does the federal money go?

### 💡 E10: "Your Password Is..."
**Comcast (Xfinity) · Charter (Spectrum) · Cox**
ISPs. The companies Americans love to hate. Many markets only have one option — making this less "which do I choose" and more "who chose for me." Net neutrality money lives here.
*Note: Cox is privately held — verify it has citable OpenSecrets contribution data before queuing.*

---

## Season 3 — Vice & Virtue

Indulgences, health, and the things you tell yourself you'll quit.

### ✅ E11: "Morning Fix" — Puzzle #8
**Starbucks · Dunkin' (Roark Capital) · McDonald's (McCafé)**
The morning coffee run. Starbucks is a cultural signifier. Dunkin' is blue-collar coded. McDonald's is just... everywhere. Do the donation profiles match the brand vibes?

### 📋 E12: "Prescription Politics" — pharmacy-chain version still open
**CVS Health · Walgreens · Rite Aid**
Pharmacy chains. They lobbied hard during COVID vaccine rollout. Rite Aid went through bankruptcy. CVS owns Aetna (insurance). The health-industrial complex in three storefronts.
⚠️ **Naming collision**: Puzzle #10 already ships under the title **"Prescription Politics"** but uses **drug manufacturers** (Pfizer · Johnson & Johnson · Eli Lilly), not the pharmacy chains this entry describes. The pharmacy-chain concept is still unbuilt — if built, give it a distinct title (e.g. "Pharmacy Counter") to avoid confusion with the live #10.

### 💡 E13: "Happy Hour"
**Anheuser-Busch InBev · Molson Coors · Constellation Brands**
Beer and spirits. Bud Light became a culture war flashpoint. Does the money tell a different story than the marketing?
*Note: Anheuser-Busch already appears in the America's 250th special (#12). Fine to reuse in a different triplet, but vary the framing.*

### 💡 E14: "Insure This"
**State Farm · Allstate · Progressive**
Insurance. You see the ads constantly. Flo vs. Mayhem vs. Jake from State Farm. Behind the mascots: who's funding what?

---

## Season 4 — Big Ticket

The purchases you agonize over. Cars, flights, banks.

### 💡 E15: "Road Trip"
**Ford · GM · Toyota**
American auto vs. the Japanese giant that builds in America. EVs, UAW, tariffs — all live in this triplet.

### ✅ E16: "Boarding Now" — Puzzle #9 ("Now Boarding")
**Delta · United · American Airlines**
Airlines. Massive pandemic bailout recipients. Georgia-based Delta is especially relevant for MFM's audience.
↳ **Shipped as**: "Now Boarding" (title tweaked from "Boarding Now"; lineup unchanged).

### 💡 E17: "Your Money, Their Politics"
**JPMorgan Chase · Bank of America · Wells Fargo**
Wall Street's retail face. These three hold roughly $8 trillion in deposits. The biggest single-industry lobbying spend in America.

### 💡 E18: "New Build"
**D.R. Horton · Lennar · PulteGroup**
Homebuilders. Suburban sprawl, zoning, affordable housing — all shaped by these companies' lobbying. The most invisible political spenders on this list.
*Note: roadmap flags these as "the most invisible political spenders" — verify all three have citable OpenSecrets data before queuing.*

---

## Special Editions

### 💡 "Tech Titans"
**Amazon · Apple · Meta**
The three most-recognized brands on earth. A guaranteed traffic driver. (Apple freed up when E7 shipped with TikTok instead.)

### ✅ "Georgia on My Mind" — live (special, unnumbered)
**Coca-Cola · Delta Air Lines · Home Depot**
All three headquartered in Georgia. Directly relevant to MFM's core audience and Georgia RICO coverage. All three were in the spotlight during the 2021 voting rights debate.

### 💡 "The Boycott List"
**Companies featured on Resist and Unsubscribe**
Cross-promotion with an Inspired By source. Pull three companies from R&U's current boycott targets and let people see the donation data.

### 💡 "Inaugural Ball"
**Three companies that donated to the 2025 Trump inaugural committee**
Different data source (inaugural disclosures rather than OpenSecrets PAC data). Would require research into whether this data is available in a structured, citable format.

---

## Off-Roadmap — live but never planned here

These shipped without a roadmap entry. Logged for completeness.

- **Puzzle #11: "Office Supplies"** — Best Buy · Staples · OfficeMax. Uses the zero-spend tile for companies with no direct federal contributions this cycle.
- **Puzzle #12: "America's 250th"** — Anheuser-Busch · Harley-Davidson · Levi Strauss. Special edition.

---

## ⭐ Next 3 to Build (recommended shortlist)

Ranked for impact × low build risk × clean OpenSecrets data. All three are unbuilt, use standard OpenSecrets org profiles (no data-sourcing risk), and need nothing beyond the existing bar-chart template.

1. **"Tech Titans"** (Amazon · Apple · Meta) — the roadmap's own "guaranteed traffic driver." Three of the most-recognized brands on earth, all major, well-documented OpenSecrets spenders. Completes the digital-life arc alongside the live "Who Owns Your Feed?" Highest traffic ceiling, lowest effort.
2. **"Your Money, Their Politics"** (JPMorgan Chase · Bank of America · Wells Fargo) — biggest single-industry money in American politics, evergreen, and the retail-banking angle ("the bank holding your paycheck funds…") is instantly relatable. Clean data.
3. **"Deliver Me"** (Uber · Lyft · DoorDash) — strongest narrative of the unbuilt set: the Prop 22 → federal gig-economy fight is a live, ongoing story. All three have citable OpenSecrets profiles.

**Also strong, second tier**: Road Trip (Ford/GM/Toyota), Insure This (State Farm/Allstate/Progressive), Happy Hour (beer).
**Verify data first / do not queue blind**: The Cloud Over Your Head (no division-level OpenSecrets data), Your Password Is… (Cox is private), New Build (homebuilders may spend too little to chart).

---

## Idea Backlog — New Mechanics (rank · over/under · timeline)

Three new puzzle templates now exist beyond bar-chart matching (`template/puzzle-template-{rank,overunder,timeline}.html`). They unlock data sources beyond OpenSecrets — several of these run on **public-domain records (USAspending, SEC EDGAR, Federal Register, court dockets)**, so those puzzles can ship **CC BY 4.0** (commercially syndicatable), not the NC-SA that OpenSecrets-derived puzzles are locked to. All figures/dates below must be human-sourced at build time; nothing here is verified data.

### Rank — order N items by a metric (surprise is the ordering)
- ✅ **"Golden Parachutes"** — 4 CEOs (same sector) → total annual compensation. Pairs a household brand with a number that reorders your assumptions. Source: SEC EDGAR DEF 14A proxy filings (public domain → CC BY 4.0). *Live — `puzzles/golden-parachutes/` (CEO comp from SEC proxies).*
- 💡 **"Bankrolled"** — 4 senators or committee chairs → total career PAC money from one industry (pharma, oil…). The gap between who talks toughest and who takes most. Source: OpenSecrets (CC BY-NC-SA 3.0).
- 💡 **"Contract Kings"** — 4 federal contractors → total federal contract dollars in a fiscal year. Ranking is genuinely non-obvious. Source: USAspending.gov (public domain → CC BY 4.0).

### Over/Under — higher-or-lower deck (single-figure gut punch)
- ✅ **"Lobby or Not"** — 6 industries/companies → annual federal lobbying spend. Sequential reveal lands the "wait, *that* much?" beat card by card. Source: Senate LDA / OpenSecrets lobbying. *Live — `puzzles/lobby-or-not/` (2026-cycle OpenSecrets lobbying).*
- 💡 **"The Bill Comes Due"** — 6 companies → size of a DOJ/SEC/EPA penalty or settlement. Directly on MFM's accountability beat. Source: DOJ/SEC press releases, Violation Tracker (public record).
- 💡 **"Bailout Math"** — 6 companies → federal pandemic aid / PPP / bailout dollars received. "Your tax money went where?" Source: USAspending / SBA (public domain → CC BY 4.0).
- ⚠️ Over/Under rule: avoid equal values — a tie counts correct for either guess.

### Timeline — order events chronologically, dates hidden (sequence is the story)
- ✅ **"The Docket"** — 5 key filings/rulings in a single case; natural Georgia RICO tie-in. Reordering a real docket is the whole tension. Source: court docket / PACER (public record → CC BY 4.0). *Live — `puzzles/the-docket/` (Fulton County RICO timeline).*
- 💡 **"How a Rule Becomes Real"** — 5 milestones of a federal rulemaking (proposed rule → comment window → final rule → effective date → legal challenge). Ties into the Just the Facts comment-CTA work. Source: Federal Register (public domain → CC BY 4.0).
- 💡 **"Paper Trail"** — 5 events of one investigation/scandal (EO → subpoena → indictment → plea → sentence). Sequence *is* the accountability narrative. Source: public record (→ CC BY 4.0).

**Drafts folder**: `drafts/` holds built-but-unpublished puzzles. They stay unlinked from `index.html` / `sitemap.xml` and carry an `X-Robots-Tag: noindex` header (`netlify.toml`), so they never get indexed — but they remain servable so Netlify Deploy Previews can render them for review. To publish a draft: verify every figure/date against its source, move the folder to `puzzles/{slug}/`, generate a preview image, add a card to root `index.html` and a URL to `sitemap.xml`.

---

## Production Notes

### Data sourcing
- Primary: OpenSecrets.org `/orgs/[company]/recipients` pages
- Cycle: Default to most recent completed cycle (currently 2024)
- Verify each company's OpenSecrets ID before building
- Screenshot the data at time of build (it can update)
- Always link to the specific OpenSecrets page, not just the homepage
- **OpenSecrets tracks whole companies, not divisions** — you cannot isolate AWS from Amazon or Google Cloud from Alphabet. Build triplets from companies that have their own org profile.

### Licensing
- Each puzzle inherits CC BY-NC-SA 3.0 from OpenSecrets data
- Credit line: "Created by Moral Fiber Media · Data from OpenSecrets.org"
- Link to: opensecrets.org/open-data/credit-opensecrets
- MFM original content without OpenSecrets data stays CC BY 4.0

### Editorial guardrails
- Data only — no editorializing about which company is "better" or "worse"
- The puzzle reveals facts; the player draws conclusions
- Every claim backed by a source link
- Include a note about what OpenSecrets data represents (PAC + individual contributions, not direct corporate treasury gifts)

### Build checklist per puzzle
- [ ] Verify all three companies have OpenSecrets data with party split
- [ ] Confirm the triplet has enough variation to be a real puzzle (not all identical splits)
- [ ] Screenshot source data at build time
- [ ] Record OpenSecrets IDs
- [ ] Add entry to `data/puzzles.json` (`"template": "barchart"`)
- [ ] Stamp into `template/puzzle-template-barchart.html`
- [ ] Update company names, amounts, percentages, source URLs
- [ ] Update masthead subtitle for the category
- [ ] Generate preview image (1200×630) via the `fact-puzzle-preview` skill
- [ ] Output to `puzzles/{id}/`, add a card to the root `index.html`, add the URL to `sitemap.xml`
- [ ] Test on mobile (375px)
- [ ] Deploy via Netlify (single site, `followthemoney.moralfibermedia.com`)
- [ ] Share on YouTube, TikTok, Bluesky, Sez.us, Substack

---

## Audience Growth Strategy

Each puzzle is a standalone, shareable URL. The game mechanic (guess → reveal → share) is inherently viral — people want to see if their friends can beat their attempt count.

**Cross-pollination**: Every puzzle links to the Share & Follow section and the Substack. Players who came for the game discover Georgia RICO Part Duex and the DOJ bar rule coverage.

**Content calendar fit**: One new puzzle per month, announced on Thursday (community engagement day). The puzzle lives permanently at its path — it's evergreen content that keeps driving traffic.

**Series branding**: "Follow the Money" becomes its own sub-brand within MFM. Consistent design language, consistent game mechanic, growing library of puzzles people can binge.

**New mechanics** (added 2026-07): three new puzzle templates beyond bar-chart matching now exist — **rank** (order N items by a metric), **over/under** (higher-or-lower deck), and **timeline** (order events chronologically). See `template/puzzle-template-{rank,overunder,timeline}.html` and the CLAUDE.md "Common Tasks" sections. These open up FEC / USAspending / SEC EDGAR / GovTrack data (public domain → CC BY 4.0) beyond OpenSecrets.

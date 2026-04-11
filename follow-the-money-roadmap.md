# Follow the Money — Puzzle Series Roadmap

**Series concept**: Interactive matching games where players guess which company matches which political donation profile. Built on OpenSecrets data (CC BY-NC-SA 3.0), published free under the same license. Each puzzle targets a real consumer decision — the "which giant gets my money" moment.

**Format**: Three companies per puzzle. Bar charts showing party split + total spend. Drag/tap to match. Correct match reveals OpenSecrets source URL. All three correct → confetti + citation links.

**Status key**: ✅ Shipped · 🔨 Building · 📋 Queued · 💡 Idea

---

## Season 1 — The Suburban Gauntlet

The everyday purchases you can't avoid. Every puzzle in this season maps to a trip you make within 10 minutes of your house.

### ✅ E1: "Hardware Giants"
**Ace Hardware · Home Depot · Lowe's**
The original. Weekend project, need a part, which parking lot do you pull into?
OpenSecrets IDs: D000042548 · D000000419 · D000027296

### 📋 E2: "Grocery Run"
**Walmart · Kroger · Costco**
The weekly staple. Biggest consumer spend category for most households. Walmart is the country's largest employer — how does that translate to political spending?
OpenSecrets IDs: D000000367 · D000027084 · D000000703

### 📋 E3: "Your Whole Paycheck"
**Whole Foods (Amazon) · Trader Joe's (Aldi) · Publix**
The "premium grocery" bracket. Whole Foods is Amazon-owned now — does the donation profile look like a grocery store or a tech company? Trader Joe's is privately held by the Aldi family — does that change the pattern? Publix is employee-owned and Florida-headquartered.
*Research note: Verify Trader Joe's/Aldi has sufficient OpenSecrets data. May need to swap for Target or Albertsons.*

### 📋 E4: "Can You Hear Me Now?"
**AT&T · Verizon · T-Mobile**
The bill you pay every month and never think about. Telecom lobbying is massive — but do the donation profiles differ, or are they all buying the same access?
OpenSecrets IDs: D000000076 · D000000079 · D000000311

### 📋 E5: "Stream Wars"
**Netflix · Disney (Walt Disney Co) · Amazon (Prime Video)**
Entertainment spend. Disney is a cultural flashpoint. Amazon is everything. Netflix is "just" streaming. But who's spending more on politics — and which direction?
*Research note: Amazon's profile covers the whole company, not just Prime Video. Good editorial angle: your $15/month subscription funds a much bigger machine.*

### 📋 E6: "Fill 'Er Up"
**ExxonMobil · Chevron · Shell**
Gas stations. The most visible price in America — posted on every corner. But the political money behind the pump is invisible. Classic follow-the-money territory.
OpenSecrets IDs: D000000129 · D000000015 · D000042525

---

## Season 2 — Your Digital Life

The subscriptions, platforms, and services you use every day without thinking about who's behind them.

### 💡 E7: "Who Owns Your Feed?"
**Meta (Facebook/Instagram) · Alphabet (Google/YouTube) · Apple**
The big three that touch your screen before breakfast. Massive spenders. Do they all lean the same way?
OpenSecrets IDs: D000033563 · D000067823 · D000021754

### 💡 E8: "The Cloud Over Your Head"
**Amazon Web Services · Microsoft · Google Cloud**
Most people don't know the internet runs on three companies. Your hospital records, your bank, your kid's school — all sitting on one of these. Who are they funding?
*Editorial angle: you don't choose your cloud provider, but your cloud provider chooses your politicians.*

### 💡 E9: "Deliver Me"
**Uber · Lyft · DoorDash**
The gig economy trio. They spent hundreds of millions on Prop 22 in California to avoid classifying drivers as employees. Where does the federal money go?

### 💡 E10: "Your Password Is..."
**Comcast (Xfinity) · Charter (Spectrum) · Cox**
ISPs. The companies Americans love to hate. Many markets only have one option — making this less "which do I choose" and more "who chose for me." Net neutrality money lives here.

---

## Season 3 — Vice & Virtue

Indulgences, health, and the things you tell yourself you'll quit.

### 💡 E11: "Morning Fix"
**Starbucks · Dunkin' · McDonald's (McCafé)**
The morning coffee run. Starbucks is a cultural signifier. Dunkin' is blue-collar coded. McDonald's is just... everywhere. Do the donation profiles match the brand vibes?

### 💡 E12: "Prescription Politics"
**CVS Health · Walgreens · Rite Aid**
Pharmacy chains. They lobbied hard during COVID vaccine rollout. Rite Aid went through bankruptcy. CVS owns Aetna (insurance). The health-industrial complex in three storefronts.

### 💡 E13: "Happy Hour"
**Anheuser-Busch InBev · Molson Coors · Constellation Brands**
Beer and spirits. Bud Light became a culture war flashpoint. Does the money tell a different story than the marketing?

### 💡 E14: "Insure This"
**State Farm · Allstate · Progressive**
Insurance. You see the ads constantly. Flo vs. Mayhem vs. Jake from State Farm. Behind the mascots: who's funding what?

---

## Season 4 — Big Ticket

The purchases you agonize over. Cars, flights, banks.

### 💡 E15: "Road Trip"
**Ford · GM · Toyota**
American auto vs. the Japanese giant that builds in America. EVs, UAW, tariffs — all live in this triplet.

### 💡 E16: "Boarding Now"
**Delta · United · American Airlines**
Airlines. Massive pandemic bailout recipients. Georgia-based Delta is especially relevant for MFM's audience.

### 💡 E17: "Your Money, Their Politics"
**JPMorgan Chase · Bank of America · Wells Fargo**
Wall Street's retail face. These three hold roughly $8 trillion in deposits. The biggest single-industry lobbying spend in America.

### 💡 E18: "New Build"
**D.R. Horton · Lennar · PulteGroup**
Homebuilders. Suburban sprawl, zoning, affordable housing — all shaped by these companies' lobbying. The most invisible political spenders on this list.

---

## Special Editions

### 💡 "Tech Titans"
**Amazon · Apple · Meta**
The three most-recognized brands on earth. A guaranteed traffic driver.

### 💡 "Georgia on My Mind"
**Coca-Cola · Delta Air Lines · Home Depot**
All three headquartered in Georgia. Directly relevant to MFM's core audience and Georgia RICO coverage. All three were in the spotlight during the 2021 voting rights debate.

### 💡 "The Boycott List"
**Companies featured on Resist and Unsubscribe**
Cross-promotion with an Inspired By source. Pull three companies from R&U's current boycott targets and let people see the donation data.

### 💡 "Inaugural Ball"
**Three companies that donated to the 2025 Trump inaugural committee**
Different data source (inaugural disclosures rather than OpenSecrets PAC data). Would require research into whether this data is available in a structured, citable format.

---

## Production Notes

### Data sourcing
- Primary: OpenSecrets.org `/orgs/[company]/recipients` pages
- Cycle: Default to most recent completed cycle (currently 2024)
- Verify each company's OpenSecrets ID before building
- Screenshot the data at time of build (it can update)
- Always link to the specific OpenSecrets page, not just the homepage

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
- [ ] Build game from template (follow-the-money.html)
- [ ] Update company names, amounts, percentages, source URLs
- [ ] Update masthead subtitle for the category
- [ ] Test on mobile (375px)
- [ ] Deploy to [puzzle-name].moralfibermedia.com via Netlify
- [ ] Share on YouTube, TikTok, Bluesky, Sez.us, Substack

---

## Audience Growth Strategy

Each puzzle is a standalone, shareable URL. The game mechanic (guess → reveal → share) is inherently viral — people want to see if their friends can beat their attempt count.

**Cross-pollination**: Every puzzle links to the Share & Follow section and the Substack. Players who came for the game discover Georgia RICO Part Duex and the DOJ bar rule coverage.

**Content calendar fit**: One new puzzle per month, announced on Thursday (community engagement day). The puzzle lives permanently at its subdomain — it's evergreen content that keeps driving traffic.

**Series branding**: "Follow the Money" becomes its own sub-brand within MFM. Consistent design language, consistent game mechanic, growing library of puzzles people can binge.

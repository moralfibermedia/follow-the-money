# Follow the Money — by Moral Fiber Media

Interactive civic puzzles built on public data. Free, sourced, openly licensed.

**We do the research. You solve the puzzle.**

**Status:** v1.0 — 7 puzzles live, arcade mode with 3-star scoring shipped.

## Live Site

All pages live at **[followthemoney.moralfibermedia.com](https://followthemoney.moralfibermedia.com)** under a single Netlify deployment.

| Page | Path |
|------|------|
| Puzzle index (home) | `/` |
| Puzzle #1 — Hardware Giants | `/puzzles/hardware-giants/` |
| Puzzle #2 — Grocery Run | `/puzzles/grocery-run/` |
| Puzzle #3 — Your Whole Paycheck | `/puzzles/your-whole-paycheck/` |
| Puzzle #4 — Can You Hear Me Now? | `/puzzles/can-you-hear-me-now/` |
| Puzzle #5 — Stream Wars | `/puzzles/stream-wars/` |
| Special — Georgia on My Mind | `/puzzles/georgia-on-my-mind/` |
| Special — Behind the Bench (GA Supreme Court) | `/puzzles/behind-the-bench/` |
| Pro-Democracy Fighters index | `/fighters/` |
| 2026 GA Election Bills Scorecard | `/2026-ga-elections-legislation/` |
| DOJ Bar Rule Infographic | `/doj/bar-rule-infographic/` |
| DOJ Bar Rule Action | `/doj/bar-rule-action/` |
| Privacy & Terms | `/legal/` |

## Puzzle Types

**Bar Chart (Follow the Money):** Match companies to political donation profiles. Data from OpenSecrets. CC BY-NC-SA 3.0.

**Text Match (Who Said It? / Behind the Bench):** Match quotes, endorsements, or facts to sources using public transcripts and records. CC BY 4.0.

**Arcade Mode:** Speed-run all live puzzles back-to-back with a 3-star rating based on accuracy and time.

## Architecture

Static HTML monorepo deployed as a single Netlify site. Puzzle data lives in [data/puzzles.json](data/puzzles.json); templates live in [template/](template/) (workspace-only, blocked from serving). See [CLAUDE.md](CLAUDE.md) and `.claude/skills/netlify-deploy/SKILL.md` for the full build and deploy workflow.

## Editorial Principles

- **Puzzles, not games.**
- **Editorial control is 100% human.** Claude builds and deploys. The human picks every fact.
- **Every claim is sourced.** Every correct match reveals the source link.

## Contact

- Substack: [moralfibermedia.com](https://moralfibermedia.com)
- Bluesky: [@moralfibermedia.bsky.social](https://bsky.app/profile/moralfibermedia.bsky.social)
- Email: contact@moralfibermedia.com

Created by [Moral Fiber Media](https://moralfibermedia.com).

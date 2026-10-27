// Every federal rule we're tracking, newest deadline first.
//
// Lifecycle data (deadline, comment URLs, final rule) comes from a puzzle's
// comment_cta wherever one exists — this never re-declares it, so the puzzle
// page and the Federal Register page can't drift. data/rules.json adds the
// presentation metadata (title, agency, summary) keyed by document id, and may
// carry a complete entry for a rule we cover without a puzzle.
const puzzles = require("../../data/puzzles.json").puzzles || [];
const meta = (require("../../data/rules.json").rules) || {};

const DAY = 86400000;
const fmt = (t) => new Date(t).toLocaleDateString("en-US",
  { month: "long", day: "numeric", year: "numeric", timeZone: "America/New_York" });

function lifecycle(r) {
  const now = Date.now();
  const dl = r.comment_deadline ? new Date(r.comment_deadline).getTime() : null;
  let state = "open";
  if (r.final_rule_url) state = "resolved";
  else if (dl && now > dl) state = "closed";
  else if (dl && dl - now <= 7 * DAY) state = "closing";
  return {
    state,
    daysLeft: dl ? Math.max(0, Math.ceil((dl - now) / DAY)) : null,
    deadlineLabel: dl ? fmt(dl) : null,
    finalRuleLabel: r.final_rule_date ? fmt(new Date(r.final_rule_date).getTime()) : null,
    _sort: dl || 0,
  };
}

const byId = new Map();

// 1. rules a puzzle is watching — the puzzle owns the lifecycle data
for (const p of puzzles) {
  const cta = p.comment_cta;
  if (!cta || !cta.count_document_id || p.status !== "live") continue;
  const id = cta.count_document_id;
  const rule = byId.get(id) || Object.assign({ id, coverage: [] }, meta[id] || {}, cta);
  rule.coverage.push({ title: p.title, url: "/" + (p.path || "puzzles/" + p.id) + "/" });
  byId.set(id, rule);
}

// 2. rules we cover without a puzzle CTA — they carry their own lifecycle data
for (const [id, m] of Object.entries(meta)) {
  if (byId.has(id) || !m.comment_deadline) continue;
  byId.set(id, Object.assign({ id, coverage: [] }, m));
}

module.exports = [...byId.values()]
  .map((r) => Object.assign(r, lifecycle(r)))
  .sort((a, b) => b._sort - a._sort);

// Private read-out of the anonymous completion tallies (see tally.mjs).
// Reached at /review/stats (rewritten in netlify.toml). If the STATS_KEY env
// var is set in Netlify, ?key= must match; if it's unset, the page serves with
// a banner reminding you to set one. Aggregate data only — nothing to leak.
import { getStore } from "@netlify/blobs";

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const fmtTime = (secs) => { const m = Math.floor(secs / 60), r = Math.round(secs % 60); return m + ":" + (r < 10 ? "0" : "") + r; };
const pct = (n, d) => d ? Math.round((n / d) * 100) + "%" : "—";

export default async (req) => {
  const url = new URL(req.url);
  const required = process.env.STATS_KEY;
  const locked = required && url.searchParams.get("key") !== required;
  if (locked) return new Response("Unauthorized", { status: 401, headers: { "x-robots-tag": "noindex" } });

  const store = getStore("puzzle-stats");
  const stats = (await store.get("stats", { type: "json" })) || {};

  const rows = Object.entries(stats)
    .map(([id, s]) => ({ id, ...s }))
    .sort((a, b) => b.complete - a.complete);

  const totals = rows.reduce((t, r) => ({
    starts: t.starts + r.starts, complete: t.complete + r.complete,
    perfect: t.perfect + r.perfect, cleared: t.cleared + r.cleared, finished: t.finished + r.finished,
  }), { starts: 0, complete: 0, perfect: 0, cleared: 0, finished: 0 });

  const banner = required ? "" :
    `<div class="warn">⚠ This page is open. Set a <code>STATS_KEY</code> env var in Netlify, then visit <code>/review/stats?key=…</code> to lock it.</div>`;

  const body = rows.length ? rows.map((r) => `
    <tr>
      <td class="id">${esc(r.id)}</td>
      <td class="num">${r.starts}</td>
      <td class="num">${r.complete}</td>
      <td class="num">${pct(r.complete, r.starts)}</td>
      <td class="num good">${r.perfect}</td>
      <td class="num">${r.cleared}</td>
      <td class="num muted">${r.finished}</td>
      <td class="num">${r.timeCount ? fmtTime(r.timeSum / r.timeCount) : "—"}</td>
    </tr>`).join("") : `<tr><td colspan="8" class="empty">No completions recorded yet.</td></tr>`;

  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex, nofollow">
<title>Puzzle stats — Moral Fiber Media</title>
<style>
  :root { --ink:#0d0d0d; --paper:#f2ede4; --red:#d63031; --gold:#b8860b; --muted:#6b6256; --green:#27ae60; --rule:#c0b89a; }
  * { box-sizing:border-box; } body { margin:0; background:var(--paper); color:var(--ink); font-family:'JetBrains Mono',ui-monospace,monospace; padding:32px 20px; }
  .wrap { max-width:900px; margin:0 auto; }
  h1 { font-family:Georgia,serif; font-size:26px; margin:0 0 4px; } .sub { color:var(--muted); font-size:13px; margin-bottom:20px; }
  .warn { background:#fff3c9; border:1px solid var(--gold); padding:10px 12px; font-size:12px; margin-bottom:18px; }
  .warn code { background:rgba(0,0,0,.06); padding:1px 5px; }
  .cards { display:flex; gap:14px; flex-wrap:wrap; margin-bottom:22px; }
  .card { border:2px solid var(--ink); padding:12px 16px; min-width:120px; }
  .card .n { font-family:Georgia,serif; font-size:28px; font-weight:700; } .card .l { font-size:11px; text-transform:uppercase; letter-spacing:.1em; color:var(--muted); }
  table { width:100%; border-collapse:collapse; font-size:13px; }
  th,td { text-align:left; padding:8px 10px; border-bottom:1px solid var(--rule); }
  th { font-size:10px; text-transform:uppercase; letter-spacing:.1em; color:var(--gold); }
  td.num, th.num { text-align:right; font-variant-numeric:tabular-nums; }
  td.id { font-weight:700; } td.good { color:var(--green); } td.muted { color:var(--muted); } td.empty { text-align:center; color:var(--muted); padding:26px; }
</style></head><body><div class="wrap">
  <h1>Puzzle completions</h1>
  <div class="sub">Anonymous aggregate counts · no cookies, no identifiers · updates live</div>
  ${banner}
  <div class="cards">
    <div class="card"><div class="n">${totals.starts}</div><div class="l">Starts</div></div>
    <div class="card"><div class="n">${totals.complete}</div><div class="l">Completions</div></div>
    <div class="card"><div class="n">${pct(totals.complete, totals.starts)}</div><div class="l">Finish rate</div></div>
    <div class="card"><div class="n">${pct(totals.perfect, totals.complete)}</div><div class="l">Perfect rate</div></div>
  </div>
  <table>
    <thead><tr><th>Puzzle</th><th class="num">Starts</th><th class="num">Done</th><th class="num">Finish %</th><th class="num">★★★</th><th class="num">★★☆</th><th class="num">★☆☆</th><th class="num">Avg time</th></tr></thead>
    <tbody>${body}</tbody>
  </table>
</div></body></html>`;

  return new Response(html, { headers: { "content-type": "text/html; charset=utf-8", "x-robots-tag": "noindex, nofollow" } });
};

// Private read-out of the anonymous completion tallies (see tally.mjs).
// Reached at /review/stats (rewritten in netlify.toml). The STATS_KEY env var
// (if set) must be supplied to see anything — but it is NEVER put in the URL:
// the page loads as a password prompt and the key is sent in the POST body, so
// it can't leak via browser history, referrers, or request logs. Aggregate data
// only. If STATS_KEY is unset, the page serves open with a reminder banner.
import { getStore } from "@netlify/blobs";

const fmtDate = (iso) => new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });
const json = (obj, status = 200) => new Response(JSON.stringify(obj), {
  status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", "x-robots-tag": "noindex, nofollow" }
});

// Aggregate over append-only event keys: e/<puzzle>/<type>/<rank>/<secs>/<uuid>
async function aggregate() {
  const store = getStore("solves");
  const agg = {};
  let cursor;
  do {
    const res = await store.list({ prefix: "e/", cursor });
    for (const b of res.blobs) {
      const p = b.key.split("/");
      if (p[0] !== "e" || p.length < 6) continue;
      const [, puzzle, type, rank, secsStr] = p;
      const a = agg[puzzle] || (agg[puzzle] = { starts: 0, complete: 0, perfect: 0, cleared: 0, finished: 0, timeSum: 0, timeCount: 0 });
      if (type === "s") { a.starts++; }
      else if (type === "c") {
        a.complete++;
        if (rank === "p") a.perfect++; else if (rank === "c") a.cleared++; else if (rank === "f") a.finished++;
        const secs = parseInt(secsStr, 10);
        if (secs) { a.timeSum += secs; a.timeCount++; }
      }
    }
    cursor = res.cursor;
  } while (cursor);
  const rows = Object.entries(agg).map(([id, s]) => ({
    id, starts: s.starts, complete: s.complete, perfect: s.perfect, cleared: s.cleared, finished: s.finished,
    avg: s.timeCount ? Math.round(s.timeSum / s.timeCount) : null,
  })).sort((a, b) => b.complete - a.complete);
  const totals = rows.reduce((t, r) => ({
    starts: t.starts + r.starts, complete: t.complete + r.complete,
    perfect: t.perfect + r.perfect, cleared: t.cleared + r.cleared, finished: t.finished + r.finished,
  }), { starts: 0, complete: 0, perfect: 0, cleared: 0, finished: 0 });
  const meta = await store.get("meta", { type: "json" }).catch(() => null);
  return { rows, totals, since: meta && meta.resetAt ? fmtDate(meta.resetAt) : null };
}

export default async (req) => {
  const required = process.env.STATS_KEY;

  // Data endpoint — the key travels in the POST body, never the URL.
  if (req.method === "POST") {
    let d;
    try { d = await req.json(); } catch { return json({ error: "bad request" }, 400); }
    if (required && d.key !== required) return json({ error: "unauthorized" }, 401);
    try { return json({ ...(await aggregate()), open: !required }); }
    catch { return json({ error: "server error" }, 500); }
  }

  // GET always serves the shell — no data, and nothing that requires a key in
  // the URL. The client POSTs the typed key to fetch the numbers.
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
  .lock form { display:flex; flex-wrap:wrap; align-items:flex-end; gap:12px; margin:24px 0; }
  .lock label { font-size:12px; color:var(--muted); line-height:1.9; }
  .lock input { display:block; font:inherit; padding:8px 10px; border:2px solid var(--ink); background:#fff; min-width:240px; }
  .lock button { font:inherit; font-weight:700; font-size:11px; letter-spacing:.08em; text-transform:uppercase; padding:10px 16px; border:2px solid var(--ink); background:var(--ink); color:var(--paper); cursor:pointer; }
  .cards { display:flex; gap:14px; flex-wrap:wrap; margin-bottom:22px; }
  .card { border:2px solid var(--ink); padding:12px 16px; min-width:120px; }
  .card .n { font-family:Georgia,serif; font-size:28px; font-weight:700; } .card .l { font-size:11px; text-transform:uppercase; letter-spacing:.1em; color:var(--muted); }
  table { width:100%; border-collapse:collapse; font-size:13px; }
  th,td { text-align:left; padding:8px 10px; border-bottom:1px solid var(--rule); }
  th { font-size:10px; text-transform:uppercase; letter-spacing:.1em; color:var(--gold); }
  td.num, th.num { text-align:right; font-variant-numeric:tabular-nums; }
  td.id { font-weight:700; } td.good { color:var(--green); } td.muted { color:var(--muted); } td.empty { text-align:center; color:var(--muted); padding:26px; }
  .resetbar { margin-bottom:20px; display:flex; align-items:center; gap:12px; }
  .resetbar button { font:inherit; font-weight:700; font-size:11px; letter-spacing:.08em; text-transform:uppercase; padding:8px 14px; border:2px solid var(--red); background:var(--paper); color:var(--red); cursor:pointer; }
  .resetbar button:hover { background:var(--red); color:#fff; }
  .rmsg { font-size:12px; } .rmsg.ok { color:var(--green); } .rmsg.err { color:var(--red); }
</style></head><body><div class="wrap">
  <h1>Puzzle completions</h1>
  <div class="sub" id="sub">Anonymous aggregate counts · no cookies, no identifiers</div>

  <div class="lock" id="lock" style="display:none">
    <form id="keyForm">
      <label>Review key
        <input type="password" id="keyInput" autocomplete="off" autofocus>
      </label>
      <button type="submit">Unlock</button>
      <span id="lockMsg" class="rmsg"></span>
    </form>
  </div>

  <div id="dash" style="display:none">
    <div id="banner"></div>
    <div class="resetbar" id="resetbar" style="display:none"><button id="resetBtn" type="button">Reset completions</button><span id="resetMsg" class="rmsg"></span></div>
    <div class="cards" id="cards"></div>
    <table>
      <thead><tr><th>Puzzle</th><th class="num">Starts</th><th class="num">Done</th><th class="num">Finish %</th><th class="num">★★★</th><th class="num">★★☆</th><th class="num">★☆☆</th><th class="num">Avg time</th></tr></thead>
      <tbody id="rows"></tbody>
    </table>
  </div>
</div>
<script>
  (function () {
    var KEY = null; // held in memory only — never in the URL or storage
    var el = function (id) { return document.getElementById(id); };
    function esc(s) { return String(s).replace(/[&<>]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]; }); }
    function pct(n, d) { return d ? Math.round(n / d * 100) + "%" : "—"; }
    function fmtTime(secs) { var m = Math.floor(secs / 60), r = Math.round(secs % 60); return m + ":" + (r < 10 ? "0" : "") + r; }
    function card(n, l) { return '<div class="card"><div class="n">' + n + '</div><div class="l">' + l + '</div></div>'; }

    function render(data) {
      el("lock").style.display = "none";
      el("dash").style.display = "";
      el("sub").textContent = "Anonymous aggregate counts · no cookies, no identifiers" + (data.since ? " · counting since " + data.since : "");
      el("banner").innerHTML = data.open
        ? '<div class="warn">⚠ This page is open — no <code>STATS_KEY</code> is set in Netlify. Set one to lock it.</div>' : "";
      el("resetbar").style.display = data.open ? "none" : "";
      var t = data.totals;
      el("cards").innerHTML = card(t.starts, "Starts") + card(t.complete, "Completions") +
        card(pct(t.complete, t.starts), "Finish rate") + card(pct(t.perfect, t.complete), "Perfect rate");
      el("rows").innerHTML = data.rows.length ? data.rows.map(function (r) {
        return '<tr><td class="id">' + esc(r.id) + '</td>' +
          '<td class="num">' + r.starts + '</td>' +
          '<td class="num">' + r.complete + '</td>' +
          '<td class="num">' + pct(r.complete, r.starts) + '</td>' +
          '<td class="num good">' + r.perfect + '</td>' +
          '<td class="num">' + r.cleared + '</td>' +
          '<td class="num muted">' + r.finished + '</td>' +
          '<td class="num">' + (r.avg != null ? fmtTime(r.avg) : "—") + '</td></tr>';
      }).join("") : '<tr><td colspan="8" class="empty">No completions recorded yet.</td></tr>';
    }

    function fetchData(key) {
      return fetch("/.netlify/functions/stats", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ key: key || "" }) });
    }

    // Try open first; if the server requires a key, show the prompt.
    fetchData("").then(function (r) {
      if (r.status === 200) return r.json().then(render);
      el("lock").style.display = "";
    }).catch(function () { el("lock").style.display = ""; });

    el("keyForm").addEventListener("submit", function (e) {
      e.preventDefault();
      var k = el("keyInput").value, msg = el("lockMsg");
      msg.className = "rmsg"; msg.textContent = "Checking…";
      fetchData(k).then(function (r) {
        if (r.status === 200) { KEY = k; return r.json().then(render); }
        msg.className = "rmsg err"; msg.textContent = r.status === 401 ? "✗ Key rejected." : "✗ Failed (" + r.status + ").";
      }).catch(function () { msg.className = "rmsg err"; msg.textContent = "✗ Network error."; });
    });

    el("resetBtn").addEventListener("click", function () {
      var msg = el("resetMsg"), btn = el("resetBtn");
      if (!confirm("Reset all completion stats? This permanently deletes every recorded start/finish and restarts the 'since' date.")) return;
      btn.disabled = true; msg.className = "rmsg"; msg.textContent = "Resetting…";
      fetch("/.netlify/functions/tally", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ event: "reset", key: KEY }) })
        .then(function (r) {
          btn.disabled = false;
          if (r.status === 204) { msg.className = "rmsg ok"; msg.textContent = "✓ Reset — reload and unlock again in a few seconds to see the fresh baseline."; }
          else if (r.status === 401) { msg.className = "rmsg err"; msg.textContent = "✗ Key rejected."; }
          else { msg.className = "rmsg err"; msg.textContent = "✗ Failed (" + r.status + ")."; }
        })
        .catch(function () { btn.disabled = false; msg.className = "rmsg err"; msg.textContent = "✗ Network error."; });
    });
  })();
</script>
</body></html>`;

  return new Response(html, { headers: { "content-type": "text/html; charset=utf-8", "x-robots-tag": "noindex, nofollow", "cache-control": "no-store" } });
};

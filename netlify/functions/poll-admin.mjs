// Operator console for the Dream Ticket poll — /review/poll-admin
// Serves a small form; the key you type is sent ONLY to our own ticket
// function for verification against TICKET_ADMIN_KEY (never stored, never
// logged, not in the page source). Fail-closed: without the env var set,
// every reset attempt is rejected upstream with 401.
export default async () => {
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex, nofollow">
<title>Poll admin — Moral Fiber Media</title>
<style>
  :root { --ink:#0d0d0d; --paper:#f2ede4; --red:#d63031; --gold:#b8860b; --muted:#6b6256; --green:#27ae60; --rule:#c0b89a; }
  * { box-sizing:border-box; } body { margin:0; background:var(--paper); color:var(--ink);
    font-family:'JetBrains Mono',ui-monospace,monospace; padding:40px 20px; }
  .wrap { max-width:560px; margin:0 auto; }
  h1 { font-family:Georgia,serif; font-size:24px; margin:0 0 4px; }
  .sub { color:var(--muted); font-size:12.5px; margin-bottom:22px; line-height:1.5; }
  .card { border:2px solid var(--ink); background:#fff; padding:18px; }
  .stat { margin-bottom:16px; font-size:13px; }
  .stat b { font-family:Georgia,serif; font-size:22px; }
  label { display:block; font-size:11px; text-transform:uppercase; letter-spacing:.12em; color:var(--muted); margin:0 0 6px; }
  input { width:100%; padding:10px 12px; font:inherit; border:2px solid var(--ink); background:var(--paper); margin-bottom:12px; }
  button { font:inherit; font-weight:700; letter-spacing:.1em; text-transform:uppercase; font-size:12px;
    padding:11px 18px; border:2px solid var(--red); background:var(--red); color:#fff; cursor:pointer; }
  button:disabled { opacity:.5; cursor:default; }
  .msg { margin-top:14px; font-size:13px; display:none; padding:10px 12px; border:1.5px solid; }
  .msg.ok { display:block; border-color:var(--green); color:var(--green); }
  .msg.err { display:block; border-color:var(--red); color:var(--red); }
  .warn { font-size:12px; color:#7a4a00; background:#fff3c9; border:1.5px solid var(--gold); padding:9px 12px; margin-bottom:16px; line-height:1.5; }
</style></head><body><div class="wrap">
  <h1>Dream Ticket · poll admin</h1>
  <div class="sub">Resets purge all ballots and stamp a fresh "since" date on the public leaderboard. The key is verified server-side against the <code>TICKET_ADMIN_KEY</code> environment variable — it is never stored or logged.</div>
  <div class="card">
    <div class="stat">Current standings: <b id="count">…</b> <span id="since"></span></div>
    <div class="warn">⚠ Resetting is permanent — every ballot is deleted. The "since" date restarts at now.</div>
    <label for="key">Admin key</label>
    <input id="key" type="password" autocomplete="off" placeholder="TICKET_ADMIN_KEY value">
    <button id="go" type="button">Reset the poll</button>
    <div class="msg" id="msg"></div>
  </div>
</div>
<script>
  var api = "/.netlify/functions/ticket";
  function refresh() {
    fetch(api).then(function(r){return r.json();}).then(function(d){
      document.getElementById("count").textContent = d.ballots + " ballot" + (d.ballots===1?"":"s");
      document.getElementById("since").textContent = d.since ? ("since " + new Date(d.since).toLocaleDateString()) : "(no reset stamped yet)";
    }).catch(function(){ document.getElementById("count").textContent = "unavailable"; });
  }
  document.getElementById("go").addEventListener("click", function () {
    var key = document.getElementById("key").value.trim();
    var msg = document.getElementById("msg");
    if (!key) { msg.className = "msg err"; msg.textContent = "Enter the admin key."; return; }
    if (!confirm("Really reset the poll? Every ballot will be deleted.")) return;
    var btn = this; btn.disabled = true; msg.className = "msg"; msg.textContent = "";
    fetch(api, { method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ event: "reset", key: key }) })
      .then(function (r) {
        btn.disabled = false;
        if (r.status === 204) { msg.className = "msg ok"; msg.textContent = "✓ Poll reset — 'since' restarts now. The public board may take ~30s to reflect it."; document.getElementById("key").value=""; setTimeout(refresh, 2000); }
        else if (r.status === 401) { msg.className = "msg err"; msg.textContent = "✗ Rejected — wrong key, or TICKET_ADMIN_KEY isn't set in Netlify yet."; }
        else { msg.className = "msg err"; msg.textContent = "✗ Something went wrong (" + r.status + ")."; }
      })
      .catch(function () { btn.disabled = false; msg.className = "msg err"; msg.textContent = "✗ Network error."; });
  });
  refresh();
</script>
</body></html>`;
  return new Response(html, { headers: { "content-type": "text/html; charset=utf-8", "x-robots-tag": "noindex, nofollow", "cache-control": "no-store" } });
};

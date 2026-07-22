#!/usr/bin/env python3
"""Build the Review Desk — a single-page HTML compilation of (a) puzzle drafts
in drafts/ pending editorial verification and (b) every marketing channel set
in marketing/. Run from the repo root:

    python3 scripts/build-review-desk.py -o /path/to/review.html \
        [--drafts-base https://deploy-preview-NN--mfm-follow-the-money.netlify.app]

The output is a standalone HTML page (published as a private artifact for
review). scripts/ is blocked from serving, so this never ships to the site.
"""
import os, re, html, argparse

GROUPS = [
    ("New Mechanics", ["golden-parachutes", "lobby-or-not", "the-docket"]),
    ("Bar-Chart Series", ["hardware-giants","grocery-run","your-whole-paycheck","can-you-hear-me-now","stream-wars","fill-er-up","who-owns-your-feed","morning-fix","now-boarding","prescription-politics","office-supplies","americas-250th","georgia-on-my-mind"]),
    ("Specials & Text-Match", ["behind-the-bench","who-spends-your-money","power-to-pardon","pardon-my-receipts","power-grab"]),
]
CHANNELS = ["substack","bluesky","x","facebook","sezus","tiktok","youtube"]

def inline(s):
    s = html.escape(s)
    s = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", s)
    s = re.sub(r"\*(.+?)\*", r"<em>\1</em>", s)
    s = re.sub(r"\[([^\]]+)\]\((https?://[^)]+)\)", r'<a href="\2" target="_blank" rel="noopener">\1</a>', s)
    s = re.sub(r"(?<![\">])(https?://[^\s<]+)", r'<a href="\1" target="_blank" rel="noopener">\1</a>', s)
    return s

def md2html(md):
    comments = re.findall(r"<!--(.*?)-->", md, re.S)
    md = re.sub(r"<!--.*?-->", "", md, flags=re.S).strip()
    out = []
    for block in re.split(r"\n\s*\n", md):
        block = block.strip()
        if not block: continue
        if block.startswith("# "):
            out.append(f"<h4 class='post-h1'>{inline(block[2:])}</h4>")
        elif block.startswith("## "):
            out.append(f"<h5 class='post-h2'>{inline(block[3:])}</h5>")
        elif all(l.strip().startswith("- ") for l in block.splitlines()):
            items = "".join(f"<li>{inline(l.strip()[2:])}</li>" for l in block.splitlines())
            out.append(f"<ul>{items}</ul>")
        else:
            out.append(f"<p>{inline(block).replace(chr(10), '<br>')}</p>")
    notes = "".join(f"<div class='note'>{inline(' '.join(c.split()))}</div>" for c in comments)
    return notes + "".join(out)

def counts(ch, raw):
    body = re.sub(r"<!--.*?-->", "", raw, flags=re.S).strip()
    if ch == "bluesky":
        n, lim = len(body), 300
        return f"<span class='chip {'ok' if n<=lim else 'over'}'>{n}/{lim}</span>"
    if ch == "x":
        n, lim = len(re.sub(r"https?://\S+", "", body).strip()) + 2 + 23, 280
        return f"<span class='chip {'ok' if n<=lim else 'over'}'>~{n}/{lim}</span>"
    return ""

def strip_tags(s):
    return re.sub(r"<[^>]+>", " ", s).strip()

def build_drafts(drafts_base):
    """Scan drafts/*/index.html into a pending-verification queue."""
    cards, toc = [], []
    if not os.path.isdir("drafts"):
        return "", []
    for slug in sorted(os.listdir("drafts")):
        p = os.path.join("drafts", slug, "index.html")
        if not os.path.exists(p): continue
        src = open(p).read()
        m = re.search(r"<title>(.*?)(?: — | \| )", src)
        title = m.group(1) if m else slug
        banner = re.search(r"<!--\s*(DRAFT\b.*?)-->", src, re.S)
        banner_html = f"<div class='note'>{inline(' '.join(banner.group(1).split()))}</div>" if banner else ""
        hook = re.search(r'<span class="hook-inner">(.*?)</span>', src, re.S)
        hook_html = f"<p class='draft-hook'><em>{' '.join(strip_tags(hook.group(1)).split())}</em></p>" if hook else ""
        events = []
        for chunk in re.findall(r'<div class="timeline-event"(.*?)<div class="move-btns">', src, re.S):
            meta = re.search(r'data-rank="(\d+)" data-date="([\d-]+)"', chunk)
            t = re.search(r'event-title">(.*?)<span', chunk, re.S)
            links = re.findall(r'<a href="([^"]+)"[^>]*>(.*?)</a>', chunk, re.S)
            if meta and t:
                events.append((int(meta.group(1)), meta.group(2), t.group(1), links))
        rows = ""
        for rank, date, etitle, links in sorted(events):
            srcs = "<br>".join(f"<a href='{html.escape(u)}' target='_blank' rel='noopener'>{html.escape(strip_tags(l))}</a>" for u, l in links)
            rows += (f"<tr><td class='mono'>{rank}</td><td>{html.escape(strip_tags(etitle))}</td>"
                     f"<td class='mono'>{date}</td><td>{srcs}</td></tr>")
        table = f"<div class='tbl'><table><thead><tr><th>#</th><th>Event</th><th>Date to verify</th><th>Sources — check all</th></tr></thead><tbody>{rows}</tbody></table></div>" if rows else ""
        play = f"{drafts_base}/drafts/{slug}/"
        cards.append(f"""<section class="campaign draft" id="draft-{slug}">
<div class="campaign-head"><label class="rev"><input type="checkbox" data-slug="draft-{slug}"> verified</label>
<h2>{html.escape(title)} <span class="draft-badge">DRAFT</span></h2>
<div class="slug">drafts/{slug}/ · <a href="{html.escape(play)}" target="_blank" rel="noopener">play on deploy preview ↗</a></div></div>
{hook_html}{banner_html}{table}</section>""")
        toc.append(f"<a class='toc-item' href='#draft-{slug}' data-slug='draft-{slug}'><span class='tick'></span>{html.escape(title)} <span class='mini-badge'>draft</span></a>")
    return "".join(cards), toc

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("-o", required=True, help="output HTML path")
    ap.add_argument("--drafts-base", default="https://followthemoney.moralfibermedia.com",
                    help="base URL where drafts/ is viewable (a deploy preview)")
    args = ap.parse_args()

    sections, toc, total_files = [], [], 0

    draft_cards, draft_toc = build_drafts(args.drafts_base.rstrip("/"))
    if draft_cards:
        toc.append("<div class='toc-group'>Drafts · Verify First</div>")
        toc += draft_toc
        sections.append(draft_cards)

    for gname, slugs in GROUPS:
        toc.append(f"<div class='toc-group'>{html.escape(gname)}</div>")
        cards = []
        for slug in slugs:
            d = os.path.join("marketing", slug)
            if not os.path.isdir(d): continue
            sub = open(os.path.join(d, "substack.md")).read()
            m = re.search(r"^# (.+)$", sub, re.M)
            title = m.group(1) if m else slug
            chs = []
            for ch in CHANNELS:
                p = os.path.join(d, f"{ch}.md")
                if not os.path.exists(p): continue
                raw = open(p).read(); total_files += 1
                chs.append(f"""<article class="channel">
<div class="channel-head"><span class="channel-name">{ch}</span>{counts(ch, raw)}<span class="path">marketing/{slug}/{ch}.md</span></div>
<div class="post">{md2html(raw)}</div></article>""")
            cards.append(f"""<section class="campaign" id="{slug}">
<div class="campaign-head"><label class="rev"><input type="checkbox" data-slug="{slug}"> reviewed</label>
<h2>{html.escape(title)}</h2><div class="slug">{slug} · <a href="https://followthemoney.moralfibermedia.com/puzzles/{slug}" target="_blank" rel="noopener">live page ↗</a></div></div>
{''.join(chs)}</section>""")
            toc.append(f"<a class='toc-item' href='#{slug}' data-slug='{slug}'><span class='tick'></span>{html.escape(title)}</a>")
        sections.append("".join(cards))

    tail = []
    for label, path in [("Launch announcement · substack", "marketing/announcement/substack.md"),
                        ("Guide · Canva beat-sync", "marketing/guides/canva-beat-sync.md")]:
        if os.path.exists(path):
            raw = open(path).read(); total_files += 1
            tail.append(f"""<article class="channel"><div class="channel-head"><span class="channel-name">{html.escape(label)}</span><span class="path">{path}</span></div>
<div class="post">{md2html(raw)}</div></article>""")
    toc.append("<div class='toc-group'>Other</div><a class='toc-item' href='#other'><span class='tick'></span>Announcement &amp; guides</a>")
    sections.append(f"<section class='campaign' id='other'><div class='campaign-head'><h2>Announcement &amp; Guides</h2><div class='slug'>not per-puzzle campaigns</div></div>{''.join(tail)}</section>")

    n_campaigns = sum(1 for g in GROUPS for s in g[1] if os.path.isdir(os.path.join("marketing", s)))
    n_drafts = len(draft_toc)

    page = SHELL.replace("__TOC__", "".join(toc)).replace("__MAIN__", "".join(sections)) \
               .replace("__STATS__", f"{n_drafts} draft(s) awaiting verification · {n_campaigns} campaigns · {total_files} marketing files")
    open(args.o, "w").write(page)
    print(f"wrote {args.o}: {n_drafts} drafts, {n_campaigns} campaigns, {total_files} files, {len(page)//1024}KB")

SHELL = """<title>Marketing Copy Review — Follow the Money</title>
<style>
:root {
  --paper:#f2ede4; --ink:#0d0d0d; --red:#d63031; --gold:#b8860b;
  --muted:#6b6256; --rule:#c0b89a; --card:#faf7f0; --chipok:#27ae60;
}
@media (prefers-color-scheme: dark) { :root {
  --paper:#161412; --ink:#ece7dc; --red:#e85c5c; --gold:#d4a437;
  --muted:#9a917f; --rule:#453f36; --card:#1e1b18; --chipok:#4cc47e;
} }
:root[data-theme="dark"] {
  --paper:#161412; --ink:#ece7dc; --red:#e85c5c; --gold:#d4a437;
  --muted:#9a917f; --rule:#453f36; --card:#1e1b18; --chipok:#4cc47e;
}
:root[data-theme="light"] {
  --paper:#f2ede4; --ink:#0d0d0d; --red:#d63031; --gold:#b8860b;
  --muted:#6b6256; --rule:#c0b89a; --card:#faf7f0; --chipok:#27ae60;
}
* { box-sizing:border-box; }
body { background:var(--paper); color:var(--ink); margin:0;
  font-family:'Iowan Old Style',Georgia,'Times New Roman',serif; line-height:1.55; }
a { color:var(--red); text-decoration-color:var(--rule); text-underline-offset:2px; }
.wrap { display:flex; gap:0; max-width:1200px; margin:0 auto; }
.mast { border-top:6px solid var(--ink); border-bottom:2px solid var(--ink);
  padding:22px 28px 16px; }
.mast .kicker { font-family:ui-monospace,Menlo,monospace; font-size:11px;
  letter-spacing:.35em; text-transform:uppercase; color:var(--gold); }
.mast h1 { font-family:Georgia,serif; font-weight:900; font-size:clamp(26px,4vw,40px);
  margin:.2em 0 .1em; letter-spacing:-.5px; text-wrap:balance; }
.mast h1 em { color:var(--red); }
.mast .sub { font-style:italic; color:var(--muted); margin:0; max-width:65ch; }
nav { position:sticky; top:0; align-self:flex-start; width:260px; flex:none;
  max-height:100vh; overflow-y:auto; padding:20px 8px 40px 20px;
  border-right:1px solid var(--rule); }
.toc-group { font-family:ui-monospace,Menlo,monospace; font-size:10px;
  letter-spacing:.25em; text-transform:uppercase; color:var(--muted);
  margin:18px 0 6px; }
.toc-item { display:flex; gap:8px; align-items:baseline; padding:3px 6px;
  font-size:14px; color:var(--ink); text-decoration:none; border-radius:2px; }
.toc-item:hover { background:var(--card); color:var(--red); }
.tick { width:10px; flex:none; font-size:11px; color:var(--chipok); }
.toc-item.done .tick::before { content:"✓"; }
.toc-item.done { color:var(--muted); }
.mini-badge { font-family:ui-monospace,Menlo,monospace; font-size:9px;
  letter-spacing:.15em; text-transform:uppercase; color:var(--red);
  border:1px solid var(--red); padding:0 4px; border-radius:8px; }
main { flex:1; min-width:0; padding:8px 28px 80px; }
.campaign { border-bottom:3px solid var(--ink); padding:26px 0 34px; }
.campaign.draft { border-left:4px solid var(--red); padding-left:16px; }
.campaign-head { margin-bottom:14px; }
.campaign-head h2 { font-family:Georgia,serif; font-weight:900; font-style:italic;
  color:var(--red); font-size:28px; margin:.1em 0; text-wrap:balance; }
.draft-badge { font-family:ui-monospace,Menlo,monospace; font-size:11px; font-style:normal;
  letter-spacing:.2em; vertical-align:middle; color:var(--paper); background:var(--red);
  padding:2px 8px; }
.draft-hook { max-width:70ch; }
.slug { font-family:ui-monospace,Menlo,monospace; font-size:11px; color:var(--muted);
  letter-spacing:.05em; }
.rev { float:right; font-family:ui-monospace,Menlo,monospace; font-size:11px;
  letter-spacing:.1em; text-transform:uppercase; color:var(--muted);
  display:flex; gap:6px; align-items:center; cursor:pointer; }
.rev input { accent-color:var(--chipok); width:15px; height:15px; }
.channel { border:1.5px solid var(--rule); background:var(--card); margin:12px 0; }
.channel-head { display:flex; gap:10px; align-items:baseline; flex-wrap:wrap;
  border-bottom:1px solid var(--rule); padding:8px 14px; }
.channel-name { font-family:ui-monospace,Menlo,monospace; font-size:11px; font-weight:700;
  letter-spacing:.25em; text-transform:uppercase; color:var(--gold); }
.path { margin-left:auto; font-family:ui-monospace,Menlo,monospace; font-size:10px;
  color:var(--muted); }
.chip { font-family:ui-monospace,Menlo,monospace; font-size:10px; padding:1px 7px;
  border:1px solid var(--chipok); color:var(--chipok); border-radius:9px; }
.chip.over { border-color:var(--red); color:var(--red); }
.post { padding:12px 16px 14px; max-width:75ch; }
.post p { margin:.55em 0; overflow-wrap:anywhere; }
.post ul { margin:.4em 0; padding-left:1.3em; }
.post-h1 { font-family:Georgia,serif; font-size:19px; font-weight:900; margin:.4em 0 .2em; }
.post-h2 { font-family:ui-monospace,Menlo,monospace; font-size:11px; letter-spacing:.2em;
  text-transform:uppercase; color:var(--muted); margin:1em 0 .2em; }
.note { font-family:ui-monospace,Menlo,monospace; font-size:11px; color:var(--muted);
  border-left:3px solid var(--gold); padding:4px 10px; margin:.4em 0 .7em;
  overflow-wrap:anywhere; max-width:80ch; }
.tbl { overflow-x:auto; }
table { border-collapse:collapse; font-size:14px; margin:.6em 0; }
th { font-family:ui-monospace,Menlo,monospace; font-size:10px; letter-spacing:.15em;
  text-transform:uppercase; color:var(--muted); text-align:left; }
th, td { border-bottom:1px solid var(--rule); padding:6px 14px 6px 0; vertical-align:top; }
.mono { font-family:ui-monospace,Menlo,monospace; font-size:12px;
  font-variant-numeric:tabular-nums; white-space:nowrap; }
.stats { font-family:ui-monospace,Menlo,monospace; font-size:11px; color:var(--muted);
  letter-spacing:.08em; margin-top:8px; }
.deskbar { position:fixed; right:14px; bottom:14px; z-index:9; display:flex; gap:10px;
  align-items:center; background:var(--card); border:2px solid var(--ink);
  padding:8px 12px; font-family:ui-monospace,Menlo,monospace; font-size:12px;
  box-shadow:0 4px 14px rgba(0,0,0,.15); }
.deskbar .dt { font-variant-numeric:tabular-nums; color:var(--muted); }
.deskbar .dchecked { color:var(--chipok); }
.deskbar button { font-family:inherit; font-size:11px; letter-spacing:.15em;
  text-transform:uppercase; border:2px solid var(--ink); background:var(--ink);
  color:var(--paper); padding:6px 12px; cursor:pointer; }
.deskbar button:hover { background:var(--red); border-color:var(--red); }
.deskbar #dMsg { color:var(--gold); max-width:220px; }
@media (max-width:820px) { .wrap { flex-direction:column; }
  nav { position:static; width:auto; max-height:none; border-right:none;
    border-bottom:1px solid var(--rule); display:flex; flex-wrap:wrap; gap:2px 10px; } }
</style>
<div class="mast">
  <div class="kicker">★ Internal · Copy Review</div>
  <h1>Marketing <em>Review Desk</em></h1>
  <p class="sub">Puzzle drafts awaiting verification sit at the top — check each date against its source, then play it on the deploy preview. Below: every channel draft for every published puzzle. Ticks persist in this browser.</p>
  <div class="stats">__STATS__</div>
</div>
<div class="wrap">
<nav>__TOC__</nav>
<main>__MAIN__</main>
</div>
<div class="deskbar">
  <span class="dt" id="dTimer">00:00</span>
  <span class="dchecked" id="dChecked"></span>
  <button id="dDone" type="button">Done — send report</button>
  <span id="dMsg"></span>
</div>
<script>
const KEY="mfm-mktg-review";
const state=JSON.parse(localStorage.getItem(KEY)||"{}");
document.querySelectorAll(".rev input").forEach(cb=>{
  const s=cb.dataset.slug;
  cb.checked=!!state[s]; sync(s,cb.checked);
  cb.addEventListener("change",()=>{ state[s]=cb.checked;
    localStorage.setItem(KEY,JSON.stringify(state)); sync(s,cb.checked); countChecked(); });
});
function sync(s,on){ const t=document.querySelector(`.toc-item[data-slug="${s}"]`);
  if(t) t.classList.toggle("done",on); }

// --- session timer (t0 stamped by the password gate on unlock; falls back to page load) ---
const t0 = +(sessionStorage.getItem("desk-t0") || Date.now());
if (!sessionStorage.getItem("desk-t0")) sessionStorage.setItem("desk-t0", String(t0));
function tick(){
  const s = Math.floor((Date.now()-t0)/1000);
  document.getElementById("dTimer").textContent =
    String(Math.floor(s/60)).padStart(2,"0")+":"+String(s%60).padStart(2,"0");
}
tick(); setInterval(tick, 1000);
function countChecked(){
  const n = Object.values(state).filter(Boolean).length;
  document.getElementById("dChecked").textContent = n ? n+" ✓" : "";
}
countChecked();

// --- DONE: submit a report as a Netlify Form (when hosted on the site);
//     falls back to copy-to-clipboard where network calls are blocked. ---
document.getElementById("dDone").addEventListener("click", async () => {
  const reviewer = (prompt("Your name (goes in the report):") || "anonymous").slice(0,80);
  const notes = (prompt("Findings / notes (optional):") || "").slice(0,2000);
  const mins = Math.max(1, Math.round((Date.now()-t0)/60000));
  const checked = Object.keys(state).filter(k=>state[k]).sort();
  const report = `Review Desk report — ${new Date().toISOString().slice(0,16).replace("T"," ")} UTC
Reviewer: ${reviewer}
Time in desk: ${mins} min
Verified/reviewed (${checked.length}): ${checked.join(", ") || "none"}
Notes: ${notes || "—"}`;
  const msg = document.getElementById("dMsg");
  try {
    const r = await fetch("/", { method:"POST",
      headers:{ "Content-Type":"application/x-www-form-urlencoded" },
      body: new URLSearchParams({ "form-name":"review-desk-done", reviewer,
        minutes:String(mins), report }) });
    if (!r.ok) throw new Error("HTTP "+r.status);
    msg.textContent = "Report sent ✓";
  } catch (e) {
    try { await navigator.clipboard.writeText(report);
      msg.textContent = "Couldn't send from here — report copied, paste it to MFM.";
    } catch (e2) { msg.textContent = "Couldn't send — screenshot this: " + report; }
  }
});
</script>
"""

if __name__ == "__main__":
    main()

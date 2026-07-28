#!/usr/bin/env python3
"""Generate the private Launch Console HTML from marketing/ copy.

One collapsible section per campaign; per channel: an editable copy box, a
Compose button (Bluesky / X / Facebook web-intents — opens the composer as
whoever is logged in on that platform in your browser), and a Copy button.
Channels without a web intent (Substack, Sez.us, TikTok, YouTube) get Copy
only. Output is a standalone HTML doc meant to be piped through
scripts/encrypt-page.mjs and written to review/launch/index.html.

Usage:  python3 scripts/build-launch-console.py -o /tmp/launch.html
"""
import argparse, os, re, html
from urllib.parse import quote

CHANNELS = ["substack", "bluesky", "x", "facebook", "sezus", "tiktok", "youtube"]
INTENT = {
    "bluesky": lambda text, link: "https://bsky.app/intent/compose?text=" + quote(text),
    "x":       lambda text, link: "https://x.com/intent/post?text=" + quote(text),
    "facebook":lambda text, link: "https://www.facebook.com/sharer/sharer.php?u=" + quote(link or ""),
}
NOTE = {
    "facebook": "URL pre-fills; Meta strips captions — use Copy for the caption text.",
    "substack": "No web intent — copy, then paste into the Substack editor.",
    "sezus": "No web intent — copy headline + body into the Sez composer.",
    "tiktok": "No web intent — copy the script/caption; post in the app.",
    "youtube": "No web intent — copy; paste as a community post or Short description.",
}

def body_of(md):
    return md.split("-->", 1)[1].strip() if "-->" in md else md.strip()

def link_of(md):
    m = re.search(r"https://followthemoney\.moralfibermedia\.com/[^\s\)\]\"']+utm_campaign=[^\s\)\]\"']+", md)
    return m.group(0) if m else ""

def esc(s): return html.escape(s, quote=True)

def build(marketing_dir):
    campaigns = sorted(
        d for d in os.listdir(marketing_dir)
        if os.path.isdir(os.path.join(marketing_dir, d)) and d != "guides"
    )
    sections = []
    for camp in campaigns:
        cdir = os.path.join(marketing_dir, camp)
        cards = []
        for ch in CHANNELS:
            path = os.path.join(cdir, ch + ".md")
            if not os.path.exists(path):
                continue
            raw = open(path, encoding="utf-8").read()
            text = body_of(raw)
            link = link_of(raw)
            tid = f"t-{camp}-{ch}"
            rows = max(4, min(16, text.count("\n") + 2))
            compose = ""
            if ch in INTENT:
                compose = f'<a class="btn compose" href="{esc(INTENT[ch](text, link))}" target="_blank" rel="noopener">▶ Compose in {ch.capitalize()}</a>'
            note = f'<div class="note">{esc(NOTE[ch])}</div>' if ch in NOTE else ""
            cards.append(f"""
    <div class="card">
      <div class="chan">{ch.upper()}</div>
      <textarea id="{tid}" rows="{rows}" spellcheck="false">{esc(text)}</textarea>
      {note}
      <div class="btns">{compose}<button class="btn copy" type="button" onclick="copyEl('{tid}', this)">Copy</button></div>
    </div>""")
        if cards:
            sections.append(f"""
  <details>
    <summary>{esc(camp)} <span class="cnt">{len(cards)} channel{'s' if len(cards)!=1 else ''}</span></summary>
    <div class="cards">{''.join(cards)}</div>
  </details>""")

    return f"""<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex, nofollow">
<title>Launch console — Moral Fiber Media</title>
<style>
  :root {{ --ink:#0d0d0d; --paper:#f2ede4; --red:#d63031; --gold:#b8860b; --muted:#6b6256; --green:#27ae60; --rule:#c0b89a; }}
  * {{ box-sizing:border-box; }} body {{ margin:0; background:var(--paper); color:var(--ink); font-family:'JetBrains Mono',ui-monospace,monospace; padding:32px 18px 80px; }}
  .wrap {{ max-width:760px; margin:0 auto; }}
  h1 {{ font-family:Georgia,serif; font-size:26px; margin:0 0 4px; }}
  .sub {{ color:var(--muted); font-size:12.5px; line-height:1.6; margin-bottom:22px; }}
  .warn {{ font-size:12px; color:#7a4a00; background:#fff3c9; border:1.5px solid var(--gold); padding:10px 12px; margin-bottom:20px; line-height:1.55; }}
  details {{ border:2px solid var(--ink); background:#fff; margin-bottom:10px; }}
  summary {{ cursor:pointer; padding:12px 14px; font-weight:700; font-size:14px; user-select:none; }}
  summary .cnt {{ color:var(--muted); font-weight:400; font-size:11px; margin-left:8px; }}
  .cards {{ padding:4px 14px 14px; }}
  .card {{ border-top:1px solid var(--rule); padding:14px 0; }}
  .chan {{ font-size:11px; font-weight:700; letter-spacing:.16em; color:var(--gold); margin-bottom:8px; }}
  textarea {{ width:100%; font:inherit; font-size:12.5px; line-height:1.5; border:1.5px solid var(--rule); background:var(--paper); padding:9px 11px; resize:vertical; }}
  .note {{ font-size:11px; color:var(--muted); font-style:italic; margin:6px 0 0; }}
  .btns {{ display:flex; gap:8px; margin-top:9px; flex-wrap:wrap; }}
  .btn {{ font:inherit; font-weight:700; font-size:11px; letter-spacing:.08em; text-transform:uppercase; padding:9px 14px; border:2px solid var(--ink); cursor:pointer; text-decoration:none; display:inline-block; }}
  .btn.compose {{ background:var(--ink); color:var(--paper); }}
  .btn.compose:hover {{ background:var(--red); border-color:var(--red); }}
  .btn.copy {{ background:var(--paper); color:var(--ink); }}
  .btn.copy:hover {{ background:var(--gold); border-color:var(--gold); }}
</style></head><body><div class="wrap">
  <h1>Launch console</h1>
  <div class="sub">Compose buttons open the platform's composer pre-filled — as whoever is logged into that platform in <em>this browser</em>. Copy buttons put the exact channel copy on your clipboard. Edit any box before you send.</div>
  <div class="warn">⚠ Make sure you're logged into the <strong>Moral Fiber Media</strong> account on the target platform (a dedicated browser profile is cleanest) — compose posts as whoever's logged in, and this console can't tell which account that is.</div>
  {''.join(sections)}
</div>
<script>
  function copyEl(id, btn) {{
    var el = document.getElementById(id);
    navigator.clipboard.writeText(el.value).then(function () {{
      var o = btn.textContent; btn.textContent = "✓ Copied";
      setTimeout(function () {{ btn.textContent = o; }}, 1500);
    }});
  }}
</script>
</body></html>"""

if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("-o", required=True)
    ap.add_argument("--marketing", default="marketing")
    a = ap.parse_args()
    out = build(a.marketing)
    open(a.o, "w", encoding="utf-8").write(out)
    print(f"wrote {a.o} ({len(out)} bytes)")

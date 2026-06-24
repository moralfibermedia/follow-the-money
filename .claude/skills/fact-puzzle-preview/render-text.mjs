// Text-match / "Just the Facts" OG preview renderer (1200x630).
//
// The bar-chart renderer (render.mjs) hardcodes the FOLLOW THE MONEY headline
// + A/B/C bars and is wrong for text-match puzzles. This is the sibling for the
// Just the Facts series: a clean editorial card showing the puzzle name, hook,
// and the answer tiles (which don't spoil the matching), no OpenSecrets chip.
//
// Usage:
//   node render-text.mjs <path/to/preview.json> [-o output.png]
//
// preview.json shape (distinct from the bar-chart schema):
//   {
//     "series": "just-the-facts",
//     "episode": "Who Spends Your Money?",       // becomes the <h1>; "<last word>?" goes red italic
//     "subjects": ["Federal Reserve", "SEC", "U.S. Postal Service"],  // 2-4 answer tiles
//     "subtitle": "The agencies that sat out a grant rule reveal who really controls federal money.",
//     "matchVerb": "Match the agency to the reason it sat out.",
//     "dataLabel": "Federal Register · 91 FR 32198",
//     "dataSource": null                          // null = no attribution chip (Just the Facts is non-OpenSecrets)
//   }
import { readFileSync, writeFileSync, unlinkSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { chromium } from "playwright";
import sharp from "sharp";

const args = process.argv.slice(2);
const cfgPath = resolve(args.find((a) => !a.startsWith("-")));
let outPath = args.includes("-o") ? resolve(args[args.indexOf("-o") + 1]) : join(dirname(cfgPath), "preview.png");
const cfg = JSON.parse(readFileSync(cfgPath, "utf8"));

const esc = (s) => String(s).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");

// Split the episode title so the final word (often the punchy "...Money?") renders red italic.
const title = cfg.episode || "Untitled";
const parts = title.split(" ");
const head = esc(parts.slice(0, -1).join(" "));
const tail = esc(parts.slice(-1)[0]);

const tiles = (cfg.subjects || []).map((s) => `<div class="tile">${esc(s)}</div>`).join("\n      ");

const html = `<!DOCTYPE html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,900&family=Source+Serif+4:ital,wght@0,400;1,400&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet">
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  :root { --ink:#0d0d0d; --paper:#f2ede4; --red:#d63031; --gold:#b8860b; --muted:#6b6256; }
  html,body { width:1200px; height:630px; }
  body { background:var(--paper); color:var(--ink); font-family:'Source Serif 4',Georgia,serif;
    border-top:9px solid var(--ink); border-bottom:7px solid var(--red);
    padding:54px 70px 46px; display:flex; flex-direction:column; }
  .top { display:flex; justify-content:space-between; align-items:flex-start; }
  .kicker { font-family:'JetBrains Mono',monospace; font-size:21px; font-weight:700; letter-spacing:6px; text-transform:uppercase; color:var(--gold); }
  .brand { font-family:'JetBrains Mono',monospace; font-size:15px; font-weight:700; letter-spacing:3px; text-transform:uppercase; color:var(--muted); text-align:right; line-height:1.5; }
  .mid { flex:1; display:flex; flex-direction:column; justify-content:center; }
  h1 { font-family:'Playfair Display',serif; font-weight:900; font-size:92px; line-height:1.02; letter-spacing:-1px; margin-bottom:22px; }
  h1 em { font-style:italic; color:var(--red); }
  .hook { font-family:'Source Serif 4',serif; font-style:italic; font-size:27px; color:var(--muted); max-width:1000px; line-height:1.4; margin-bottom:34px; }
  .tiles { display:flex; gap:16px; flex-wrap:wrap; }
  .tile { border:3px solid var(--ink); background:#fff; padding:16px 26px; font-family:'Playfair Display',serif; font-weight:700; font-size:27px; }
  .bottom { display:flex; justify-content:space-between; align-items:flex-end; margin-top:8px; }
  .cta { font-family:'JetBrains Mono',monospace; font-weight:700; font-size:20px; letter-spacing:1px; color:var(--red); }
  .src { font-family:'JetBrains Mono',monospace; font-size:15px; letter-spacing:1px; color:var(--muted); margin-top:8px; }
  .right { text-align:right; font-family:'JetBrains Mono',monospace; font-size:15px; letter-spacing:1px; color:var(--muted); line-height:1.7; }
  .right .lic { background:var(--ink); color:var(--paper); padding:3px 9px; font-weight:700; letter-spacing:1px; }
</style></head>
<body>
  <div class="top">
    <div class="kicker">★ ${esc((cfg.series || "just-the-facts").replace(/-/g, " "))}</div>
    <div class="brand">FactPuzzle<br>Moral Fiber Media</div>
  </div>
  <div class="mid">
    <h1>${head} <em>${tail}</em></h1>
    <div class="hook">${esc(cfg.subtitle || "")}</div>
    <div class="tiles">
      ${tiles}
    </div>
  </div>
  <div class="bottom">
    <div>
      <div class="cta">${esc(cfg.matchVerb || "")}</div>
      ${cfg.dataLabel ? `<div class="src">SOURCE · ${esc(cfg.dataLabel)}</div>` : ""}
    </div>
    <div class="right">
      <span class="lic">CC BY 4.0</span><br>
      followthemoney.moralfibermedia.com
    </div>
  </div>
</body></html>`;

const tmp = join(dirname(cfgPath), ".tmp-textcard.html");
writeFileSync(tmp, html);
const browser = await chromium.launch();
try {
  const ctx = await browser.newContext({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  await page.goto(pathToFileURL(tmp).href, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(600);
  const buf2x = await page.screenshot({ clip: { x: 0, y: 0, width: 1200, height: 630 } });
  const buf = await sharp(buf2x).resize(1200, 630, { kernel: "lanczos3" }).png({ compressionLevel: 9 }).toBuffer();
  writeFileSync(outPath, buf);
  console.log(`fact-puzzle-preview (text): wrote ${outPath} (${buf.length} bytes)`);
} finally {
  await browser.close();
  try { unlinkSync(tmp); } catch {}
}

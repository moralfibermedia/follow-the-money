#!/usr/bin/env node
// fact-puzzle-preview: render a 1200x630 OG PNG for a Follow the Money puzzle.
//
// Usage:
//   node render.mjs <path/to/preview.json>
//   node render.mjs <path/to/preview.json> -o <output.png>
//
// The JSON schema is documented in SKILL.md.

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));

function die(msg) {
  console.error(`fact-puzzle-preview: ${msg}`);
  process.exit(1);
}

// --- CLI ---
const args = process.argv.slice(2);
if (args.length === 0 || args.includes("-h") || args.includes("--help")) {
  console.log(`Usage: node render.mjs <preview.json> [-o output.png]`);
  process.exit(0);
}

const jsonPath = resolve(args[0]);
let outPath = null;
const oIdx = args.indexOf("-o");
if (oIdx !== -1) {
  if (!args[oIdx + 1]) die("-o requires a path argument");
  outPath = resolve(args[oIdx + 1]);
}
if (!outPath) outPath = join(dirname(jsonPath), "preview.png");

// --- Load and validate JSON ---
let cfg;
try {
  cfg = JSON.parse(readFileSync(jsonPath, "utf8"));
} catch (e) {
  die(`could not read/parse ${jsonPath}: ${e.message}`);
}

function need(field, type) {
  if (cfg[field] === undefined || cfg[field] === null) {
    die(`missing required field: "${field}"`);
  }
  if (type && typeof cfg[field] !== type) {
    die(`"${field}" must be ${type}, got ${typeof cfg[field]}`);
  }
}

need("number", "number");
need("episode", "string");
need("subjects");
need("subjectsNoun", "string");
need("matchVerb", "string");
need("charts");

if (!Array.isArray(cfg.subjects) || cfg.subjects.length < 2) {
  die(`"subjects" must be an array of at least 2 brand names`);
}
if (!Array.isArray(cfg.charts) || cfg.charts.length !== 3) {
  die(`"charts" must be an array of exactly 3 entries`);
}
for (const [i, c] of cfg.charts.entries()) {
  if (!c.letter || typeof c.dem !== "number" || typeof c.rep !== "number") {
    die(`charts[${i}] needs { letter, dem, rep } with numeric dem/rep`);
  }
  const sum = c.dem + c.rep;
  if (Math.abs(sum - 100) > 0.2) {
    console.warn(
      `fact-puzzle-preview: warning — charts[${i}] (${c.letter}) dem+rep = ${sum.toFixed(2)} (expected ~100). Bars may look off.`
    );
  }
}

// --- Substitute into template ---
const tplPath = join(__dirname, "template.html");
let html = readFileSync(tplPath, "utf8");

const numPadded = String(cfg.number).padStart(2, "0");
const dataLabel = cfg.dataLabel ?? "2024 Cycle · Federal · Corporate PAC";
const dataSource = cfg.dataSource === null ? null : (cfg.dataSource ?? "OpenSecrets.org");

const dataChipHtml = dataSource
  ? `<span class="data-chip"><span class="label">Data</span> <span class="source">${escapeHtml(dataSource)}</span></span>`
  : `<span></span>`;

const subjectsList = escapeHtml(cfg.subjects.join(", "));
const subjectsNoun = escapeHtml(cfg.subjectsNoun);
const matchVerb = escapeHtml(cfg.matchVerb);
const episode = escapeHtml(cfg.episode);

// Episode font auto-sizing: 52px is the comfortable default, drop to 44px for long titles.
// Headline area is ~540px wide; Playfair italic 900 at 52px averages ~25 chars/line.
const episodeFontSize = cfg.episode.length > 22 ? 44 : 52;

const chartRows = cfg.charts
  .map(
    (c) => `
      <div class="chart-row">
        <div class="chart-letter">${escapeHtml(c.letter)}</div>
        <div class="chart-bars">
          <div class="bar-line">
            <span class="bar-label">DEM</span>
            <div class="bar-track"><div class="bar-fill dem" style="width: ${c.dem}%"></div></div>
            <span class="bar-pct">${c.dem.toFixed(1)}%</span>
          </div>
          <div class="bar-line">
            <span class="bar-label">REP</span>
            <div class="bar-track"><div class="bar-fill rep" style="width: ${c.rep}%"></div></div>
            <span class="bar-pct">${c.rep.toFixed(1)}%</span>
          </div>
        </div>
      </div>`
  )
  .join("\n");

html = html
  .replaceAll("{{NUMBER_PADDED}}", numPadded)
  .replaceAll("{{EPISODE}}", episode)
  .replaceAll("{{EPISODE_FONT_SIZE}}", String(episodeFontSize))
  .replaceAll("{{SUBJECTS_LIST}}", subjectsList)
  .replaceAll("{{SUBJECTS_NOUN}}", subjectsNoun)
  .replaceAll("{{MATCH_VERB}}", matchVerb)
  .replaceAll("{{DATA_LABEL}}", escapeHtml(dataLabel))
  .replaceAll("{{DATA_CHIP}}", dataChipHtml)
  .replaceAll("{{CHART_ROWS}}", chartRows);

// --- Render ---
const tmpHtmlPath = join(__dirname, ".tmp-render.html");
writeFileSync(tmpHtmlPath, html);

const browser = await chromium.launch();
try {
  const ctx = await browser.newContext({
    viewport: { width: 1200, height: 630 },
    deviceScaleFactor: 2,
  });
  const page = await ctx.newPage();
  await page.goto("file://" + tmpHtmlPath, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(600);
  const buf2x = await page.screenshot({
    clip: { x: 0, y: 0, width: 1200, height: 630 },
  });
  // Downscale to exact 1200x630 to match OG meta tags.
  const buf = await sharp(buf2x).resize(1200, 630, { kernel: "lanczos3" }).png({ compressionLevel: 9 }).toBuffer();
  writeFileSync(outPath, buf);
  console.log(`fact-puzzle-preview: wrote ${outPath} (${buf.length} bytes)`);
} finally {
  await browser.close();
  try {
    // best-effort cleanup
    const { unlinkSync } = await import("node:fs");
    unlinkSync(tmpHtmlPath);
  } catch {}
}

function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

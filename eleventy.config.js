// Eleventy build for followthemoney.moralfibermedia.com
// Input: src/ · Output: _site/ · URLs pinned to the pre-Eleventy paths.
//
// Migration state (remove passthroughs as sections convert to src/):
//   E1 (done): bar-chart puzzle pages generated from data/puzzles.json; index.
//   E2 (todo): text-match + rank/over-under/timeline pages -> generated.
//   E3 (todo): fighters/legal/doj/reports -> src; generated sitemap.
module.exports = function (eleventyConfig) {
  // ---- static assets (root) ----
  ["robots.txt", "_headers", "favicon.ico", "favicon-16.png", "favicon-32.png",
   "apple-touch-icon.png", "preview.png"].forEach(f =>
    eleventyConfig.addPassthroughCopy(f));

  // future puzzle drafts (workflow dir; may not exist on every branch)
  if (require("fs").existsSync("drafts")) eleventyConfig.addPassthroughCopy("drafts");

  // ---- not-yet-converted sections served verbatim ----
  ["doj", "2026-ga-elections-legislation", "review",
  ].forEach(d => eleventyConfig.addPassthroughCopy(d));
  eleventyConfig.addPassthroughCopy("fighters/**/*.png");

  // preview art for the generated series pages (html is generated)
  ["americas-250th/**/*.png", "americas-250th/**/preview.json",
   "just-the-facts/**/*.png", "just-the-facts/**/preview.json",
   "speak-now/**/*.png", "speak-now/**/preview.json",
  ].forEach(g => eleventyConfig.addPassthroughCopy(g));

  // v1 arcade archive — the pre-migration pages, kept for side-by-side
  // comparison at /compare/ (noindex; canonicals point at the live pages)
  eleventyConfig.addPassthroughCopy("v1");

  // preview art for the generated bar-chart pages (html for those is generated)
  eleventyConfig.addPassthroughCopy("puzzles/**/*.png");
  eleventyConfig.addPassthroughCopy("puzzles/**/preview.json");

  // the live comment-count feed written by the GitHub Action
  eleventyConfig.addPassthroughCopy("data/comment-counts.json");

  // v2 site assets
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });

  // ---- filters ----
  eleventyConfig.addFilter("usd", n => "$" + Number(n).toLocaleString("en-US"));
  eleventyConfig.addFilter("pct1", n => (Math.round(Number(n) * 10) / 10).toFixed(1) + "%");
  eleventyConfig.addFilter("stripHint", s => String(s || "").replace(/^Hint:\s*/i, ""));
  eleventyConfig.addFilter("dump2", v => JSON.stringify(v));
  eleventyConfig.addFilter("emLast", t => {
    const w = String(t).split(" ");
    if (w.length === 1) return `<em>${t}</em>`;
    return w.slice(0, -1).join(" ") + " <em>" + w[w.length - 1] + "</em>";
  });
  eleventyConfig.addFilter("gameData", p => JSON.stringify({
    names: Object.fromEntries(p.companies.map(c => [c.id, c.name])),
    srcs: Object.fromEntries(p.companies.map(c => [c.id, c.opensecrets_url])),
  }));

  // leading-party-first bar rows, matching the v1 pages
  eleventyConfig.addFilter("barRows", c => {
    const dem = { p: "dem", label: "DEM", pct: c.dem_pct, amt: c.dem_amount };
    const rep = { p: "rep", label: "REP", pct: c.rep_pct, amt: c.rep_amount };
    return c.leading_party === "rep" ? [rep, dem] : [dem, rep];
  });

  // JSON-LD for text-match / rank / over-under / timeline pages
  eleventyConfig.addFilter("puzzleJsonld", p => {
    const base = "https://followthemoney.moralfibermedia.com";
    const url = `${base}/${p.path || ("puzzles/" + p.id)}`;
    const lic = p.data_license === "CC BY-NC-SA 3.0"
      ? "https://creativecommons.org/licenses/by-nc-sa/3.0/us/"
      : "https://creativecommons.org/licenses/by/4.0/";
    let hasPart;
    if (p.template === "text-match") {
      const names = Object.fromEntries((p.answers || []).map(a => [a.id, a.name]));
      hasPart = (p.facts || []).map(f => ({ "@type": "Question", "eduQuestionType": "Matching",
        "text": f.text, "acceptedAnswer": { "@type": "Answer", "text": names[f.answer] || f.answer } }));
    } else if (p.template === "rank") {
      hasPart = [{ "@type": "Question", "eduQuestionType": "Checkwork",
        "text": `Rank ${p.items.map(i => i.name).join(", ")} from most to least.`,
        "acceptedAnswer": { "@type": "Answer", "text": p.items.map(i => i.name).join(", ") } }];
    } else if (p.template === "timeline") {
      hasPart = [{ "@type": "Question", "eduQuestionType": "Checkwork",
        "text": `Put these events in chronological order: ${p.events.map(e => e.title).join("; ")}.`,
        "acceptedAnswer": { "@type": "Answer", "text": p.events.map(e => `${e.title} (${e.date})`).join("; ") } }];
    } else { // over-under
      hasPart = [{ "@type": "Question", "eduQuestionType": "Checkwork",
        "text": `Guess higher or lower through: ${p.cards.map(c => c.name).join(", ")}.`,
        "acceptedAnswer": { "@type": "Answer", "text": p.cards.map(c => `${c.name}: ${c.display}`).join("; ") } }];
    }
    return JSON.stringify({ "@context": "https://schema.org", "@graph": [
      { "@type": "BreadcrumbList", "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Puzzles", "item": base + "/" },
        { "@type": "ListItem", "position": 2, "name": p.title, "item": url }] },
      { "@type": "Quiz", "name": p.title, "url": url, "description": p.subtitle,
        "educationalUse": "Civic education", "inLanguage": "en",
        "publisher": { "@type": "Organization", "name": "Moral Fiber Media", "url": "https://moralfibermedia.com" },
        "license": lic, "hasPart": hasPart }] });
  });

  // reorder helper: items/events in scramble (display) order
  eleventyConfig.addFilter("byScramble", (list, scramble) =>
    scramble.map(id => list.find(x => x.id === id)));

  // JSON-LD for a bar-chart puzzle page
  eleventyConfig.addFilter("barchartJsonld", p => {
    const base = "https://followthemoney.moralfibermedia.com";
    const url = `${base}/puzzles/${p.id}`;
    return JSON.stringify({
      "@context": "https://schema.org",
      "@graph": [
        { "@type": "BreadcrumbList", "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Puzzles", "item": base + "/" },
          { "@type": "ListItem", "position": 2, "name": p.title, "item": url }] },
        { "@type": "Quiz", "name": p.title, "url": url,
          "description": p.subtitle, "educationalUse": "Civic education", "inLanguage": "en",
          "publisher": { "@type": "Organization", "name": "Moral Fiber Media", "url": "https://moralfibermedia.com" },
          "license": "https://creativecommons.org/licenses/by-nc-sa/3.0/us/",
          "hasPart": p.companies.map(c => ({
            "@type": "Question", "eduQuestionType": "Matching",
            "text": `Which company's 2024-cycle federal contribution profile totals ${"$" + Number(c.total).toLocaleString("en-US")}?`,
            "acceptedAnswer": { "@type": "Answer", "text": c.name } })) }
      ]
    });
  });

  return { dir: { input: "src", output: "_site", includes: "_includes", data: "_data" } };
};

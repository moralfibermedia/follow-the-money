// Conversational puzzle builder — the Studio's chat tab talks to Claude here.
//   POST { key, messages } → SSE stream (Anthropic events passed through,
//   plus our own `studio_status` events), so the editor watches the draft
//   appear live and Netlify's 10s buffered-response limit never bites.
// Gated by PUBLISH_KEY (same trust tier as opening a PR; fail-closed 401).
// Needs ANTHROPIC_API_KEY (500 "not configured" if unset). Neither secret is
// ever returned or logged.
//
// The function fetches any http(s) links in the newest user message
// server-side (deterministic, no beta features) and hands the extracted text
// to the model; the model can also web_search for corroborating primary
// sources. The client assembles text deltas + the propose_puzzle tool call
// from the stream.
const MODEL = "claude-sonnet-5";
const API = "https://api.anthropic.com/v1/messages";
const MAX_MESSAGES = 40;          // conversation cap (sanity)
const MAX_FETCH_CHARS = 12000;    // per fetched article
const MAX_URLS = 2;               // per user turn

const json = (o, s = 200) => new Response(JSON.stringify(o), {
  status: s, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", "x-robots-tag": "noindex" }
});

const SYSTEM = `You are the puzzle-drafting assistant inside the Moral Fiber Media Puzzle Studio, working WITH a human editor. Follow these house rules exactly:

- These are PUZZLES, not games — always say "puzzle."
- Editorial control is 100% human. You propose; the editor decides. Present drafts as proposals, invite corrections, and never push back twice on an editorial call.
- Every fact must carry at least one real source URL — the editor's supplied link and, where it strengthens the claim, a primary source (government, court, official filing) you found via web_search. NEVER invent or guess a URL. If you cannot source a claim, say so and leave it out.
- Tagline discipline: "We do the research. You solve the puzzle."
- Voice: plain language, short sentences, no hype. Title = punchy broadsheet (2-5 words). Subtitle = a one-line editorial promise. Hook = 1-2 sentences that make a reader curious; a surprising civic fact is the house specialty. Hint = optional and gentle.
- This chat builds TEXT-MATCH puzzles only (other mechanics live in the form tabs): 3-6 facts, each matching one short answer (1-4 words); the distinct answers become the tiles the player drags. Facts must be checkable statements, not opinions. Answers may repeat across facts.
- Workflow: read the editor's link and framing → if the angle is unclear, ask ONE clarifying question → call propose_puzzle when ready → after feedback, call propose_puzzle again with the FULL updated puzzle (it replaces the previous draft wholesale).
- Use web_search sparingly (statutes, filings, official bios) to corroborate key claims; cite only URLs that actually appeared in results.
- If the editor's link is a video (no transcript available to you), say so honestly and ask for the transcript or the key claims.`;

const PROPOSE_TOOL = {
  name: "propose_puzzle",
  description: "Propose a complete text-match puzzle draft to the editor. The studio renders it as a playable preview and fills the edit form. Call again with the full updated puzzle after any feedback.",
  input_schema: {
    type: "object",
    required: ["title", "subtitle", "hook", "facts"],
    properties: {
      title: { type: "string", description: "Punchy broadsheet title, 2-5 words" },
      subtitle: { type: "string", description: "One-line editorial promise" },
      hook: { type: "string", description: "1-2 sentences that make the reader curious" },
      hint: { type: "string", description: "Optional gentle hint; empty string if none" },
      series: { type: "string", enum: ["just-the-facts", "americas-250th", "speak-now"], description: "Series; default just-the-facts" },
      source_url: { type: "string", description: "The main article/video URL the editor supplied" },
      facts: {
        type: "array", minItems: 2, maxItems: 6,
        items: {
          type: "object",
          required: ["text", "match", "sources"],
          properties: {
            text: { type: "string", description: "The checkable fact/claim shown to the player" },
            match: { type: "string", description: "The short answer (1-4 words) this fact matches" },
            sources: {
              type: "array", minItems: 1,
              items: {
                type: "object", required: ["url"],
                properties: { url: { type: "string" }, label: { type: "string", description: "Short source label, e.g. 'Floridian Press' or 'Fla. Stat. §99.063'" } }
              }
            }
          }
        }
      }
    }
  }
};

// --- server-side article fetch (plain text extraction, no dependencies) ---
const stripHtml = (html) => html
  .replace(/<script[\s\S]*?<\/script>/gi, " ")
  .replace(/<style[\s\S]*?<\/style>/gi, " ")
  .replace(/<!--[\s\S]*?-->/g, " ")
  .replace(/<[^>]+>/g, " ")
  .replace(/&nbsp;|&#160;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
  .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(n))
  .replace(/\s+/g, " ").trim();

async function fetchArticle(url) {
  if (/(?:youtube\.com|youtu\.be|tiktok\.com|vimeo\.com)\//i.test(url))
    return "[This is a video link — no transcript is available. Ask the editor to paste the transcript or the key claims.]";
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 10000);
    const r = await fetch(url, { redirect: "follow", signal: ctrl.signal,
      headers: { "user-agent": "Mozilla/5.0 (compatible; mfm-puzzle-studio)" } });
    clearTimeout(t);
    if (!r.ok) return `[Fetch failed: HTTP ${r.status}]`;
    const html = await r.text();
    const title = (html.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1] || "";
    return (title ? "PAGE TITLE: " + stripHtml(title) + "\n\n" : "") + stripHtml(html).slice(0, MAX_FETCH_CHARS);
  } catch { return "[Fetch failed — the site may block robots. Ask the editor to paste the text.]"; }
}

const enc = new TextEncoder();
const sse = (type, obj) => enc.encode(`event: ${type}\ndata: ${JSON.stringify({ type, ...obj })}\n\n`);

export default async (req) => {
  if (req.method !== "POST") return new Response(null, { status: 405 });
  let d;
  try { d = await req.json(); } catch { return json({ error: "bad json" }, 400); }

  const KEY = process.env.PUBLISH_KEY, API_KEY = process.env.ANTHROPIC_API_KEY;
  if (!KEY || d.key !== KEY) return json({ error: "unauthorized" }, 401);
  if (!API_KEY) return json({ error: "server not configured — set ANTHROPIC_API_KEY" }, 500);

  const messages = Array.isArray(d.messages) ? d.messages.slice(-MAX_MESSAGES) : [];
  if (!messages.length) return json({ error: "no messages" }, 400);

  // Stream from the first byte: status events while we fetch/connect, then the
  // Anthropic SSE stream passed through verbatim.
  const stream = new ReadableStream({
    async start(controller) {
      try {
        // Fetch links in the newest user message and append the extracted text.
        const last = messages[messages.length - 1];
        if (last && last.role === "user" && typeof last.content === "string") {
          const urls = (last.content.match(/https?:\/\/[^\s<>"')\]]+/g) || []).slice(0, MAX_URLS);
          for (const u of urls) {
            controller.enqueue(sse("studio_status", { text: "reading " + u.replace(/^https?:\/\//, "").split("/")[0] + "…" }));
            last.content += `\n\n--- Fetched from ${u} ---\n${await fetchArticle(u)}`;
          }
        }

        controller.enqueue(sse("studio_status", { text: "Claude is thinking…" }));
        const r = await fetch(API, {
          method: "POST",
          headers: { "x-api-key": API_KEY, "anthropic-version": "2023-06-01", "content-type": "application/json" },
          body: JSON.stringify({
            model: MODEL, max_tokens: 4096, stream: true, system: SYSTEM, messages,
            tools: [{ type: "web_search_20250305", name: "web_search", max_uses: 4 }, PROPOSE_TOOL],
          }),
        });
        if (!r.ok) {
          const body = await r.json().catch(() => ({}));
          controller.enqueue(sse("studio_error", { text: (body.error && body.error.message) || ("API error " + r.status) }));
          controller.close(); return;
        }
        const reader = r.body.getReader();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          controller.enqueue(value);
        }
      } catch (e) {
        try { controller.enqueue(sse("studio_error", { text: String(e && e.message || e) })); } catch {}
      }
      try { controller.close(); } catch {}
    },
  });

  return new Response(stream, {
    headers: { "content-type": "text/event-stream; charset=utf-8", "cache-control": "no-store", "x-robots-tag": "noindex" },
  });
};

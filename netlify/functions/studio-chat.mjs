// Conversational puzzle builder — the Studio's chat tab talks to Claude here.
//   POST { key, messages } → { reply, proposal?, tool_use_id?, assistant }
// Gated by PUBLISH_KEY (same trust tier as opening a PR; fail-closed 401).
// Needs ANTHROPIC_API_KEY (500 "not configured" if unset). Neither secret is
// ever returned or logged.
//
// The function fetches any http(s) links in the newest user message
// server-side (deterministic, no beta features) and hands the extracted text
// to the model; the model can also web_search for corroborating primary
// sources. When the model calls propose_puzzle, the tool input comes back as
// `proposal` and the page renders/edits it — the human editor decides.
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

export default async (req) => {
  if (req.method !== "POST") return new Response(null, { status: 405 });
  let d;
  try { d = await req.json(); } catch { return json({ error: "bad json" }, 400); }

  const KEY = process.env.PUBLISH_KEY, API_KEY = process.env.ANTHROPIC_API_KEY;
  if (!KEY || d.key !== KEY) return json({ error: "unauthorized" }, 401);
  if (!API_KEY) return json({ error: "server not configured — set ANTHROPIC_API_KEY" }, 500);

  const messages = Array.isArray(d.messages) ? d.messages.slice(-MAX_MESSAGES) : [];
  if (!messages.length) return json({ error: "no messages" }, 400);

  // Fetch links in the newest user message and append the extracted text.
  const last = messages[messages.length - 1];
  if (last && last.role === "user" && typeof last.content === "string") {
    const urls = (last.content.match(/https?:\/\/[^\s<>"')\]]+/g) || []).slice(0, MAX_URLS);
    if (urls.length) {
      const fetched = await Promise.all(urls.map(async (u) => `--- Fetched from ${u} ---\n${await fetchArticle(u)}`));
      last.content += "\n\n" + fetched.join("\n\n");
    }
  }

  const r = await fetch(API, {
    method: "POST",
    headers: { "x-api-key": API_KEY, "anthropic-version": "2023-06-01", "content-type": "application/json" },
    body: JSON.stringify({
      model: MODEL, max_tokens: 4096, system: SYSTEM, messages,
      tools: [{ type: "web_search_20250305", name: "web_search", max_uses: 4 }, PROPOSE_TOOL],
    }),
  });
  const body = await r.json().catch(() => ({}));
  if (!r.ok) return json({ error: "api error", detail: body.error && body.error.message || r.status }, 502);

  // Text for the thread; proposal if the model called propose_puzzle.
  const reply = (body.content || []).filter((b) => b.type === "text").map((b) => b.text).join("\n").trim();
  const call = (body.content || []).find((b) => b.type === "tool_use" && b.name === "propose_puzzle");

  // What the client should push onto its history as the assistant turn:
  // text + tool_use only (server-tool blocks stay out of the running history).
  const assistant = {
    role: "assistant",
    content: (body.content || [])
      .filter((b) => b.type === "text" || (b.type === "tool_use" && b.name === "propose_puzzle"))
      .map((b) => b.type === "text" ? { type: "text", text: b.text } : { type: "tool_use", id: b.id, name: b.name, input: b.input }),
  };
  if (!assistant.content.length) assistant.content = [{ type: "text", text: "(no reply)" }];

  return json({ reply, proposal: call ? call.input : null, tool_use_id: call ? call.id : null, assistant });
};

// Puzzle Studio → GitHub. Takes a finished puzzle entry, commits it to a new
// branch, and opens a PR — so the deploy preview is the review surface and
// nothing goes live until a human merges. Fail-closed: 401 unless PUBLISH_KEY
// is set AND matches; 500 (unconfigured) unless GITHUB_TOKEN is set. Neither
// secret is ever returned or logged.
const OWNER = "moralfibermedia", REPO = "follow-the-money", API = "https://api.github.com";
const json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { "content-type": "application/json", "cache-control": "no-store" } });

async function gh(path, token, opts = {}) {
  const r = await fetch(API + path, {
    method: opts.method || "GET",
    headers: { authorization: "token " + token, accept: "application/vnd.github+json", "content-type": "application/json", "user-agent": "mfm-puzzle-studio" },
    body: opts.body,
  });
  const body = await r.json().catch(() => ({}));
  return { ok: r.ok, status: r.status, body };
}
const b64e = (s) => Buffer.from(s, "utf8").toString("base64");
const b64d = (s) => Buffer.from(s, "base64").toString("utf8");

export default async (req) => {
  if (req.method !== "POST") return new Response(null, { status: 405 });
  let d;
  try { d = await req.json(); } catch { return json({ error: "bad json" }, 400); }

  const KEY = process.env.PUBLISH_KEY, TOKEN = process.env.GITHUB_TOKEN;
  if (!KEY || d.key !== KEY) return json({ error: "unauthorized" }, 401);
  if (!TOKEN) return json({ error: "server not configured — set GITHUB_TOKEN" }, 500);

  const entry = d.puzzle;
  if (!entry || !entry.template) return json({ error: "missing puzzle template" }, 400);
  const id = String(entry.id || "").toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/^-+|-+$/g, "");
  if (!id) return json({ error: "missing/invalid id" }, 400);
  entry.id = id;

  try {
    const ref = await gh(`/repos/${OWNER}/${REPO}/git/ref/heads/main`, TOKEN);
    if (!ref.ok) return json({ error: "base ref failed", detail: ref.body.message }, 502);
    const branch = "studio/" + id;

    await gh(`/repos/${OWNER}/${REPO}/git/refs`, TOKEN, { method: "POST", body: JSON.stringify({ ref: "refs/heads/" + branch, sha: ref.body.object.sha }) }); // ok if exists

    const cur = await gh(`/repos/${OWNER}/${REPO}/contents/data/puzzles.json?ref=main`, TOKEN);
    if (!cur.ok) return json({ error: "read puzzles.json failed", detail: cur.body.message }, 502);
    const data = JSON.parse(b64d(cur.body.content));
    if (data.puzzles.some((p) => p.id === id)) return json({ error: "a puzzle with id '" + id + "' already exists" }, 409);
    data.puzzles.push(entry);

    const put = await gh(`/repos/${OWNER}/${REPO}/contents/data/puzzles.json`, TOKEN, {
      method: "PUT",
      body: JSON.stringify({ message: "Studio: add puzzle " + id, content: b64e(JSON.stringify(data, null, 2) + "\n"), sha: cur.body.sha, branch }),
    });
    if (!put.ok) return json({ error: "commit failed", detail: put.body.message }, 502);

    if (d.preview && entry.path) {
      const ppath = String(entry.path).replace(/\/+$/, "") + "/preview.json";
      await gh(`/repos/${OWNER}/${REPO}/contents/${ppath}`, TOKEN, {
        method: "PUT",
        body: JSON.stringify({ message: "Studio: preview.json for " + id, content: b64e(JSON.stringify(d.preview, null, 2) + "\n"), branch }),
      });
    }

    const pr = await gh(`/repos/${OWNER}/${REPO}/pulls`, TOKEN, {
      method: "POST",
      body: JSON.stringify({
        title: "Studio draft: " + (entry.title || id),
        head: branch, base: "main",
        body: "Puzzle drafted in the Studio. Review the deploy preview, then merge to publish.\n\nNote: the preview.png (OG card + in-article cover) may still need rendering before merge — ask Claude to run the fact-puzzle-preview skill on `" + (entry.path || "puzzles/" + id) + "`.",
      }),
    });
    if (!pr.ok) return json({ error: "open PR failed", detail: pr.body.message }, 502);

    return json({ ok: true, pr: pr.body.html_url, branch });
  } catch (e) { return json({ error: "exception", detail: String(e && e.message || e) }, 500); }
};

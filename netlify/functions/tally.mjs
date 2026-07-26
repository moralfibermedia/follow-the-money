// Anonymous puzzle completion tallies. Stores AGGREGATE counts only —
// never a user, a session, an IP, or a cookie. One blob object of the shape:
//   { "<puzzle-id>": { starts, complete, perfect, cleared, finished, timeSum, timeCount } }
// Fed by navigator.sendBeacon from the client on start + win (Do-Not-Track honored client-side).
import { getStore } from "@netlify/blobs";

const KEY = "stats";
const clean = (s) => String(s || "").slice(0, 64).replace(/[^a-z0-9-]/gi, "");
const parseTime = (t) => { const m = /^(\d+):(\d\d)$/.exec(String(t || "")); return m ? (+m[1] * 60 + +m[2]) : 0; };

export default async (req) => {
  if (req.method !== "POST") return new Response("", { status: 405 });
  let d;
  try { d = await req.json(); } catch { return new Response("", { status: 400 }); }

  const puzzle = clean(d.puzzle);
  if (!puzzle) return new Response("", { status: 400 });

  try {
    const store = getStore("puzzle-stats");
    const stats = (await store.get(KEY, { type: "json" })) || {};
    const s = stats[puzzle] || { starts: 0, complete: 0, perfect: 0, cleared: 0, finished: 0, timeSum: 0, timeCount: 0 };

    if (d.event === "start") {
      s.starts++;
    } else if (d.event === "complete") {
      s.complete++;
      const rank = String(d.rank || "").toLowerCase();
      if (rank === "perfect") s.perfect++;
      else if (rank === "cleared") s.cleared++;
      else if (rank === "finished") s.finished++;
      const secs = parseTime(d.time);
      if (secs) { s.timeSum += secs; s.timeCount++; }
    } else {
      return new Response("", { status: 400 });
    }

    stats[puzzle] = s;
    await store.setJSON(KEY, stats);
    return new Response(null, { status: 204 });
  } catch {
    return new Response(null, { status: 500 });
  }
};

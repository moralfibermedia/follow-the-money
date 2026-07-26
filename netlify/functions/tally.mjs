// Anonymous puzzle events, append-only. Each ping writes ONE new blob with a
// unique key that ENCODES the event — so writes never overwrite each other and
// there is no read-modify-write race, regardless of region or consistency.
//   key: e/<puzzle>/<type>/<rank>/<secs>/<uuid>
//     type: s (start) | c (complete)   rank: p|c|f|-   secs: solve seconds
// Aggregate counts only ever exist as a sum over these keys — never a user,
// session, IP, or cookie. Do-Not-Track is honored client-side.
import { getStore } from "@netlify/blobs";
import { randomUUID } from "node:crypto";

const clean = (s) => String(s || "").slice(0, 64).replace(/[^a-z0-9-]/gi, "");
const parseTime = (t) => { const m = /^(\d+):(\d\d)$/.exec(String(t || "")); return m ? (+m[1] * 60 + +m[2]) : 0; };

export default async (req) => {
  if (req.method !== "POST") return new Response(null, { status: 405 });
  let d;
  try { d = await req.json(); } catch { return new Response(null, { status: 400 }); }

  const puzzle = clean(d.puzzle);
  if (!puzzle) return new Response(null, { status: 400 });

  let type, rank = "-", secs = 0;
  if (d.event === "start") {
    type = "s";
  } else if (d.event === "complete") {
    type = "c";
    const r = String(d.rank || "").toLowerCase();
    rank = r === "perfect" ? "p" : r === "cleared" ? "c" : r === "finished" ? "f" : "-";
    secs = parseTime(d.time);
  } else {
    return new Response(null, { status: 400 });
  }

  try {
    const store = getStore("completions");
    await store.set(`e/${puzzle}/${type}/${rank}/${secs}/${randomUUID()}`, "1");
    return new Response(null, { status: 204 });
  } catch {
    return new Response(null, { status: 500 });
  }
};

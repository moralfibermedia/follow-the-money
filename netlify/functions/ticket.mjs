// Dream Ticket straw poll — anonymous, append-only, aggregate only.
// POST { pres, vp }  -> appends one immutable key  t/<pres>/<vp>/<uuid>
// GET                -> returns { total, combos, pres, vp } aggregated from list()
// No cookies, no identifiers, no per-user rows. Public read (the leaderboard IS the point).
import { getStore } from "@netlify/blobs";
import { randomUUID } from "node:crypto";

const clean = (s) => String(s || "").slice(0, 40).replace(/[^a-z0-9-]/gi, "");
const json = (obj) => new Response(JSON.stringify(obj), { headers: { "content-type": "application/json; charset=utf-8" } });

export default async (req) => {
  const store = getStore("dream-tickets");

  if (req.method === "POST") {
    let d;
    try { d = await req.json(); } catch { return new Response(null, { status: 400 }); }
    const pres = clean(d.pres), vp = clean(d.vp);
    if (!pres || !vp || pres === vp) return new Response(null, { status: 400 });
    try {
      await store.set(`t/${pres}/${vp}/${randomUUID()}`, "1");
      return new Response(null, { status: 204 });
    } catch { return new Response(null, { status: 500 }); }
  }

  if (req.method === "GET") {
    try {
      const combos = {}, pres = {}, vp = {};
      let total = 0, cursor;
      do {
        const res = await store.list({ prefix: "t/", cursor });
        for (const b of res.blobs) {
          const p = b.key.split("/");
          if (p.length < 4) continue;
          combos[p[1] + "/" + p[2]] = (combos[p[1] + "/" + p[2]] || 0) + 1;
          pres[p[1]] = (pres[p[1]] || 0) + 1;
          vp[p[2]] = (vp[p[2]] || 0) + 1;
          total++;
        }
        cursor = res.cursor;
      } while (cursor);
      return json({ total, combos, pres, vp });
    } catch { return json({ total: 0, combos: {}, pres: {}, vp: {} }); }
  }

  return new Response(null, { status: 405 });
};

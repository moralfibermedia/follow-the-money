// Dream Ticket straw poll — anonymous, append-only, aggregate only.
// POST { pres, vp }  -> appends one immutable key  t/<pres>/<vp>/<uuid>
// GET                -> returns { total, combos, pres, vp } aggregated from list()
// No cookies, no identifiers, no per-user rows. Public read (the leaderboard IS the point).
import { getStore } from "@netlify/blobs";
import { randomUUID } from "node:crypto";

const clean = (s) => String(s || "").slice(0, 40).replace(/[^a-z0-9-]/gi, "");
const json = (obj) => new Response(JSON.stringify(obj), { headers: { "content-type": "application/json; charset=utf-8" } });

export default async (req) => {
  const store = getStore("ticket-votes");

  if (req.method === "POST") {
    let d;
    try { d = await req.json(); } catch { return new Response(null, { status: 400 }); }
    const pres = clean(d.pres), vp = clean(d.vp);
    if (!pres || !vp || pres === vp) return new Response(null, { status: 400 });
    // "retract" appends an anonymous -1 for a combo (used by change-my-ticket);
    // votes and retractions are both immutable events, netted at read time.
    const prefix = d.event === "retract" ? "r" : "t";
    try {
      await store.set(`${prefix}/${pres}/${vp}/${randomUUID()}`, "1");
      return new Response(null, { status: 204 });
    } catch { return new Response(null, { status: 500 }); }
  }

  if (req.method === "GET") {
    try {
      const raw = {};
      for (const prefix of ["t/", "r/"]) {
        let cursor;
        do {
          const res = await store.list({ prefix, cursor });
          for (const b of res.blobs) {
            const p = b.key.split("/");
            if (p.length < 4) continue;
            const combo = p[1] + "/" + p[2];
            raw[combo] = (raw[combo] || 0) + (p[0] === "t" ? 1 : -1);
          }
          cursor = res.cursor;
        } while (cursor);
      }
      const combos = {}, pres = {}, vp = {};
      let total = 0;
      for (const [combo, n] of Object.entries(raw)) {
        if (n <= 0) continue; // netted out (or over-retracted) combos drop away
        const [pr, v] = combo.split("/");
        combos[combo] = n;
        pres[pr] = (pres[pr] || 0) + n;
        vp[v] = (vp[v] || 0) + n;
        total += n;
      }
      return json({ total, combos, pres, vp });
    } catch { return json({ total: 0, combos: {}, pres: {}, vp: {} }); }
  }

  return new Response(null, { status: 405 });
};

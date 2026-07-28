// Dream Ticket ranked straw poll — anonymous, append-only, aggregate only.
// A ballot is up to three ranked tickets (1st/2nd/3rd). Each ranked pick is
// its own immutable key; nothing is ever overwritten, and no record can be
// tied to a person (no cookie, no id, no session, no IP).
//   POST { rankings: [ {pres,vp}, ... ], event? }   event "retract" writes -1s
//   key  t|r / <pres> / <vp> / <rank> / <uuid>       rank = 1..3
//   GET  -> { ballots, combos: { "pres/vp": {points, first} } }   Borda 3/2/1
import { getStore } from "@netlify/blobs";
import { randomUUID } from "node:crypto";

const clean = (s) => String(s || "").slice(0, 40).replace(/[^a-z0-9-]/gi, "");
const json = (obj) => new Response(JSON.stringify(obj), { headers: { "content-type": "application/json; charset=utf-8" } });
const weight = (rank) => (rank === 1 ? 3 : rank === 2 ? 2 : 1);

export default async (req) => {
  const store = getStore("ticket-votes");

  if (req.method === "POST") {
    let d;
    try { d = await req.json(); } catch { return new Response(null, { status: 400 }); }

    // Operator-only reset: purge all votes and stamp a fresh "since" date.
    // Gated by the TICKET_ADMIN_KEY env var (set in Netlify) — only we can do it.
    if (d.event === "reset") {
      if (!process.env.TICKET_ADMIN_KEY || d.key !== process.env.TICKET_ADMIN_KEY)
        return new Response(null, { status: 401 });
      try {
        for (const prefix of ["t/", "r/"]) {
          let cursor;
          do {
            const res = await store.list({ prefix, cursor });
            for (const b of res.blobs) await store.delete(b.key);
            cursor = res.cursor;
          } while (cursor);
        }
        await store.setJSON("meta", { resetAt: new Date().toISOString() });
        return new Response(null, { status: 204 });
      } catch { return new Response(null, { status: 500 }); }
    }

    var rankings = Array.isArray(d.rankings) ? d.rankings
      : (d.pres && d.vp ? [{ pres: d.pres, vp: d.vp }] : []); // back-compat single pick
    rankings = rankings.slice(0, 3);
    const prefix = d.event === "retract" ? "r" : "t";
    const seen = {};
    let wrote = 0;
    try {
      for (let i = 0; i < rankings.length; i++) {
        const pres = clean(rankings[i].pres), vp = clean(rankings[i].vp);
        if (!pres || !vp || pres === vp) continue;
        const combo = pres + "/" + vp;
        if (seen[combo]) continue; // no dup tickets within one ballot
        seen[combo] = 1;
        await store.set(`${prefix}/${pres}/${vp}/${i + 1}/${randomUUID()}`, "1");
        wrote++;
      }
      return new Response(null, { status: wrote ? 204 : 400 });
    } catch { return new Response(null, { status: 500 }); }
  }

  if (req.method === "GET") {
    try {
      const raw = {}; // combo -> { points, first }
      for (const prefix of ["t/", "r/"]) {
        let cursor;
        do {
          const res = await store.list({ prefix, cursor });
          for (const b of res.blobs) {
            const p = b.key.split("/");
            if (p.length < 4) continue;
            const combo = p[1] + "/" + p[2];
            // 5-part keys carry a rank; legacy 4-part keys are a first choice
            const rank = p.length >= 5 ? parseInt(p[3], 10) || 1 : 1;
            const sign = p[0] === "t" ? 1 : -1;
            const r = raw[combo] || (raw[combo] = { points: 0, first: 0 });
            r.points += sign * weight(rank);
            if (rank === 1) r.first += sign;
          }
          cursor = res.cursor;
        } while (cursor);
      }
      const combos = {};
      let ballots = 0;
      for (const [combo, r] of Object.entries(raw)) {
        if (r.points > 0) combos[combo] = { points: r.points, first: Math.max(0, r.first) };
        if (r.first > 0) ballots += r.first;
      }
      const meta = await store.get("meta", { type: "json" }).catch(() => null);
      return json({ ballots, combos, since: (meta && meta.resetAt) || null });
    } catch { return json({ ballots: 0, combos: {}, since: null }); }
  }

  return new Response(null, { status: 405 });
};

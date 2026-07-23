// Over/under engine (v2). window.__PUZZLE = { cards:[{id,value,prefix,suffix,display,name,context,source_url,source_label}] }
(function () {
  const P = window.__PUZZLE; const cards = P.cards; const ROUNDS = cards.length - 1;
  let round = 0, anchor = 0, correct = 0, streak = 0, best = 0, waiting = false, raf = null;
  const $ = id => document.getElementById(id);
  window.startPuzzle = function () {
    document.getElementById("fig").classList.add("playing");
    begin();
    setTimeout(() => document.getElementById("fig").scrollIntoView({ behavior: "smooth", block: "start" }), 250);
  };
  const fmt = (c, v) => c.prefix + Math.round(v).toLocaleString("en-US") + c.suffix;
  function begin() {
    round = 0; anchor = 0; correct = 0; streak = 0; best = 0; waiting = false;
    $("m").textContent = "0"; $("st").textContent = "0";
    document.querySelectorAll(".oudot").forEach(d => d.className = "oudot");
    const a = cards[0];
    $("aname").textContent = a.name; $("actx").textContent = a.context; $("afig").textContent = a.display;
    load();
  }
  function load() {
    waiting = false;
    const c = cards[round + 1];
    $("cslot").className = "ouslot challenger";
    $("cname").textContent = c.name; $("cctx").textContent = c.context;
    const f = $("cfig"); f.textContent = "?"; f.className = "oufig mystery";
    $("csrc").classList.remove("visible");
    const l = $("csrclink"); l.href = c.source_url; l.textContent = c.source_label;
    $("bh").disabled = false; $("bl").disabled = false;
    $("nextb").classList.remove("show");
    $("sn").textContent = "?";
    $("tt").textContent = `Is ${c.name}'s figure higher or lower than ${cards[anchor].name}'s?`;
    document.querySelectorAll(".oudot").forEach((d, i) => d.classList.toggle("current", i === round));
  }
  window.guess = function (dir) {
    if (waiting) return; waiting = true;
    const a = cards[anchor], c = cards[round + 1];
    $("bh").disabled = true; $("bl").disabled = true;
    const actual = c.value === a.value ? dir : (c.value > a.value ? "higher" : "lower");
    const ok = dir === actual;
    countUp($("cfig"), c, () => {
      $("cslot").classList.add(ok ? "reveal-ok" : "reveal-no");
      if (!ok) { $("cslot").classList.add("wrong"); setTimeout(() => $("cslot").classList.remove("wrong"), 450); }
      $("csrc").classList.add("visible");
      const dot = document.querySelectorAll(".oudot")[round];
      dot.classList.remove("current"); dot.classList.add(ok ? "ok" : "no");
      if (ok) { correct++; streak++; best = Math.max(best, streak); } else streak = 0;
      $("m").textContent = correct; $("st").textContent = streak;
      $("sn").textContent = ok ? "✓" : "✗";
      $("tt").textContent = (ok ? "Correct — it was " : "Not quite — it was ") + actual + ".";
      if (round + 1 >= ROUNDS) $("nextb").textContent = "▶ See results";
      $("nextb").classList.add("show");
    });
  };
  function countUp(el, c, cb) {
    el.className = "oufig";
    const dur = 900; let t0 = null;
    if (raf) cancelAnimationFrame(raf);
    function step(ts) {
      if (t0 === null) t0 = ts;
      const t = Math.min((ts - t0) / dur, 1), e = 1 - Math.pow(1 - t, 3);
      el.textContent = fmt(c, c.value * e);
      if (t < 1) raf = requestAnimationFrame(step);
      else { el.textContent = c.display; raf = null; cb(); }
    }
    raf = requestAnimationFrame(step);
  }
  window.nextRound = function () {
    anchor = round + 1; round++;
    if (round >= ROUNDS) { win(); return; }
    const a = cards[anchor];
    $("aname").textContent = a.name; $("actx").textContent = a.context;
    $("afig").textContent = a.display; $("afig").className = "oufig";
    load();
  };
  function win() {
    const r = correct === ROUNDS ? ["perfect","Perfect","★★★"] : correct === ROUNDS - 1 ? ["cleared","Cleared","★★☆"] : ["finished","Finished","★☆☆"];
    $("rank").className = "rank " + r[0]; $("rankLabel").textContent = r[1]; $("stars").textContent = r[2];
    $("beststreak").textContent = best;
    $("doneb").classList.add("show");
  }
  window.sharePuzzle = function () {
    const url = location.origin + location.pathname, text = document.querySelector('meta[name="description"]').content;
    if (navigator.share) { navigator.share({ title: document.title, text, url }).catch(() => {}); return; }
    navigator.clipboard && navigator.clipboard.writeText(text + "\n" + url).then(() => {
      const b = $("shareb"), o = b.textContent; b.textContent = "✓ Link copied"; setTimeout(() => b.textContent = o, 2200); });
  };
  window.resetPuzzle = function () { $("doneb").classList.remove("show"); begin(); };
  const cov = document.querySelector(".fig-cover");
  if (cov) cov.addEventListener("click", e => { if (!e.target.closest("a")) window.startPuzzle(); });
})();

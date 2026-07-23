// Bar-chart puzzle engine (v2, generic). Each page defines:
//   window.__PUZZLE = { names: {id: "Display Name"}, srcs: {id: "opensecrets url"} }
(function () {
  const P = window.__PUZZLE || { names: {}, srcs: {} };
  const TOTAL = Object.keys(P.names).length || 3;
  let sel = null, matches = 0, attempts = 0;

  window.startPuzzle = function () {
    document.getElementById("fig").classList.add("playing");
    setTimeout(() => document.querySelectorAll(".bfill").forEach(b => b.style.width = b.dataset.target + "%"), 150);
    setTimeout(() => document.getElementById("fig").scrollIntoView({ behavior: "smooth", block: "start" }), 250);
  };

  function instr() {
    const tl = document.getElementById("tl"), sn = document.getElementById("sn"), tt = document.getElementById("tt");
    const drops = document.querySelectorAll(".drop:not(.done)");
    if (matches === TOTAL) { tl.classList.remove("armed"); tl.classList.add("complete"); sn.textContent = "✓"; tt.textContent = "Done — sources revealed"; return; }
    if (sel) { tl.classList.add("armed"); sn.textContent = "2"; tt.textContent = "Now tap the chart you think matches";
      drops.forEach(d => d.textContent = "Tap to place " + P.names[sel.dataset.company]); }
    else { tl.classList.remove("armed"); sn.textContent = "1"; tt.textContent = "Tap a company below";
      drops.forEach(d => d.textContent = "Match a company here"); }
  }

  window.pick = function (t) {
    if (t.classList.contains("placed")) return;
    document.querySelectorAll(".tile").forEach(x => x.classList.remove("selected"));
    sel = t; t.classList.add("selected");
    document.getElementById("tiles").classList.remove("attention");
    instr();
  };

  document.querySelectorAll(".drop").forEach(d => d.addEventListener("click", function () {
    if (!sel || this.classList.contains("done")) return;
    attempts++; document.getElementById("a").textContent = attempts;
    const g = sel.dataset.company, w = this.dataset.company, card = this.closest(".card");
    if (g === w) {
      matches++; document.getElementById("m").textContent = matches;
      this.classList.add("done"); this.textContent = "✓ " + P.names[g];
      card.classList.add("matched");
      document.getElementById("src-" + g).innerHTML =
        '<a href="' + P.srcs[g] + '" target="_blank" rel="noopener">source: opensecrets.org ↗</a>';
      sel.classList.add("placed"); sel.classList.remove("selected"); sel = null; instr();
      if (matches === TOTAL) setTimeout(win, 500);
    } else {
      card.classList.add("wrong"); setTimeout(() => card.classList.remove("wrong"), 450);
    }
  }));

  function win() {
    const r = attempts <= TOTAL ? ["perfect", "Perfect", "★★★"]
      : attempts <= TOTAL + 2 ? ["cleared", "Cleared", "★★☆"]
      : ["finished", "Finished", "★☆☆"];
    const el = document.getElementById("rank");
    el.className = "rank " + r[0];
    document.getElementById("rankLabel").textContent = r[1];
    document.getElementById("stars").textContent = r[2];
    document.getElementById("doneb").classList.add("show");
  }

  window.sharePuzzle = function () {
    const url = location.origin + location.pathname;
    const text = document.querySelector('meta[name="description"]').content;
    if (navigator.share) { navigator.share({ title: document.title, text, url }).catch(() => {}); return; }
    (navigator.clipboard ? navigator.clipboard.writeText(text + "\n" + url) : Promise.reject())
      .then(() => { const b = document.getElementById("shareb"); const o = b.textContent;
        b.textContent = "✓ Link copied"; setTimeout(() => b.textContent = o, 2200); })
      .catch(() => {});
  };

  window.resetPuzzle = function () {
    sel = null; matches = 0; attempts = 0;
    document.getElementById("m").textContent = "0"; document.getElementById("a").textContent = "0";
    document.getElementById("doneb").classList.remove("show");
    document.querySelectorAll(".card").forEach(c => c.classList.remove("matched", "wrong"));
    document.querySelectorAll(".drop").forEach(d => { d.classList.remove("done"); d.textContent = "Match a company here"; });
    document.querySelectorAll(".srcline").forEach(s => s.innerHTML = "");
    document.querySelectorAll(".tile").forEach(t => t.classList.remove("placed", "selected"));
    document.getElementById("tiles").classList.add("attention");
    const tl = document.getElementById("tl"); tl.classList.remove("complete", "armed"); instr();
    document.querySelectorAll(".bfill").forEach(b => { b.style.width = "0%"; });
    setTimeout(() => document.querySelectorAll(".bfill").forEach(b => b.style.width = b.dataset.target + "%"), 120);
  };
  const cov = document.querySelector(".fig-cover");
  if (cov) cov.addEventListener("click", e => { if (!e.target.closest("a")) window.startPuzzle(); });
})();

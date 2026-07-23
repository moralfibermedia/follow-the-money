// Text-match engine (v2). window.__PUZZLE = { names:{id:name}, total:N, reveal:"..." }
(function () {
  const P = window.__PUZZLE; let sel = null, matches = 0, attempts = 0;
  window.startPuzzle = function () {
    document.getElementById("fig").classList.add("playing");
    setTimeout(() => document.getElementById("fig").scrollIntoView({ behavior: "smooth", block: "start" }), 250);
  };
  function instr() {
    const tl = document.getElementById("tl"), sn = document.getElementById("sn"), tt = document.getElementById("tt");
    const drops = document.querySelectorAll(".fact:not(.matched) .drop");
    if (matches === P.total) { tl.classList.remove("armed"); tl.classList.add("complete"); sn.textContent = "✓"; tt.textContent = "Done — sources revealed"; return; }
    if (sel) { tl.classList.add("armed"); sn.textContent = "2"; tt.textContent = "Now tap where it belongs";
      drops.forEach(d => d.textContent = "Tap to place " + P.names[sel.dataset.company]); }
    else { tl.classList.remove("armed"); sn.textContent = "1"; tt.textContent = "Tap an answer below";
      drops.forEach(d => d.textContent = "Match an answer here"); }
  }
  window.pick = function (t) {
    document.querySelectorAll(".tile").forEach(x => x.classList.remove("selected"));
    sel = t; t.classList.add("selected");
    document.getElementById("tiles").classList.remove("attention"); instr();
  };
  document.querySelectorAll(".fact").forEach(card => card.addEventListener("click", function () {
    if (!sel || this.classList.contains("matched")) return;
    attempts++; document.getElementById("a").textContent = attempts;
    if (sel.dataset.company === this.dataset.correct) {
      matches++; document.getElementById("m").textContent = matches;
      this.classList.add("matched");
      this.querySelector(".drop").textContent = "✓ " + P.names[sel.dataset.company];
      instr();
      if (matches === P.total) setTimeout(win, 500);
    } else { this.classList.add("wrong"); setTimeout(() => this.classList.remove("wrong"), 450); }
  }));
  function win() {
    const r = attempts <= P.total ? ["perfect","Perfect","★★★"] : attempts <= P.total + 2 ? ["cleared","Cleared","★★☆"] : ["finished","Finished","★☆☆"];
    document.getElementById("rank").className = "rank " + r[0];
    document.getElementById("rankLabel").textContent = r[1];
    document.getElementById("stars").textContent = r[2];
    document.getElementById("doneb").classList.add("show");
  }
  window.sharePuzzle = function () {
    const url = location.origin + location.pathname, text = document.querySelector('meta[name="description"]').content;
    if (navigator.share) { navigator.share({ title: document.title, text, url }).catch(() => {}); return; }
    navigator.clipboard && navigator.clipboard.writeText(text + "\n" + url).then(() => {
      const b = document.getElementById("shareb"), o = b.textContent;
      b.textContent = "✓ Link copied"; setTimeout(() => b.textContent = o, 2200); });
  };
  window.resetPuzzle = function () {
    sel = null; matches = 0; attempts = 0;
    document.getElementById("m").textContent = "0"; document.getElementById("a").textContent = "0";
    document.getElementById("doneb").classList.remove("show");
    document.querySelectorAll(".fact").forEach(c => { c.classList.remove("matched","wrong");
      c.querySelector(".drop").textContent = "Match an answer here"; });
    document.querySelectorAll(".tile").forEach(t => t.classList.remove("selected"));
    document.getElementById("tiles").classList.add("attention");
    document.getElementById("tl").classList.remove("complete","armed"); instr();
  };
  const cov = document.querySelector(".fig-cover");
  if (cov) cov.addEventListener("click", e => { if (!e.target.closest("a")) window.startPuzzle(); });
})();

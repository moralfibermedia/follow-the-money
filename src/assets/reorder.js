// Reorder engine (rank + timeline, v2).
// window.__PUZZLE = { mode:"rank"|"timeline", total:N, thresholds:[perfect,cleared] }
(function () {
  const P = window.__PUZZLE;
  const ORD = ["1st","2nd","3rd","4th","5th","6th"];
  let sel = null, done = false;
  const list = () => document.getElementById("rlist");
  const items = () => Array.from(list().children);
  const startOrder = Array.from(document.querySelectorAll("#rlist .ritem")).map(e => e.dataset.id);

  window.startPuzzle = function () {
    document.getElementById("fig").classList.add("playing");
    setTimeout(() => document.getElementById("fig").scrollIntoView({ behavior: "smooth", block: "start" }), 250);
  };
  function flip(mutate) {
    const before = new Map(items().map(el => [el, el.getBoundingClientRect().top]));
    mutate();
    items().forEach(el => {
      const dY = before.get(el) - el.getBoundingClientRect().top;
      if (!dY) return;
      el.style.transition = "none"; el.style.transform = `translateY(${dY}px)`;
      requestAnimationFrame(() => requestAnimationFrame(() => {
        el.style.transition = "transform .25s ease"; el.style.transform = ""; }));
    });
  }
  function renumber() { items().forEach((el, i) =>
    el.querySelector(".rbadge").textContent = P.mode === "timeline" ? ORD[i] : i + 1); }
  function clearSel() { items().forEach(e => e.classList.remove("selected")); sel = null; }
  function instr() {
    const tl = document.getElementById("tl"), sn = document.getElementById("sn"), tt = document.getElementById("tt");
    if (done) { tl.classList.remove("armed"); tl.classList.add("complete"); sn.textContent = "✓";
      tt.textContent = "Revealed — the true order, sourced"; return; }
    if (sel) { tl.classList.add("armed"); sn.textContent = "2"; tt.textContent = "Now tap the card to swap with"; }
    else { tl.classList.remove("armed"); sn.textContent = "1"; tt.textContent = "Tap a card, then tap where it goes"; }
  }
  document.querySelectorAll("#rlist .ritem").forEach(item => item.addEventListener("click", () => {
    if (done) return;
    list().classList.remove("attention");
    if (!sel) { sel = item; item.classList.add("selected"); }
    else if (sel === item) clearSel();
    else { const a = sel; flip(() => { const mk = document.createElement("div");
        a.parentNode.insertBefore(mk, a); item.parentNode.insertBefore(a, item);
        mk.parentNode.insertBefore(item, mk); mk.remove(); }); renumber(); clearSel(); }
    instr();
  }));
  window.moveItem = function (btn, dir, ev) {
    ev.stopPropagation(); if (done) return;
    list().classList.remove("attention"); clearSel(); instr();
    const item = btn.closest(".ritem");
    const sib = dir < 0 ? item.previousElementSibling : item.nextElementSibling;
    if (!sib) return;
    flip(() => { dir < 0 ? item.parentNode.insertBefore(item, sib) : item.parentNode.insertBefore(sib, item); });
    renumber();
  };
  window.lockIn = function () {
    if (done) return; done = true; clearSel();
    list().classList.add("revealed"); list().classList.remove("attention");
    document.getElementById("lockb").disabled = true;
    let correct = 0;
    const maxV = P.mode === "rank" ? Math.max(...items().map(e => +e.dataset.value || 0)) : 0;
    items().forEach((el, i) => {
      const ok = +el.dataset.rank === i + 1;
      el.classList.add(ok ? "r-ok" : "r-no");
      el.querySelector(".rmark").textContent = ok ? "✓" : "✗";
      if (ok) correct++;
      const rev = el.querySelector(".rreveal"); if (rev) rev.classList.add("visible");
      if (P.mode === "timeline") { const chip = el.querySelector(".chip");
        const d = new Date(el.dataset.date + "T00:00:00");
        chip.textContent = d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }).toUpperCase();
        setTimeout(() => chip.classList.add("visible"), 300 + i * 120); }
    });
    if (P.mode === "rank") setTimeout(() => items().forEach(el => {
      const f = el.querySelector(".bfill"); if (f) f.style.width = ((+el.dataset.value / maxV) * 100) + "%"; }), 250);
    document.getElementById("m").textContent = correct;
    instr();
    setTimeout(() => { flip(() => items().sort((a, b) => +a.dataset.rank - +b.dataset.rank)
      .forEach(el => list().appendChild(el))); renumber(); }, 1600);
    setTimeout(() => {
      const r = correct >= P.thresholds[0] ? ["perfect","Perfect","★★★"]
        : correct >= P.thresholds[1] ? ["cleared","Cleared","★★☆"] : ["finished","Finished","★☆☆"];
      document.getElementById("rank").className = "rank " + r[0];
      document.getElementById("rankLabel").textContent = r[1];
      document.getElementById("stars").textContent = r[2];
      document.getElementById("doneb").classList.add("show");
    }, 2300);
  };
  window.sharePuzzle = function () {
    const url = location.origin + location.pathname, text = document.querySelector('meta[name="description"]').content;
    if (navigator.share) { navigator.share({ title: document.title, text, url }).catch(() => {}); return; }
    navigator.clipboard && navigator.clipboard.writeText(text + "\n" + url).then(() => {
      const b = document.getElementById("shareb"), o = b.textContent;
      b.textContent = "✓ Link copied"; setTimeout(() => b.textContent = o, 2200); });
  };
  window.resetPuzzle = function () {
    done = false; clearSel();
    list().classList.remove("revealed");
    document.getElementById("lockb").disabled = false;
    document.getElementById("doneb").classList.remove("show");
    document.getElementById("m").textContent = "—";
    startOrder.forEach(id => list().appendChild(list().querySelector(`.ritem[data-id="${id}"]`)));
    renumber();
    items().forEach(el => { el.classList.remove("r-ok","r-no");
      el.querySelector(".rmark").textContent = "";
      const rev = el.querySelector(".rreveal"); if (rev) rev.classList.remove("visible");
      const f = el.querySelector(".bfill"); if (f) f.style.width = "0%";
      const chip = el.querySelector(".chip"); if (chip) { chip.classList.remove("visible"); chip.textContent = ""; } });
    list().classList.add("attention");
    document.getElementById("tl").classList.remove("complete","armed"); instr();
  };
})();

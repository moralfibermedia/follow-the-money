// Timer + shareable result — shared across all puzzle engines.
// Loads after the engine script; wraps startPuzzle/resetPuzzle and watches #doneb.
(function () {
  var t0 = null, tick = null, finalTime = null;

  function fmt(s) {
    var m = Math.floor(s / 60), r = Math.floor(s % 60);
    return m + ":" + (r < 10 ? "0" : "") + r;
  }
  function elapsed() { return t0 ? (Date.now() - t0) / 1000 : 0; }

  function ensureChip() {
    var bar = document.querySelector(".score-bar");
    if (!bar || document.getElementById("ptimer")) return;
    var s = document.createElement("span");
    s.className = "timer-chip";
    s.innerHTML = 'Time <b id="ptimer">0:00</b><span class="notrace">not a race</span>';
    bar.appendChild(s);
  }
  function runTimer() {
    t0 = Date.now(); finalTime = null; ensureChip();
    if (tick) clearInterval(tick);
    tick = setInterval(function () {
      var el = document.getElementById("ptimer");
      if (el) el.textContent = fmt(elapsed());
    }, 1000);
  }
  function stopTimer() {
    if (tick) { clearInterval(tick); tick = null; }
    finalTime = fmt(elapsed());
    var el = document.getElementById("ptimer");
    if (el) el.textContent = finalTime;
  }

  var _start = window.startPuzzle;
  window.startPuzzle = function () {
    var first = !t0;
    _start.apply(this, arguments);
    if (first) runTimer();
  };
  var _reset = window.resetPuzzle;
  if (_reset) window.resetPuzzle = function () {
    _reset.apply(this, arguments);
    runTimer();
  };

  function statLine() {
    var stats = Array.prototype.slice.call(
      document.querySelectorAll(".score-bar > span:not(.timer-chip)")
    ).map(function (s) { return s.textContent.trim().replace(/\s+/g, " "); });
    var bs = document.getElementById("beststreak");
    if (bs) stats.push("Best streak " + bs.textContent.trim());
    if (finalTime) stats.push("in " + finalTime + " (not a race)");
    return stats.join(" · ");
  }

  function resultText() {
    var name = document.title.split("|")[0].trim();
    var stars = document.getElementById("stars"), label = document.getElementById("rankLabel");
    var line = ((stars ? stars.textContent : "") + " " + (label ? label.textContent : "")).trim();
    return name + "\n" + line + " · " + statLine() +
      "\nWe do the research. You solve the puzzle.";
  }
  function shareUrl(source) {
    return location.origin + location.pathname +
      "?utm_source=" + source + "&utm_medium=social&utm_campaign=result-share";
  }

  var NETWORKS = [
    ["Bluesky", "bluesky", function (t, u) {
      return "https://bsky.app/intent/compose?text=" + encodeURIComponent(t + "\n" + u); }],
    ["X", "x", function (t, u) {
      return "https://x.com/intent/post?text=" + encodeURIComponent(t) + "&url=" + encodeURIComponent(u); }],
    ["Facebook", "facebook", function (t, u) {
      return "https://www.facebook.com/sharer/sharer.php?u=" + encodeURIComponent(u); }],
    ["Threads", "threads", function (t, u) {
      return "https://threads.net/intent/post?text=" + encodeURIComponent(t + "\n" + u); }]
  ];

  function buildShareRow() {
    var row = doneb.querySelector(".share-row");
    if (row) row.remove();
    row = document.createElement("div");
    row.className = "share-row";
    var lbl = document.createElement("span");
    lbl.className = "share-row-label";
    lbl.textContent = "or post it:";
    row.appendChild(lbl);
    var t = resultText();
    NETWORKS.forEach(function (n) {
      var a = document.createElement("a");
      a.textContent = n[0];
      a.href = n[2](t, shareUrl(n[1]));
      a.target = "_blank"; a.rel = "noopener";
      row.appendChild(a);
    });
    doneb.appendChild(row);
  }

  var doneb = document.getElementById("doneb");
  if (doneb) new MutationObserver(function () {
    if (!doneb.classList.contains("show")) return;
    stopTimer();
    var old = doneb.querySelector(".result-time");
    if (old) old.remove();
    if (finalTime) {
      var p = document.createElement("p");
      p.className = "result-time";
      p.textContent = "Solved in " + finalTime + " — told you it's not a race.";
      doneb.insertBefore(p, doneb.querySelector("p"));
    }
    var sb = document.getElementById("shareb");
    if (sb) sb.textContent = "📤 Share your result";
    buildShareRow();
  }).observe(doneb, { attributes: true, attributeFilter: ["class"] });

  window.sharePuzzle = function () {
    var name = document.title.split("|")[0].trim();
    var text = resultText(), url = shareUrl("web-share");
    if (navigator.share) { navigator.share({ title: name, text: text, url: url }).catch(function () {}); return; }
    if (navigator.clipboard) navigator.clipboard.writeText(text + "\n" + url).then(function () {
      var b = document.getElementById("shareb");
      if (!b) return;
      var o = b.textContent;
      b.textContent = "✓ Result copied — paste anywhere";
      setTimeout(function () { b.textContent = o; }, 2200);
    });
  };
})();

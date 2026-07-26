// Dream Ticket builder — pick President + VP, share, and see the live leaderboard.
// Anonymous: the pick is a fire-and-forget beacon (Do Not Track honored); the
// leaderboard is a public aggregate read. No cookies, no identifiers.
(function () {
  var N = window.__TICKET || {};
  var sel = { pres: null, vp: null };
  var DNT = (navigator.doNotTrack === "1" || window.doNotTrack === "1" || navigator.msDoNotTrack === "1");
  var $ = function (id) { return document.getElementById(id); };

  function render() {
    $("pres-name").textContent = sel.pres ? N[sel.pres] : "— pick one —";
    $("vp-name").textContent = sel.vp ? N[sel.vp] : "— pick one —";
    $("slot-pres").classList.toggle("filled", !!sel.pres);
    $("slot-vp").classList.toggle("filled", !!sel.vp);
    document.querySelectorAll(".cand").forEach(function (card) {
      var id = card.dataset.id;
      card.classList.toggle("as-pres", sel.pres === id);
      card.classList.toggle("as-vp", sel.vp === id);
    });
    $("lockTicket").disabled = !(sel.pres && sel.vp);
  }

  window.pick = function (role, id) {
    var other = role === "pres" ? "vp" : "pres";
    if (sel[other] === id) sel[other] = null;      // one person can't hold both slots
    sel[role] = sel[role] === id ? null : id;       // tap again to clear
    $("shareTicket").style.display = "none";
    $("lockTicket").style.display = "";
    render();
  };

  function ticketText() {
    return "My 2028 dream ticket: " + N[sel.pres] + " / " + N[sel.vp] + " 🇺🇸\nBuild yours:";
  }
  function shareUrl(src) {
    return location.origin + location.pathname + "?utm_source=" + src + "&utm_medium=social&utm_campaign=dream-ticket";
  }

  window.lockTicket = function () {
    if (!(sel.pres && sel.vp)) return;
    if (!DNT && navigator.sendBeacon) {
      try {
        navigator.sendBeacon("/.netlify/functions/ticket",
          new Blob([JSON.stringify({ pres: sel.pres, vp: sel.vp })], { type: "application/json" }));
      } catch (e) {}
    }
    $("lockTicket").style.display = "none";
    $("shareTicket").style.display = "";
    buildShare();
    setTimeout(loadBoard, 900);
  };

  window.shareTicket = function () {
    var text = ticketText(), url = shareUrl("web-share");
    if (navigator.share) { navigator.share({ title: "2028 Dream Ticket", text: text, url: url }).catch(function () {}); return; }
    if (navigator.clipboard) navigator.clipboard.writeText(text + "\n" + url).then(function () {
      var b = $("shareTicket"), o = b.textContent;
      b.textContent = "✓ Copied — paste anywhere"; setTimeout(function () { b.textContent = o; }, 2200);
    });
  };

  var NETS = [
    ["Bluesky", "bluesky", function (t, u) { return "https://bsky.app/intent/compose?text=" + encodeURIComponent(t + "\n" + u); }],
    ["X", "x", function (t, u) { return "https://x.com/intent/post?text=" + encodeURIComponent(t) + "&url=" + encodeURIComponent(u); }],
    ["Facebook", "facebook", function (t, u) { return "https://www.facebook.com/sharer/sharer.php?u=" + encodeURIComponent(u); }],
    ["Threads", "threads", function (t, u) { return "https://threads.net/intent/post?text=" + encodeURIComponent(t + "\n" + u); }]
  ];
  function buildShare() {
    var row = $("ticketShareRow"); row.innerHTML = "";
    var lbl = document.createElement("span"); lbl.className = "share-row-label"; lbl.textContent = "or post it:"; row.appendChild(lbl);
    var t = ticketText();
    NETS.forEach(function (n) {
      var a = document.createElement("a");
      a.textContent = n[0]; a.href = n[2](t, shareUrl(n[1])); a.target = "_blank"; a.rel = "noopener";
      row.appendChild(a);
    });
  }

  function loadBoard() {
    fetch("/.netlify/functions/ticket").then(function (r) { return r.json(); }).then(function (d) {
      var lb = $("leaderboard");
      var combos = Object.entries(d.combos || {}).sort(function (a, b) { return b[1] - a[1]; }).slice(0, 8);
      if (!combos.length) { lb.innerHTML = '<p class="lb-empty">No tickets yet — be the first to lock one in.</p>'; return; }
      var max = combos[0][1];
      lb.innerHTML = '<div class="lb-total">' + d.total + ' ticket' + (d.total === 1 ? '' : 's') + ' built so far</div>' +
        combos.map(function (c) {
          var parts = c[0].split("/");
          var name = (N[parts[0]] || parts[0]) + " / " + (N[parts[1]] || parts[1]);
          var barW = Math.round(c[1] / max * 100);
          var share = d.total ? Math.round(c[1] / d.total * 100) : 0;
          return '<div class="lb-row"><span class="lb-name">' + name + '</span>' +
            '<span class="lb-bar"><span class="lb-fill" style="width:' + barW + '%"></span></span>' +
            '<span class="lb-n">' + share + '%</span></div>';
        }).join("");
    }).catch(function () { $("leaderboard").innerHTML = '<p class="lb-empty">Standings unavailable right now.</p>'; });
  }

  render();
  loadBoard();
})();

// Dream Ticket builder — pick President + VP, share, and see the live leaderboard.
// Anonymous: the pick is a fire-and-forget beacon (Do Not Track honored); the
// leaderboard is a public aggregate read. No cookies, no identifiers.
// One ticket per browser is enforced client-side via localStorage — it stops
// casual re-voting without any server-side tracking; it is an unscientific
// straw poll, not a certified survey (a determined re-voter can always clear
// storage or switch devices).
(function () {
  var N = window.__TICKET || {};
  var sel = { pres: null, vp: null };
  var DNT = (navigator.doNotTrack === "1" || window.doNotTrack === "1" || navigator.msDoNotTrack === "1");
  var VOTE_KEY = "ftm-ticket-2028";
  var $ = function (id) { return document.getElementById(id); };

  function storedVote() { try { return localStorage.getItem(VOTE_KEY); } catch (e) { return null; } }
  function markVoted(t) { try { localStorage.setItem(VOTE_KEY, t); } catch (e) {} }

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
    if (storedVote()) return; // already locked this browser — field is read-only
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

  function lockedState() {
    $("lockTicket").style.display = "none";
    $("shareTicket").style.display = "";
    var note = $("lockedNote");
    if (note) note.style.display = "block";
    var chg = $("changeTicket");
    if (chg) chg.style.display = "";
    document.querySelectorAll(".pick-btn").forEach(function (b) { b.disabled = true; });
    buildShare();
  }

  // Change of heart: anonymously retract the browser's recorded combo (-1 for
  // that pairing), clear the local record, and reopen the field to recast.
  window.changeTicket = function () {
    var v = storedVote();
    if (v) {
      var parts = v.split("/");
      if (!DNT && navigator.sendBeacon && parts.length === 2) {
        try {
          navigator.sendBeacon("/.netlify/functions/ticket",
            new Blob([JSON.stringify({ event: "retract", pres: parts[0], vp: parts[1] })], { type: "application/json" }));
        } catch (e) {}
      }
      try { localStorage.removeItem(VOTE_KEY); } catch (e) {}
    }
    sel = { pres: null, vp: null };
    $("shareTicket").style.display = "none";
    $("changeTicket").style.display = "none";
    $("lockedNote").style.display = "none";
    $("lockTicket").style.display = "";
    $("ticketShareRow").innerHTML = "";
    document.querySelectorAll(".pick-btn").forEach(function (b) { b.disabled = false; });
    render();
    setTimeout(loadBoard, 900);
  };

  window.lockTicket = function () {
    if (!(sel.pres && sel.vp)) return;
    if (!storedVote()) {
      if (!DNT && navigator.sendBeacon) {
        try {
          navigator.sendBeacon("/.netlify/functions/ticket",
            new Blob([JSON.stringify({ pres: sel.pres, vp: sel.vp })], { type: "application/json" }));
        } catch (e) {}
      }
      markVoted(sel.pres + "/" + sel.vp);
    }
    lockedState();
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

  function stamp() {
    // client-local time of this fetch — labeled "as of" since the tally can lag a beat
    try { return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }); }
    catch (e) { return ""; }
  }
  function loadBoard() {
    fetch("/.netlify/functions/ticket").then(function (r) { return r.json(); }).then(function (d) {
      var lb = $("leaderboard");
      var combos = Object.entries(d.combos || {}).sort(function (a, b) { return b[1] - a[1]; }).slice(0, 8);
      var when = '<div class="lb-when">as of ' + stamp() + ' · updates live</div>';
      if (!combos.length) { lb.innerHTML = '<p class="lb-empty">No tickets yet — be the first to lock one in.</p>' + when; return; }
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
        }).join("") + when;
    }).catch(function () { $("leaderboard").innerHTML = '<p class="lb-empty">Standings unavailable right now.</p>'; });
  }

  // Returning voter: restore their locked ticket + show share (one per browser).
  (function initVote() {
    var v = storedVote();
    if (v) {
      var parts = v.split("/");
      if (N[parts[0]] && N[parts[1]]) { sel.pres = parts[0]; sel.vp = parts[1]; }
      render();
      lockedState();
    } else {
      render();
    }
  })();

  loadBoard();
  setInterval(loadBoard, 20000); // keep the board live while the page is open
})();

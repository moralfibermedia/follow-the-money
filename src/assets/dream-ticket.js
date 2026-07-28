// Dream Ticket builder — rank up to three tickets (1st/2nd/3rd), submit as a
// ballot, and see the live Borda-weighted leaderboard.
// Anonymous: picks are fire-and-forget beacons (Do Not Track honored); the
// board is a public aggregate read. No cookies, no identifiers. One ballot per
// browser via localStorage (stops casual re-voting; you can change it anytime).
(function () {
  var N = window.__TICKET || {};
  var sel = { pres: null, vp: null };
  var ballot = [];            // ordered [{pres,vp}], rank = index+1, max 3
  var DNT = (navigator.doNotTrack === "1" || window.doNotTrack === "1" || navigator.msDoNotTrack === "1");
  var VOTE_KEY = "ftm-ticket-2028";
  var ORD = ["1st", "2nd", "3rd"];
  var $ = function (id) { return document.getElementById(id); };

  function storedBallot() {
    try { var v = localStorage.getItem(VOTE_KEY); return v ? JSON.parse(v) : null; } catch (e) { return null; }
  }
  function voted() { return !!storedBallot(); }
  function inBallot(pres, vp) { return ballot.some(function (t) { return t.pres === pres && t.vp === vp; }); }

  function renderBuilder() {
    $("pres-name").textContent = sel.pres ? N[sel.pres] : "— pick one —";
    $("vp-name").textContent = sel.vp ? N[sel.vp] : "— pick one —";
    $("slot-pres").classList.toggle("filled", !!sel.pres);
    $("slot-vp").classList.toggle("filled", !!sel.vp);
    document.querySelectorAll(".cand").forEach(function (card) {
      var id = card.dataset.id;
      card.classList.toggle("as-pres", sel.pres === id);
      card.classList.toggle("as-vp", sel.vp === id);
    });
    var complete = sel.pres && sel.vp;
    $("addTicket").disabled = !(complete && ballot.length < 3 && !inBallot(sel.pres, sel.vp) && !voted());
  }

  function renderBallot() {
    var list = $("ballotList");
    if (!ballot.length) {
      list.innerHTML = '<li class="ballot-empty">Build a ticket above and add it — up to three, ranked.</li>';
    } else {
      list.innerHTML = ballot.map(function (t, i) {
        var rm = voted() ? "" : '<button class="ballot-x" type="button" onclick="removeTicket(' + i + ')" aria-label="Remove">✕</button>';
        return '<li class="ballot-row"><span class="ballot-rank">' + ORD[i] + '</span>' +
          '<span class="ballot-name">' + (N[t.pres] || t.pres) + ' / ' + (N[t.vp] || t.vp) + '</span>' + rm + '</li>';
      }).join("");
    }
    $("submitBallot").disabled = !(ballot.length >= 1 && !voted());
  }
  function renderFloat() {
    var bar = $("floatBar"); if (!bar) return;
    var complete = sel.pres && sel.vp;
    var canAdd = complete && ballot.length < 3 && !inBallot(sel.pres, sel.vp) && !voted();
    var canSubmit = ballot.length >= 1 && !voted();
    if (voted() || (!canAdd && !canSubmit)) { bar.classList.remove("show"); return; }
    $("floatPick").textContent = canAdd ? (N[sel.pres] + " / " + N[sel.vp])
      : (ballot.length + " ranked — ready to be counted");
    $("floatAdd").style.display = canAdd ? "" : "none";
    $("floatSubmit").style.display = canSubmit ? "" : "none";
    bar.classList.add("show");
  }
  function render() { renderBuilder(); renderBallot(); renderFloat(); }

  window.pick = function (role, id) {
    if (voted()) return;
    var other = role === "pres" ? "vp" : "pres";
    if (sel[other] === id) sel[other] = null;
    sel[role] = sel[role] === id ? null : id;
    render();
  };

  window.addToBallot = function () {
    if (!(sel.pres && sel.vp) || ballot.length >= 3 || inBallot(sel.pres, sel.vp) || voted()) return;
    ballot.push({ pres: sel.pres, vp: sel.vp });
    sel = { pres: null, vp: null };
    render();
  };
  window.removeTicket = function (i) {
    if (voted()) return;
    ballot.splice(i, 1);
    render();
  };

  function shareText() {
    var lines = ballot.map(function (t, i) { return (i + 1) + ". " + N[t.pres] + " / " + N[t.vp]; });
    return "My 2028 dream tickets, ranked 🇺🇸\n" + lines.join("\n") + "\nBuild yours:";
  }
  function shareUrl(src) {
    return location.origin + location.pathname + "?utm_source=" + src + "&utm_medium=social&utm_campaign=dream-ticket";
  }

  function lockedState() {
    $("addTicket").style.display = "none";
    $("submitBallot").style.display = "none";
    $("shareTicket").style.display = "";
    $("changeTicket").style.display = "";
    $("lockedNote").style.display = "block";
    var cn = $("countNote"); if (cn) cn.style.display = "none";
    document.querySelectorAll(".pick-btn").forEach(function (b) { b.disabled = true; });
    buildShare();
  }

  window.submitBallot = function () {
    if (!(ballot.length >= 1) || voted()) return;
    if (!DNT && navigator.sendBeacon) {
      try {
        navigator.sendBeacon("/.netlify/functions/ticket",
          new Blob([JSON.stringify({ rankings: ballot })], { type: "application/json" }));
      } catch (e) {}
    }
    try { localStorage.setItem(VOTE_KEY, JSON.stringify(ballot)); } catch (e) {}
    render();
    lockedState();
    setTimeout(loadBoard, 900);
  };

  window.changeBallot = function () {
    var prev = storedBallot();
    if (prev && prev.length && !DNT && navigator.sendBeacon) {
      try {
        navigator.sendBeacon("/.netlify/functions/ticket",
          new Blob([JSON.stringify({ event: "retract", rankings: prev })], { type: "application/json" }));
      } catch (e) {}
    }
    try { localStorage.removeItem(VOTE_KEY); } catch (e) {}
    ballot = []; sel = { pres: null, vp: null };
    $("shareTicket").style.display = "none";
    $("changeTicket").style.display = "none";
    $("lockedNote").style.display = "none";
    var cn2 = $("countNote"); if (cn2) cn2.style.display = "";
    $("addTicket").style.display = "";
    $("submitBallot").style.display = "";
    $("ticketShareRow").innerHTML = "";
    document.querySelectorAll(".pick-btn").forEach(function (b) { b.disabled = false; });
    render();
    setTimeout(loadBoard, 900);
  };

  window.shareTicket = function () {
    var text = shareText(), url = shareUrl("web-share");
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
    var t = shareText();
    NETS.forEach(function (n) {
      var a = document.createElement("a");
      a.textContent = n[0]; a.href = n[2](t, shareUrl(n[1])); a.target = "_blank"; a.rel = "noopener";
      row.appendChild(a);
    });
  }

  function stamp() {
    try { return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }); }
    catch (e) { return ""; }
  }
  // 3.5% of the U.S. (~340M, Census 2024 estimate) — Chenoweth's civil-resistance threshold
  var GOAL = 11900000;
  function renderPop(ballots) {
    var el = $("popCount"); if (!el) return;
    el.textContent = ballots.toLocaleString("en-US");
    var pct = ballots / GOAL * 100;
    // adaptive precision so small counts still show a real number
    var label = pct >= 1 ? pct.toFixed(1) + "%" :
      pct >= 0.01 ? pct.toFixed(2) + "%" :
      pct > 0 ? pct.toFixed(5) + "%" : "0%";
    $("popPct").textContent = label + " of the way there";
    $("popFill").style.width = Math.max(pct, ballots > 0 ? 0.5 : 0) + "%"; // sliver once nonzero
  }

  function loadBoard() {
    fetch("/.netlify/functions/ticket").then(function (r) { return r.json(); }).then(function (d) {
      renderPop(d.ballots || 0);
      var lb = $("leaderboard");
      var combos = Object.entries(d.combos || {}).sort(function (a, b) { return b[1].points - a[1].points; }).slice(0, 8);
      var since = "", resetFull = "";
      if (d.since) {
        try {
          var dt = new Date(d.since);
          since = " since " + dt.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
          resetFull = " · counting since " + dt.toLocaleString([], { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
        } catch (e) {}
      }
      var when = '<div class="lb-when">updated ' + stamp() + resetFull + ' · refreshes every 20s</div>';
      if (!combos.length) { lb.innerHTML = '<p class="lb-empty">No rankings counted yet — be the first.</p>' + when; return; }
      var max = combos[0][1].points;
      lb.innerHTML = '<div class="lb-total">' + d.ballots + (d.ballots === 1 ? ' person' : ' people') + ' counted' + (since || '') + '</div>' +
        combos.map(function (c) {
          var parts = c[0].split("/");
          var name = (N[parts[0]] || parts[0]) + " / " + (N[parts[1]] || parts[1]);
          var barW = max ? Math.round(c[1].points / max * 100) : 0;
          return '<div class="lb-row"><span class="lb-name">' + name + '</span>' +
            '<span class="lb-bar"><span class="lb-fill" style="width:' + barW + '%"></span></span>' +
            '<span class="lb-n">' + c[1].points + '</span></div>';
        }).join("") + when;
    }).catch(function () { $("leaderboard").innerHTML = '<p class="lb-empty">Standings unavailable right now.</p>'; });
  }

  (function init() {
    var prev = storedBallot();
    if (prev && prev.length) {
      ballot = prev.filter(function (t) { return N[t.pres] && N[t.vp]; }).slice(0, 3);
      render();
      lockedState();
    } else {
      render();
    }
    loadBoard();
    setInterval(loadBoard, 20000);
  })();
})();

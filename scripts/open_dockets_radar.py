#!/usr/bin/env python3
"""
Open Dockets Radar — Moral Fiber Media

Surfaces federal PROPOSED RULES with OPEN public-comment periods, ranked by
public salience, so the watch -> puzzle -> post cadence never starts from a
blank page. Powers the "Speak Now Or..." comment-drive series.

Data source: the public Federal Register API (https://www.federalregister.gov/
developers/api/v1) — free, no API key. Comment COUNTS are not available here
(that needs the regulations.gov API + key); ranking uses deadline, the
"significant" flag, agency, and topic keywords.

Usage:
    python3 scripts/open_dockets_radar.py                 # write data/open-dockets.json + print digest
    python3 scripts/open_dockets_radar.py --print-only    # print digest only, no file write
    python3 scripts/open_dockets_radar.py --max-days 45 --top 15

The Markdown digest goes to STDOUT (so CI can pipe it into $GITHUB_STEP_SUMMARY);
all logs/diagnostics go to STDERR. Tune the scoring via the CONFIG block below.
"""

import argparse
import json
import re
import ssl
import sys
import urllib.request
import urllib.error
from datetime import datetime, timezone, date

API = "https://www.federalregister.gov/api/v1/documents.json"
OUT_DEFAULT = "data/open-dockets.json"
UA = "MoralFiberMedia-OpenDocketsRadar/1.0 (+https://moralfibermedia.com)"

# ============================ CONFIG (tune freely) ============================
WINDOW_MIN_DAYS = 3    # skip rules closing sooner than this (too little runway)
WINDOW_MAX_DAYS = 60   # look this far ahead for closing comment periods
TOP_N = 12             # how many to keep in the shortlist
ABSTRACT_CHARS = 280   # truncate the abstract in output

# Public-salience keyword weights, matched (lowercased substring) against
# title + abstract. The point is to float rules the general public *feels*.
TOPIC_WEIGHTS = {
    "medicare": 3, "medicaid": 3, "prescription": 3, "drug price": 3, "drug": 2,
    "student loan": 3, "student debt": 3, "tuition": 2,
    "minimum wage": 3, "overtime": 2, "wage": 2, "worker": 1, "labor": 1,
    "social security": 3, "disability": 2, "veteran": 2, "snap": 3, "nutrition": 2, "food": 2,
    "housing": 2, "eviction": 2, "rent": 2, "homeless": 2, "mortgage": 2,
    "clean water": 2, "drinking water": 3, "clean air": 2, "emission": 2, "pollut": 2,
    "climate": 2, "toxic": 2, "pfas": 2, "lead pipe": 2, "lead exposure": 2,
    "consumer": 2, "overdraft": 3, "junk fee": 3, "credit": 1, "privacy": 2, "data broker": 3,
    "broadband": 2, "net neutrality": 3, "internet": 1,
    "immigration": 3, "asylum": 2, "citizenship": 2, "visa": 1,
    "firearm": 3, "gun": 3, "voting": 3, "election": 2, "civil rights": 3, "discriminat": 2,
    "abortion": 3, "reproductive": 3, "gender": 2,
    "tax": 2, "tariff": 1, "airline": 2, "passenger": 2, "vaccine": 2, "public health": 2,
    "grant": 2, "financial assistance": 2, "nonprofit": 1, "school": 2, "education": 2,
    "artificial intelligence": 2, "surveillance": 2,
}

# Agencies the public tends to care about (Federal Register agency "slug").
AGENCY_BOOST_SLUGS = {
    "health-and-human-services-department", "centers-for-medicare-medicaid-services",
    "food-and-drug-administration", "education-department", "labor-department",
    "environmental-protection-agency", "consumer-financial-protection-bureau",
    "federal-trade-commission", "agriculture-department", "homeland-security-department",
    "housing-and-urban-development-department", "federal-communications-commission",
    "social-security-administration", "veterans-affairs-department", "justice-department",
    "internal-revenue-service", "transportation-department", "interior-department",
    "energy-department", "management-and-budget-office", "securities-and-exchange-commission",
}
AGENCY_BOOST = 2
SIGNIFICANT_BOOST = 3
TOPIC_CAP = 8          # cap total topic contribution so one rule can't run away
TOO_SOON_PENALTY = 1   # if days_left < 7

# Niche / highly-technical terms that usually don't make good public puzzles.
NICHE_PENALTY_TERMS = [
    "airworthiness", "incorporation by reference", "technical amendment",
    "byproduct material", "harmonized tariff schedule", "fishery", "fisheries",
    "vessel", "seafood", "spectrum allocation", "radio frequency", "endangered species permit",
    "test procedure", "energy conservation standard for", "marine mammal",
    "pesticide petition", "petitions filed for residues", "receipt of pesticide",
    "manufacturing and procurement quota", "airspace",
]
NICHE_PENALTY = 3
# =============================================================================

# Precompiled word-boundary matchers (so "rent" doesn't match "current",
# "food" doesn't match "seafood", "tax" doesn't match "syntax", etc.)
_TOPIC_RX = [(re.compile(r"\b" + re.escape(k) + r"\b"), w, k) for k, w in TOPIC_WEIGHTS.items()]
_NICHE_RX = [re.compile(r"\b" + re.escape(t) + r"\b") for t in NICHE_PENALTY_TERMS]


def log(msg):
    print(msg, file=sys.stderr)


def _opener():
    """urlopen that retries with an unverified SSL context on cert failure
    (some local macOS Pythons lack a CA bundle; CI is fine). Read-only public API."""
    def get(url):
        req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "application/json"})
        try:
            return urllib.request.urlopen(req, timeout=30).read()
        except urllib.error.URLError as e:
            if isinstance(getattr(e, "reason", None), ssl.SSLError) or "CERTIFICATE_VERIFY_FAILED" in str(e):
                log("warn: SSL verify failed; retrying with unverified context (public read-only API)")
                ctx = ssl._create_unverified_context()
                return urllib.request.urlopen(req, timeout=30, context=ctx).read()
            raise
    return get


def fetch_open_prorules(max_days):
    get = _opener()
    today = datetime.now(timezone.utc).date()
    lte = date.fromordinal(today.toordinal() + max_days)
    fields = ["title", "abstract", "agencies", "document_number", "publication_date",
              "comments_close_on", "comment_url", "html_url", "docket_ids", "significant"]
    # Filter on the comment-period closing date. NOTE: the *filter* key is
    # `comment_date` even though the returned *field* is `comments_close_on`.
    params = ["conditions[type][]=PRORULE",
              "conditions[comment_date][gte]=" + today.isoformat(),
              "conditions[comment_date][lte]=" + lte.isoformat(),
              "order=oldest", "per_page=100"]
    params += ["fields[]=" + f for f in fields]
    url = API + "?" + "&".join(params)

    results, pages, cap = [], 0, 300
    while url and len(results) < cap and pages < 6:
        data = json.loads(get(url))
        results.extend(data.get("results", []))
        url = data.get("next_page_url")
        pages += 1
    log(f"fetched {len(results)} proposed rules (window {today} -> {lte}, {pages} page(s))")
    return results, today


def days_until(iso_date, today):
    try:
        d = date.fromisoformat(iso_date)
    except (TypeError, ValueError):
        return None
    return (d - today).days


def score_docket(doc, days_left):
    text = ((doc.get("title") or "") + " " + (doc.get("abstract") or "")).lower()
    reasons, topic = [], 0
    for rx, w, kw in _TOPIC_RX:
        if rx.search(text):
            topic += w
            reasons.append(kw)
    topic = min(topic, TOPIC_CAP)
    score = topic

    slugs = {a.get("slug") for a in (doc.get("agencies") or []) if a.get("slug")}
    if slugs & AGENCY_BOOST_SLUGS:
        score += AGENCY_BOOST
    if doc.get("significant") is True:
        score += SIGNIFICANT_BOOST
        reasons.append("significant")
    if any(rx.search(text) for rx in _NICHE_RX):
        score -= NICHE_PENALTY
    if days_left is not None and days_left < 7:
        score -= TOO_SOON_PENALTY

    # "why" — top few distinct topic hits, then flags
    seen, why = set(), []
    for r in reasons:
        if r not in seen:
            seen.add(r)
            why.append(r)
        if len(why) >= 3:
            break
    if days_left is not None:
        why.append(f"closes in {days_left}d")
    return score, " · ".join(why)


def build(max_days, top_n):
    raw, today = fetch_open_prorules(max_days)
    seen, rows = set(), []
    for doc in raw:
        dn = doc.get("document_number")
        if not dn or dn in seen:
            continue
        comment_url = doc.get("comment_url")
        close = doc.get("comments_close_on")
        if not comment_url or not close:
            continue
        days_left = days_until(close, today)
        if days_left is None or days_left < WINDOW_MIN_DAYS or days_left > max_days:
            continue
        seen.add(dn)
        score, why = score_docket(doc, days_left)
        abstract = (doc.get("abstract") or "").strip()
        if len(abstract) > ABSTRACT_CHARS:
            abstract = abstract[:ABSTRACT_CHARS].rsplit(" ", 1)[0] + "…"
        rows.append({
            "score": score, "why": why, "title": (doc.get("title") or "").strip(),
            "agencies": [a.get("name") for a in (doc.get("agencies") or []) if a.get("name")],
            "document_number": dn, "publication_date": doc.get("publication_date"),
            "comments_close_on": close, "days_left": days_left,
            "significant": bool(doc.get("significant")),
            "comment_url": (comment_url or "").replace("http://", "https://"),
            "html_url": doc.get("html_url"),
            "docket_ids": doc.get("docket_ids") or [],
            "abstract": abstract,
        })

    rows.sort(key=lambda r: (-r["score"], r["days_left"]))
    rows = rows[:top_n]
    for i, r in enumerate(rows, 1):
        r["rank"] = i
    log(f"kept {len(rows)} after filter/score/rank (top {top_n})")
    return {
        "generated": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "window": {"min_days": WINDOW_MIN_DAYS, "max_days": max_days},
        "count": len(rows),
        "dockets": rows,
    }


def digest_md(payload):
    gen = payload["generated"][:10]
    lines = [f"## 🛰️ Open Dockets Radar — {gen}", ""]
    n = payload["count"]
    if n == 0:
        lines.append("_No proposed rules with open comment periods in the window. Check back next week._")
        return "\n".join(lines) + "\n"
    lines.append(f"**{n}** proposed rules with open comment periods, ranked by public salience "
                 f"(window {payload['window']['min_days']}–{payload['window']['max_days']} days out).")
    lines.append("")
    lines.append("| # | Rule | Agency | Closes | Why | Comment |")
    lines.append("|---|------|--------|--------|-----|---------|")
    for r in payload["dockets"]:
        agency = (r["agencies"][0] if r["agencies"] else "—")
        title = (r["title"][:70] + "…") if len(r["title"]) > 70 else r["title"]
        title_md = f"[{title}]({r['html_url']})" if r["html_url"] else title
        closes = f"{r['comments_close_on']} ({r['days_left']}d)"
        why = r["why"] or "—"
        comment = f"[file →]({r['comment_url']})"
        lines.append(f"| {r['rank']} | {title_md} | {agency} | {closes} | {why} | {comment} |")
    lines.append("")
    lines.append("_Source: Federal Register API (no comment counts — ranking by deadline, "
                 "significance, and topic). Tune weights in `scripts/open_dockets_radar.py`._")
    return "\n".join(lines) + "\n"


def main():
    ap = argparse.ArgumentParser(description="Federal Register open-comment proposed-rule radar.")
    ap.add_argument("--max-days", type=int, default=WINDOW_MAX_DAYS)
    ap.add_argument("--top", type=int, default=TOP_N)
    ap.add_argument("--out", default=OUT_DEFAULT)
    ap.add_argument("--print-only", action="store_true", help="print digest only; do not write the JSON file")
    args = ap.parse_args()

    try:
        payload = build(args.max_days, args.top)
    except Exception as e:  # fail-soft: never clobber the existing JSON on error
        log(f"::error::radar failed ({e}); leaving any existing {args.out} untouched")
        return 1

    if not args.print_only:
        with open(args.out, "w") as f:
            json.dump(payload, f, indent=2)
            f.write("\n")
        log(f"wrote {args.out} ({payload['count']} dockets)")

    sys.stdout.write(digest_md(payload))
    return 0


if __name__ == "__main__":
    sys.exit(main())

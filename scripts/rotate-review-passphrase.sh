#!/usr/bin/env bash
# Rotate the passphrase on all three encrypted operator pages.
#
#   ./scripts/rotate-review-passphrase.sh
#
# Prompts for the new passphrase twice, silently — it never appears on screen,
# in your shell history, or in argv (`ps`). Rebuilds each page from source,
# re-encrypts with the new passphrase, and verifies each one actually decrypts
# before it finishes. Then commit + push the three ciphertext files.
#
# Pages rotated:  /review/  ·  /review/launch/  ·  /review/studio/
set -euo pipefail
cd "$(dirname "$0")/.."

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

printf 'New review passphrase: ' >&2; read -rs P1; printf '\n' >&2
printf 'Confirm:               ' >&2; read -rs P2; printf '\n' >&2
if [[ "$P1" != "$P2" ]]; then echo "✗ Passphrases don't match — nothing changed." >&2; exit 1; fi
if [[ ${#P1} -lt 12 ]]; then echo "✗ Too short (want 12+ chars) — nothing changed." >&2; exit 1; fi
export MFM_PAGE_PASSWORD="$P1"
unset P1 P2

echo "→ Building pages from source…"
python3 scripts/build-review-desk.py -o "$TMP/desk.html" >/dev/null
python3 scripts/build-launch-console.py -o "$TMP/launch.html" >/dev/null
cp scripts/studio-page.html "$TMP/studio.html"

# input                 output                      title
encrypt() {
  node scripts/encrypt-page.mjs "$1" "$2" - "$3" >/dev/null
  node - "$2" <<'JS'
const fs = require("fs"), crypto = require("crypto");
const file = process.argv[2];
const html = fs.readFileSync(file, "utf8");
const g = (n) => (html.match(new RegExp(n + '\\s*=\\s*"([A-Za-z0-9+/=]+)"')) || [])[1];
const salt = Buffer.from(g("SALT"), "base64"), iv = Buffer.from(g("IV"), "base64");
const all = Buffer.from(g("CT"), "base64");
const ct = all.subarray(0, all.length - 16), tag = all.subarray(all.length - 16);
const key = crypto.pbkdf2Sync(process.env.MFM_PAGE_PASSWORD, salt, 310000, 32, "sha256");
const d = crypto.createDecipheriv("aes-256-gcm", key, iv); d.setAuthTag(tag);
const pt = Buffer.concat([d.update(ct), d.final()]).toString("utf8");
if (pt.length < 500) { console.error("  ✗ " + file + " decrypted to suspiciously little"); process.exit(1); }
console.log(`  ✓ ${file} — ${(pt.length/1024|0)}KB recovered with the new passphrase`);
JS
}

echo "→ Encrypting + verifying…"
encrypt "$TMP/desk.html"   review/index.html        "Review Desk — Moral Fiber Media"
encrypt "$TMP/launch.html" review/launch/index.html "Launch console — Moral Fiber Media"
encrypt "$TMP/studio.html" review/studio/index.html "Puzzle Studio — Moral Fiber Media"

echo
echo "✓ All three pages re-encrypted and verified."
echo "  The OLD passphrase no longer opens anything."
echo
echo "Next:"
echo "  1. Write the new passphrase on a vault card (unlocks /review/, /launch/, /studio/) — shred the old card."
echo "  2. git add review/index.html review/launch/index.html review/studio/index.html"
echo "  3. Commit + push, then confirm on the live site."

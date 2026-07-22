#!/usr/bin/env node
// Encrypt a standalone HTML page behind a password (StatiCrypt-style).
//
// The output page holds only AES-256-GCM ciphertext; the password is turned
// into the key in-browser via PBKDF2 (WebCrypto, 310k iterations, SHA-256).
// Without the password the content is unrecoverable — safe to share the link.
//
// Usage:
//   node scripts/encrypt-page.mjs <input.html> <output.html> <password> [title]
//
// Pairs with scripts/build-review-desk.py:
//   python3 scripts/build-review-desk.py -o /tmp/desk.html --drafts-base <preview>
//   node scripts/encrypt-page.mjs /tmp/desk.html /tmp/desk-shared.html 'passphrase'
import { readFileSync, writeFileSync } from "node:fs";
import { pbkdf2Sync, createCipheriv, randomBytes } from "node:crypto";

const [input, output, password, title = "Review Desk — Moral Fiber Media"] = process.argv.slice(2);
if (!input || !output || !password) {
  console.error("usage: encrypt-page.mjs <input.html> <output.html> <password> [title]");
  process.exit(1);
}

const ITER = 310000;
const salt = randomBytes(16);
const iv = randomBytes(12);
const key = pbkdf2Sync(password, salt, ITER, 32, "sha256");
const cipher = createCipheriv("aes-256-gcm", key, iv);
const plaintext = readFileSync(input);
const ct = Buffer.concat([cipher.update(plaintext), cipher.final(), cipher.getAuthTag()]);

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");

const page = `<title>${esc(title)}</title>
<style>
:root { --paper:#f2ede4; --ink:#0d0d0d; --red:#d63031; --gold:#b8860b; --muted:#6b6256; --rule:#c0b89a; }
@media (prefers-color-scheme: dark) { :root { --paper:#161412; --ink:#ece7dc; --red:#e85c5c; --gold:#d4a437; --muted:#9a917f; --rule:#453f36; } }
:root[data-theme="dark"] { --paper:#161412; --ink:#ece7dc; --red:#e85c5c; --gold:#d4a437; --muted:#9a917f; --rule:#453f36; }
:root[data-theme="light"] { --paper:#f2ede4; --ink:#0d0d0d; --red:#d63031; --gold:#b8860b; --muted:#6b6256; --rule:#c0b89a; }
body { background:var(--paper); color:var(--ink); font-family:Georgia,serif; margin:0;
  min-height:100vh; display:flex; align-items:center; justify-content:center; }
.gate { max-width:420px; width:90%; border-top:6px solid var(--ink); border-bottom:2px solid var(--ink);
  padding:34px 8px 40px; text-align:center; }
.kicker { font-family:ui-monospace,Menlo,monospace; font-size:11px; letter-spacing:.35em;
  text-transform:uppercase; color:var(--gold); }
h1 { font-weight:900; font-size:30px; margin:.3em 0 .2em; }
h1 em { color:var(--red); }
p { font-style:italic; color:var(--muted); font-size:15px; margin:.2em 0 1.4em; }
input { font-family:ui-monospace,Menlo,monospace; font-size:16px; padding:11px 14px; width:100%;
  box-sizing:border-box; border:2px solid var(--ink); background:transparent; color:var(--ink); }
input:focus { outline:2px solid var(--gold); outline-offset:1px; }
button { margin-top:12px; width:100%; font-family:ui-monospace,Menlo,monospace; font-size:13px;
  letter-spacing:.25em; text-transform:uppercase; padding:12px; border:2px solid var(--ink);
  background:var(--ink); color:var(--paper); cursor:pointer; }
button:hover { background:var(--red); border-color:var(--red); }
.err { color:var(--red); font-family:ui-monospace,Menlo,monospace; font-size:12px;
  min-height:1.2em; margin-top:10px; font-style:normal; }
</style>
<div class="gate">
  <div class="kicker">★ Internal · Protected</div>
  <h1>Review <em>Desk</em></h1>
  <p>This page is encrypted. Enter the passphrase to open it.</p>
  <form id="f">
    <input id="pw" type="password" autocomplete="current-password" placeholder="passphrase" autofocus>
    <button type="submit">Unlock</button>
    <div class="err" id="err"></div>
  </form>
</div>
<!-- Static detection form so Netlify Forms registers "review-desk-done" at
     deploy time; the decrypted desk submits to it via fetch. Hidden, inert. -->
<form name="review-desk-done" data-netlify="true" netlify-honeypot="bot-field" hidden>
  <input name="reviewer"><input name="minutes"><textarea name="report"></textarea>
  <input name="bot-field">
</form>
<script>
const SALT = "${salt.toString("base64")}", IV = "${iv.toString("base64")}",
      CT = "${ct.toString("base64")}", ITER = ${ITER};
const b64 = s => Uint8Array.from(atob(s), c => c.charCodeAt(0));
async function unlock(pw) {
  const raw = await crypto.subtle.importKey("raw", new TextEncoder().encode(pw), "PBKDF2", false, ["deriveKey"]);
  const key = await crypto.subtle.deriveKey(
    { name:"PBKDF2", salt:b64(SALT), iterations:ITER, hash:"SHA-256" },
    raw, { name:"AES-GCM", length:256 }, false, ["decrypt"]);
  const pt = await crypto.subtle.decrypt({ name:"AES-GCM", iv:b64(IV) }, key, b64(CT));
  return new TextDecoder().decode(pt);
}
async function tryUnlock(pw, silent) {
  try {
    const html = await unlock(pw);
    sessionStorage.setItem("desk-pw", pw);
    if (!sessionStorage.getItem("desk-t0")) sessionStorage.setItem("desk-t0", String(Date.now()));
    document.open(); document.write(html); document.close();
  } catch (e) {
    if (!silent) document.getElementById("err").textContent = "Wrong passphrase — try again.";
    sessionStorage.removeItem("desk-pw");
  }
}
document.getElementById("f").addEventListener("submit", ev => {
  ev.preventDefault();
  tryUnlock(document.getElementById("pw").value, false);
});
const cached = sessionStorage.getItem("desk-pw");
if (cached) tryUnlock(cached, true);
</script>
`;

writeFileSync(output, page);
console.log(`encrypted ${input} -> ${output} (${(ct.length/1024)|0}KB ciphertext, AES-256-GCM, PBKDF2x${ITER})`);

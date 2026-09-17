// Fighters grouped for /fighters/, in the canonical order declared by
// data/fighters.json -> categories. Any category present on a fighter but
// missing from that list is appended, so nobody silently disappears.
const data = require("../../data/fighters.json");
const fighters = data.fighters || [];
const declared = data.categories || [];
const seen = declared.slice();
for (const f of fighters) if (f.category && !seen.includes(f.category)) seen.push(f.category);
module.exports = seen
  .map(name => ({ name, items: fighters.filter(f => f.category === name) }))
  .filter(g => g.items.length);

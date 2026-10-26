// Books we bought, read or listened to — grouped by author, in the order the
// authors first appear in data/books.json. An author who is also in the
// fighters directory links to their entry (matched by name, or by an explicit
// `fighter` field where the names differ).
const books = require("../../data/books.json").books || [];
const fighters = require("../../data/fighters.json").fighters || [];
const byName = new Map(fighters.map((f) => [f.name, f]));

const order = [];
const grouped = new Map();
for (const b of books) {
  if (!grouped.has(b.author)) { grouped.set(b.author, []); order.push(b.author); }
  grouped.get(b.author).push(b);
}

module.exports = {
  count: books.length,
  authors: order.map((author) => {
    const entry = byName.get(grouped.get(author)[0].fighter || author);
    return {
      author,
      url: entry ? entry.url : null,          // their own site, if we list them
      inDirectory: !!entry,
      titles: grouped.get(author).map((b) => b.title),
    };
  }),
};

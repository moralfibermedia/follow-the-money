// The fighters we put money behind. Subscriptions and memberships are one
// group — the distinction didn't survive contact with reality (a paid Substack
// and a membership are the same act), and we don't use "donation" language.
// Books live separately in data/books.json, where the titles are named.
const fighters = require("../../data/fighters.json").fighters || [];
const SUBS = new Set(["paid subscriber", "member"]);
const backed = fighters.filter((f) => f.support);
const subscribed = backed.filter((f) => SUBS.has(f.support));
module.exports = {
  all: backed,
  count: backed.length,
  subscribed,
  subscribedCount: subscribed.length,
};

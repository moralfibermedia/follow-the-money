// The fighters we put money behind, grouped by the form that support takes.
// Derived from data/fighters.json — /backed/ never holds its own copy.
const fighters = require("../../data/fighters.json").fighters || [];
const ORDER = ["paid subscriber", "member", "bought the books"];
const LABEL = {
  "paid subscriber": "Paid subscriptions",
  "member": "Memberships & donations",
  "bought the books": "Books we bought",
};
const backed = fighters.filter((f) => f.support);
const forms = [...new Set(backed.map((f) => (typeof f.support === "string" ? f.support : "member")))]
  .sort((a, b) => (ORDER.indexOf(a) + 1 || 99) - (ORDER.indexOf(b) + 1 || 99));

module.exports = {
  all: backed,
  count: backed.length,
  groups: forms.map((form) => ({
    form,
    label: LABEL[form] || form,
    items: backed.filter((f) => (typeof f.support === "string" ? f.support : "member") === form),
  })),
};

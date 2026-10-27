// Counts for the homepage card. Computed here because Nunjucks' selectattr
// ignores the test argument and returns every item, which silently inflated
// the "open for comment" number.
const rules = require("./watchedRules.js");
const by = (s) => rules.filter((r) => r.state === s).length;
module.exports = {
  total: rules.length,
  open: by("open") + by("closing"),
  closed: by("closed"),
  resolved: by("resolved"),
};

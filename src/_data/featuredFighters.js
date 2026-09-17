// The 9 shown in every page's tail — DERIVED from data/fighters.json so the
// tail can never drift from the directory (this used to be a hand-kept copy).
module.exports = require("../../data/fighters.json").fighters
  .filter(f => f.featured)
  .map(f => ({ name: f.name, url: f.url, desc: f.description.split(".")[0] }));

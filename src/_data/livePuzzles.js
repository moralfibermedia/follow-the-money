// All live puzzles across mechanics, newest first — feeds the page rail.
module.exports = require("../../data/puzzles.json").puzzles
  .filter(p => p.status === "live")
  .map(p => ({
    id: p.id,
    title: p.title,
    template: p.template,
    number: p.number,
    path: "/" + (p.path || "puzzles/" + p.id)
  }))
  .reverse();

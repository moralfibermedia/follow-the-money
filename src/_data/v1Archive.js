// Which puzzle ids have a pre-migration /v1/ arcade page. /compare/ pairs each
// live puzzle with its v1 archive; puzzles built after the migration (anything
// from the Studio) have no v1, so the pair has to be conditional.
const fs = require("fs"), path = require("path");
const dir = path.join(__dirname, "../../v1");
let ids = [];
try {
  ids = fs.readdirSync(dir, { withFileTypes: true })
    .filter((e) => e.isDirectory() && fs.existsSync(path.join(dir, e.name, "index.html")))
    .map((e) => e.name);
} catch { ids = []; }
module.exports = ids;

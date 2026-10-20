const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const path = require("path");

test("water-level writes and daily-history deletion require DRRMO access", () => {
  const routeSource = fs.readFileSync(
    path.join(__dirname, "waterLevelRoutes.js"),
    "utf8"
  );

  assert.match(routeSource, /router\.post\(\s*"\/",\s*requireDrrmo,\s*createWaterLevel\s*\)/);
  assert.match(
    routeSource,
    /router\.delete\(\s*"\/history\/daily\/:id",\s*requireDrrmo,\s*deleteDailyWaterLevelHistory\s*\)/
  );
});

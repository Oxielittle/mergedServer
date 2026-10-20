const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const path = require("path");

test("water-level writes accept DRRMO sessions or the trusted YOLO producer", () => {
  const routeSource = fs.readFileSync(
    path.join(__dirname, "waterLevelRoutes.js"),
    "utf8"
  );

  assert.match(
    routeSource,
    /router\.post\(\s*"\/",\s*requireDrrmoOrYoloAgent,\s*createWaterLevel\s*\)/
  );
  assert.match(
    routeSource,
    /router\.delete\(\s*"\/history\/daily\/:id",\s*requireDrrmo,\s*deleteDailyWaterLevelHistory\s*\)/
  );
});

test("the YOLO producer sends its configured service token", () => {
  const producerSource = fs.readFileSync(
    path.join(__dirname, "../../../logic2/yolo.py"),
    "utf8"
  );

  assert.match(producerSource, /YOLO_AGENT_TOKEN/);
  assert.match(producerSource, /x-yolo-agent-token/);
});

const test = require("node:test");
const assert = require("node:assert/strict");
const { requireDrrmoOrYoloAgent } = require("./waterLevelAccess");

function response() {
  return {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return body;
    },
  };
}

test("water writes allow DRRMO sessions and the configured YOLO producer only", () => {
  const originalToken = process.env.YOLO_AGENT_TOKEN;
  process.env.YOLO_AGENT_TOKEN = "water-producer-test-token";

  try {
    let allowed = 0;
    requireDrrmoOrYoloAgent(
      { session: { userId: "drrmo-1", role: "drrmo" }, get: () => "" },
      response(),
      () => allowed++
    );

    requireDrrmoOrYoloAgent(
      {
        session: null,
        get: (header) =>
          header === "x-yolo-agent-token" ? "water-producer-test-token" : "",
      },
      response(),
      () => allowed++
    );

    const denied = response();
    requireDrrmoOrYoloAgent(
      { session: null, get: () => "wrong-token" },
      denied,
      () => allowed++
    );

    assert.equal(allowed, 2);
    assert.equal(denied.statusCode, 401);
  } finally {
    if (originalToken === undefined) delete process.env.YOLO_AGENT_TOKEN;
    else process.env.YOLO_AGENT_TOKEN = originalToken;
  }
});

const test = require("node:test");
const assert = require("node:assert/strict");

const { canBroadcastLocation } = require("./socketRoomAccess");

test("location broadcasts require an authenticated socket identity", () => {
  assert.equal(canBroadcastLocation({ data: {} }), false);
  assert.equal(
    canBroadcastLocation({ data: { authUserId: "user-123" } }),
    true
  );
});

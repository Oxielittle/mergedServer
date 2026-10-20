const test = require("node:test");
const assert = require("node:assert/strict");

const {
  canBroadcastLocation,
  validateLocationBroadcast,
} = require("./socketRoomAccess");

test("location broadcasts require an authenticated socket identity", () => {
  assert.equal(canBroadcastLocation({ data: {} }), false);
  assert.equal(
    canBroadcastLocation({ data: { authUserId: "user-123" } }),
    true
  );
});

test("location broadcasts validate coordinates and bind the authenticated sender", () => {
  const socket = { data: { authUserId: "user-123" } };

  assert.deepEqual(
    validateLocationBroadcast(socket, {
      latitude: "15.3383",
      longitude: "120.9141",
      userId: "someone-else",
      senderId: "someone-else",
      unexpected: "discarded",
    }),
    {
      ok: true,
      payload: {
        userId: "user-123",
        senderId: "user-123",
        latitude: 15.3383,
        longitude: 120.9141,
        lat: 15.3383,
        lng: 120.9141,
      },
    }
  );

  assert.equal(validateLocationBroadcast(socket, { latitude: 100, longitude: 0 }).ok, false);
  assert.equal(validateLocationBroadcast({ data: {} }, { latitude: 15, longitude: 120 }).ok, false);
});

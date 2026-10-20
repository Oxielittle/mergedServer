const test = require("node:test");
const assert = require("node:assert/strict");

const {
  getExpiryMeta,
  requiresExpirationForGoods,
  toBoolean,
  toNumber,
} = require("./inventoryItemUtils");

test("inventory item helpers preserve item parsing and expiry rules", () => {
  assert.equal(toNumber("12.5"), 12.5);
  assert.equal(toNumber("invalid"), undefined);
  assert.equal(toBoolean("required"), true);
  assert.equal(toBoolean("optional"), false);

  assert.deepEqual(
    getExpiryMeta("2026-05-10", new Date("2026-05-11T08:00:00Z")),
    { expiryStatus: "expired", daysUntilExpiration: -1 }
  );
  assert.equal(requiresExpirationForGoods("blankets"), false);
  assert.equal(requiresExpirationForGoods("rice"), true);
});

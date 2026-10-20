const crypto = require("crypto");

function hasMatchingToken(expected, received) {
  const expectedBuffer = Buffer.from(String(expected || ""));
  const receivedBuffer = Buffer.from(String(received || ""));

  return (
    expectedBuffer.length > 0 &&
    expectedBuffer.length === receivedBuffer.length &&
    crypto.timingSafeEqual(expectedBuffer, receivedBuffer)
  );
}

function requireAdminBootstrap(req, res, next) {
  const expectedToken = process.env.ADMIN_BOOTSTRAP_TOKEN;
  const receivedToken = req.get("x-admin-bootstrap-token");

  if (!expectedToken) {
    return res.status(503).json({ message: "Administrator bootstrap is not configured." });
  }

  if (!hasMatchingToken(expectedToken, receivedToken)) {
    return res.status(401).json({ message: "Invalid administrator bootstrap token." });
  }

  next();
}

module.exports = { requireAdminBootstrap };

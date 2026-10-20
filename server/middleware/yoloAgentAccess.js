const crypto = require("crypto");

function requireYoloAgentToken(req, res, next) {
  const expectedToken = process.env.YOLO_AGENT_TOKEN;
  const receivedToken = req.get("x-yolo-agent-token");
  const expectedBuffer = Buffer.from(String(expectedToken || ""));
  const receivedBuffer = Buffer.from(String(receivedToken || ""));

  if (!expectedToken) {
    return res.status(503).json({ message: "YOLO agent authentication is not configured." });
  }

  if (
    expectedBuffer.length === 0 ||
    expectedBuffer.length !== receivedBuffer.length ||
    !crypto.timingSafeEqual(expectedBuffer, receivedBuffer)
  ) {
    return res.status(401).json({ message: "Invalid YOLO agent token." });
  }

  next();
}

module.exports = { requireYoloAgentToken };

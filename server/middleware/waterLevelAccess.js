const { requireDrrmo } = require("./adminMiddleware");
const { requireYoloAgentToken } = require("./yoloAgentAccess");

function requireDrrmoOrYoloAgent(req, res, next) {
  // A signed-in browser must still be a DRRMO account. The service token is
  // reserved for the separate YOLO water-level producer.
  if (req.session?.userId || req.session?.role) {
    return requireDrrmo(req, res, next);
  }

  return requireYoloAgentToken(req, res, next);
}

module.exports = { requireDrrmoOrYoloAgent };

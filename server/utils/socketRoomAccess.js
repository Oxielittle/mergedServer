const { verifyUserAuthToken } = require("./userAuthToken");

function getSocketToken(socket) {
  const authToken = socket?.handshake?.auth?.token;
  if (authToken) return String(authToken);

  const authorization = String(socket?.handshake?.headers?.authorization || "");
  const match = authorization.match(/^Bearer\s+(.+)$/i);
  return match?.[1] || "";
}

function applySocketIdentity(socket) {
  let claims = null;
  try {
    claims = verifyUserAuthToken(getSocketToken(socket));
  } catch (_) {
    claims = null;
  }
  socket.data.authUserId = claims?.sub ? String(claims.sub) : null;
  return socket.data.authUserId;
}

function canJoinUserRoom(socket, requestedUserId) {
  const authenticatedUserId = String(socket?.data?.authUserId || "").trim();
  return Boolean(authenticatedUserId && authenticatedUserId === String(requestedUserId || "").trim());
}

module.exports = { applySocketIdentity, canJoinUserRoom };

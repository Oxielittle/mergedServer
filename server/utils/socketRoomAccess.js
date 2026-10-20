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

function canBroadcastLocation(socket) {
  return Boolean(String(socket?.data?.authUserId || "").trim());
}

function validateLocationBroadcast(socket, data) {
  const userId = String(socket?.data?.authUserId || "").trim();
  if (!userId) {
    return { ok: false, message: "Sign in before sharing a safety location." };
  }

  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return { ok: false, message: "A location payload is required." };
  }

  const latitude = Number(data.latitude ?? data.lat);
  const longitude = Number(data.longitude ?? data.lng);
  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) {
    return { ok: false, message: "Location coordinates are invalid." };
  }

  return {
    ok: true,
    payload: {
      userId,
      senderId: userId,
      latitude,
      longitude,
      lat: latitude,
      lng: longitude,
    },
  };
}

module.exports = {
  applySocketIdentity,
  canJoinUserRoom,
  canBroadcastLocation,
  validateLocationBroadcast,
};

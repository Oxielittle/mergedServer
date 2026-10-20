function requireSelf(req, res, next) {
  const requestedUserId = String(req.params?.id || "").trim();
  const authenticatedUserId = String(req.authUserId || "").trim();

  if (!requestedUserId || !authenticatedUserId || requestedUserId !== authenticatedUserId) {
    return res.status(403).json({ message: "You can only manage your own account." });
  }

  next();
}

module.exports = { requireSelf };

const { isPrivilegedStaffRole } = require("../utils/roleAccessUtils");

const requireLogin = (req, res, next) => {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  next();
};

const requireAdmin = (req, res, next) => {
  if (!req.session || req.session.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }

  next();
};

const requireDrrmo = (req, res, next) => {
  if (!req.session || req.session.role !== "drrmo") {
    return res.status(403).json({ message: "DRRMO access required" });
  }

  next();
};

const requireAdminOrDrrmo = (req, res, next) => {
  if (!req.session || !isPrivilegedStaffRole(req.session.role)) {
    return res
      .status(403)
      .json({ message: "Admin, DRRMO, or accountant access required" });
  }

  next();
};

const requireIncidentOperator = (req, res, next) => {
  if (!req.session || !["admin", "drrmo"].includes(req.session.role)) {
    return res.status(403).json({ message: "Admin or DRRMO access required" });
  }
  next();
};

module.exports = {
  requireLogin,
  requireAdmin,
  requireDrrmo,
  requireAdminOrDrrmo,
  requireIncidentOperator,
};

const express = require("express");
const router = express.Router();
const path = require("path");
const { uploadAvatar } = require("../middleware/upload");


// ✅ CONTROLLERS
const userController = require("../controllers/userController");

// ✅ MODEL
const UserModel = require("../models/User");
const { requireUserToken } = require("../utils/userAuthToken");
const { requireSelf } = require("../middleware/requestAccess");
const { requireAdmin } = require("../middleware/adminMiddleware");

/* =========================
   USER ROUTES
========================= */

router.get("/users", userController.getUsers);
router.post("/register", userController.registerUser);
router.put("/update/:id", requireUserToken, requireSelf, userController.updateUser);
router.post("/login", userController.loginUser);
router.post("/verify-email", userController.verifyEmailForReset);
router.post("/forgot-password/lookup", userController.forgotPasswordLookup);
router.post("/forgot-password/send-otp", userController.forgotPasswordSendOtp);
router.post("/forgot-password/verify-otp", userController.forgotPasswordVerifyOtp);
router.post("/forgot-password/reset-password", userController.forgotPasswordResetPassword);
router.post("/forgot-password/skip-reset", userController.forgotPasswordSkipReset);
router.get("/:id/verification-status", userController.getVerificationStatus);
router.post("/:id/resend-verification-email", userController.resendVerificationEmail);
router.put("/archive/:id", requireAdmin, userController.archiveUser);
router.put("/restore/:id", requireAdmin, userController.restoreUser);

router.get("/verify/:token", userController.verifyEmail);

router.post("/send-otp", userController.sendOtp);
router.post("/verify-otp", userController.verifyOtp);

// ✅ ✅ ✅ FIXED LOCATION ROUTE
router.put("/location/:id", requireUserToken, requireSelf, userController.updateLocation);
router.patch("/:id/share-safety-location", requireUserToken, requireSelf, userController.updateShareSafetyLocation);

router.put("/twofactor/:id", requireUserToken, requireSelf, userController.toggleTwoFactor);
router.post("/:id/notification-token/debug", requireUserToken, requireSelf, userController.logNotificationTokenDebug);
router.post("/:id/notification-token", requireUserToken, requireSelf, userController.registerNotificationToken);
router.get("/:id/notifications", requireUserToken, requireSelf, userController.getUserNotifications);
router.put("/:id/notifications/read-all", requireUserToken, requireSelf, userController.markNotificationsRead);
router.delete("/:id/notifications", requireUserToken, requireSelf, userController.clearNotifications);

router.get("/:id", userController.getUserById);


router.put(
  "/avatar/:id",
  requireUserToken,
  requireSelf,
  (req, res, next) => {
    uploadAvatar.single("avatar")(req, res, (err) => {
      if (err) {
        console.error("AVATAR MULTER ERROR:", {
          message: err.message,
          code: err.code,
          field: err.field,
          name: err.name,
        });

        return res.status(400).json({
          message: err.message || "Avatar upload failed.",
          code: err.code || null,
          field: err.field || null,
        });
      }

      next();
    });
  },
  userController.uploadAvatar
);

module.exports = router;

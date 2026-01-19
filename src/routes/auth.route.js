const router = require("express").Router();
const AuthController = require("../controllers/auth.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const asyncHandler = require("../utils/asyncHandler");

module.exports = (app) => {
  const bus = app.get("eventBus");
  const auth = new AuthController(bus);

  router.post("/register", asyncHandler(auth.register));

  router.post("/fcm-token", authMiddleware, asyncHandler(auth.fcmToken));

  router.post("/verify-otp", asyncHandler(auth.verifyOtp));

  router.post("/resend-otp", asyncHandler(auth.resendOtp));

  router.post("/login", asyncHandler(auth.login));

  router.post("/refresh", asyncHandler(auth.refresh));

  router.get("/me", authMiddleware, asyncHandler(auth.me));

  router.post("/forgot-password", asyncHandler(auth.forgotPassword));

  router.post("/reset-password", asyncHandler(auth.resetPassword));

  router.post("/verify", asyncHandler(auth.verifyToken));

  router.get("/health", (req, res) => {
    res.status(200).json({ status: 'ok', service: 'auth-service' });
  });

  return router;
};

const router = require("express").Router();
const AuthController = require("../controllers/auth.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const asyncHandler = require("../utils/asyncHandler");

module.exports = (app) => {
  const bus = app.get("eventBus");
  const auth = new AuthController(bus);

  router.post("/register", asyncHandler(auth.register));

  router.post("/verify-otp", asyncHandler(auth.verifyOtp));

  router.post("/resend-otp", asyncHandler(auth.resendOtp));

  router.post("/login", asyncHandler(auth.login));

  router.post("/refresh", asyncHandler(auth.refresh));

  router.get("/me", authMiddleware, asyncHandler(auth.me));

  router.post("/forgot-password", asyncHandler(auth.forgotPassword));

  router.post("/reset-password", asyncHandler(auth.resetPassword));

  router.post("/verify", asyncHandler(auth.verifyToken));

  return router;
};

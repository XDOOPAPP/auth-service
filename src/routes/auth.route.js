const router = require("express").Router();
const AuthController = require("../controllers/auth.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const asyncHandler = require("../utils/asyncHandler");
const upload = require("../config/multer")

module.exports = (app) => {
  const bus = app.get("eventBus");
  const auth = new AuthController(bus);

  router.post("/register", asyncHandler(auth.register));

  router.post("/register-admin", authMiddleware, asyncHandler(auth.registerAdmin));

  router.get("/all-admin", authMiddleware, asyncHandler(auth.getAllAdmin));

  router.post("/fcm-token", authMiddleware, asyncHandler(auth.fcmToken));

  router.post("/verify-otp", asyncHandler(auth.verifyOtp));

  router.post("/resend-otp", asyncHandler(auth.resendOtp));

  router.post("/login", asyncHandler(auth.login));

  router.post("/logout", authMiddleware, asyncHandler(auth.logout));

  router.patch("/update-profile", authMiddleware, upload.single("avatar"), asyncHandler(auth.updateProfile));

  router.post("/refresh", asyncHandler(auth.refresh));

  router.get("/me", authMiddleware, asyncHandler(auth.me));

  router.post("/forgot-password", asyncHandler(auth.forgotPassword));

  router.post("/reset-password", asyncHandler(auth.resetPassword));

  router.post("/change-password", authMiddleware, asyncHandler(auth.changePassword));

  router.post("/verify", asyncHandler(auth.verifyToken));

  // User Management CRUD Routes (require authentication)
  router.get("/users", authMiddleware, asyncHandler(auth.getAllUsers));
  
  router.delete("/users/:userId", authMiddleware, asyncHandler(auth.deleteUser));
  
  router.patch("/users/:userId/deactivate", authMiddleware, asyncHandler(auth.deactivateUser));
  
  router.patch("/users/:userId/reactivate", authMiddleware, asyncHandler(auth.reactivateUser));

  // Statistics Routes (require authentication)
  router.get("/stats/users-over-time", authMiddleware, asyncHandler(auth.getUsersOverTime));
  
  router.get("/stats/total", authMiddleware, asyncHandler(auth.getTotalUsersStats));

  router.get("/health", (req, res) => {
    res.status(200).json({ status: 'ok', service: 'auth-service' });
  });

  return router;
};

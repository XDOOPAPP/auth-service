const router = require("express").Router();
const auth = require("../controllers/auth.controller");
const authMiddleware = require("../middlewares/auth.middleware");

router.post("/register", auth.register);

router.post("/verify-otp", auth.verifyOtp);

router.post("/resend-otp", auth.resendOtp);

router.post("/login", auth.login);

router.post("/refresh", auth.refresh);

router.get("/me", authMiddleware, auth.me);

router.post("/forgot-password", auth.forgotPassword);

router.post("/reset-password", auth.resetPassword);

router.post("/verify", auth.verifyToken);

router.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    service: "Auth Service",
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(process.uptime())} seconds`,
  });
});

module.exports = router;
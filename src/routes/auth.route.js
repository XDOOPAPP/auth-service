const router = require("express").Router();
const auth = require("../controllers/auth.controller");
const authMiddleware = require("../middlewares/auth.middleware");

router.post("/register", auth.register);

router.post("/verify-otp", auth.verifyOtp);

router.post("/login", auth.login);

router.post("/refresh", auth.refresh);

router.get("/me", authMiddleware, auth.me);

router.post("/verify", auth.verifyToken);

module.exports = router;
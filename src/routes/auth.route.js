const router = require("express").Router();
const auth = require("../controllers/auth.controller");
const authMiddleware = require("../middlewares/auth.middleware");

router.post("/register", auth.register);   // public

router.post("/login", auth.login);         // public

module.exports = router;
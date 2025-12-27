// external modules
const express = require("express");
// internal modules
const { register, login, logout, me, forgotPassword, resetPassword } = require("../controllers/authController");
// middlewares
const { authenticate } = require("../middlewares/auth");

// create a router
const router = express.Router();

router.post("/register", register); // register a new user
router.post("/login", login); // login a user
router.post("/logout", authenticate, logout); // logout a user
router.post("/forgot-password", forgotPassword); // request password reset (no auth required)
router.post("/reset-password", resetPassword); // reset password with token (no auth required)

// export the router
module.exports = router;
const express = require("express");
const { login, createStaffAccount } = require("../controllers/authController");
const { authMiddleware, requireRole } = require("../utils/auth");

const router = express.Router();

router.post("/login", login);
router.post("/staff", authMiddleware, requireRole("ADMIN"), createStaffAccount);

module.exports = router;

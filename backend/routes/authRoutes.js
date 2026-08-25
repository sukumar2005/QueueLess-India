const express = require("express");

const {
  login,
  createStaffAccount,
} = require("../controllers/authController");

const {
  authMiddleware,
  requireRole,
} = require("../utils/auth");

const router = express.Router();

// ======================================================
// LOGIN
// ======================================================
// Used by:
// USER
// HOSPITAL
// GOVERNMENT OFFICE
// ADMIN

router.post("/login", login);


// ======================================================
// USER REGISTRATION
// ======================================================
// Anyone can create a normal USER account.
// USER cannot create HOSPITAL / OFFICE / ADMIN accounts.
//
// Frontend sends:
// {
//   name,
//   username,
//   password
// }

router.post("/register", async (req, res) => {
  try {
    // Always force public registration to USER
    req.body.role = "USER";

    return createStaffAccount(req, res);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});


// ======================================================
// ADMIN → CREATE HOSPITAL / GOVERNMENT OFFICE ACCOUNT
// ======================================================
// Only ADMIN can create these accounts.
//
// HOSPITAL:
// {
//   name,
//   username,
//   password,
//   role: "HOSPITAL",
//   hospitalId
// }
//
// GOVERNMENT OFFICE:
// {
//   name,
//   username,
//   password,
//   role: "GOVERNMENT OFFICE",
//   officeId
// }

router.post(
  "/staff",
  authMiddleware,
  requireRole("ADMIN"),
  createStaffAccount
);


// ======================================================
// EXPORT
// ======================================================

module.exports = router;
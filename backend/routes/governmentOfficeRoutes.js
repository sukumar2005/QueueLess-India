const express = require("express");

const {
  getGovernmentOffices,
  getOfficeOfficers,
  updateOfficerAttendance,
  createOfficeToken,
  getOfficeQueueStatus,
  getCitizenOfficeQueue,
  callNextOfficeToken,
  completeOfficeToken,
  skipOfficeToken,
} = require("../controllers/governmentOfficeController");

const {
  authMiddleware,
  requireRole,
  requireOfficeAccess,
} = require("../utils/auth");

const router = express.Router();

// ============================================================
// GOVERNMENT OFFICES
// ============================================================

router.get(
  "/",
  getGovernmentOffices
);

// ============================================================
// OFFICERS
// ============================================================

router.get(
  "/:id/officers",
  getOfficeOfficers
);

// ============================================================
// OFFICER ATTENDANCE
// ============================================================

router.post(
  "/:id/officers/:officerId/attendance",
  authMiddleware,
  requireRole(
    "ADMIN",
    "GOVERNMENT OFFICE"
  ),
  requireOfficeAccess,
  updateOfficerAttendance
);

// ============================================================
// CITIZEN BOOKING
// ============================================================

router.post(
  "/tokens",
  authMiddleware,
  requireRole(
    "ADMIN",
    "GOVERNMENT OFFICE",
    "USER"
  ),
  createOfficeToken
);

// ============================================================
// LIVE QUEUE
// ============================================================

router.get(
  "/queue/status",
  authMiddleware,
  requireRole(
    "ADMIN",
    "GOVERNMENT OFFICE",
    "USER"
  ),
  getOfficeQueueStatus
);

// ============================================================
// CITIZEN'S OWN QUEUE
// ============================================================

router.get(
  "/queue/my",
  authMiddleware,
  requireRole("USER"),
  getCitizenOfficeQueue
);

// ============================================================
// OFFICER: CALL NEXT
// ============================================================

router.post(
  "/queue/next",
  authMiddleware,
  requireRole(
    "ADMIN",
    "GOVERNMENT OFFICE"
  ),
  requireOfficeAccess,
  callNextOfficeToken
);

// ============================================================
// OFFICER: COMPLETE
// ============================================================

router.post(
  "/queue/complete",
  authMiddleware,
  requireRole(
    "ADMIN",
    "GOVERNMENT OFFICE"
  ),
  requireOfficeAccess,
  completeOfficeToken
);

// ============================================================
// OFFICER: SKIP
// ============================================================

router.post(
  "/queue/skip",
  authMiddleware,
  requireRole(
    "ADMIN",
    "GOVERNMENT OFFICE"
  ),
  requireOfficeAccess,
  skipOfficeToken
);

module.exports = router;
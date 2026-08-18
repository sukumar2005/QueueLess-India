const express = require("express");

const {
  getGovernmentOffices,
  getOfficeOfficers,
  updateOfficerAttendance,
  createOfficeToken,
  getOfficeQueueStatus,
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

router.get("/", getGovernmentOffices);
router.get("/:id/officers", getOfficeOfficers);
router.post(
  "/:id/officers/:officerId/attendance",
  authMiddleware,
  requireRole("ADMIN", "GOVERNMENT OFFICE"),
  requireOfficeAccess,
  updateOfficerAttendance
);
router.post(
  "/tokens",
  authMiddleware,
  requireRole("ADMIN", "GOVERNMENT OFFICE"),
  requireOfficeAccess,
  createOfficeToken
);
router.get(
  "/queue/status",
  authMiddleware,
  requireRole("ADMIN", "GOVERNMENT OFFICE"),
  requireOfficeAccess,
  getOfficeQueueStatus
);
router.post(
  "/queue/next",
  authMiddleware,
  requireRole("ADMIN", "GOVERNMENT OFFICE"),
  requireOfficeAccess,
  callNextOfficeToken
);
router.post(
  "/queue/complete",
  authMiddleware,
  requireRole("ADMIN", "GOVERNMENT OFFICE"),
  requireOfficeAccess,
  completeOfficeToken
);
router.post(
  "/queue/skip",
  authMiddleware,
  requireRole("ADMIN", "GOVERNMENT OFFICE"),
  requireOfficeAccess,
  skipOfficeToken
);

module.exports = router;

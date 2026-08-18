const express = require("express");

const {
  getHospitals,
  getHospitalDoctors,
  updateDoctorAttendance,
  createHospitalToken,
  getHospitalQueueStatus,
  callNextHospitalToken,
  completeHospitalToken,
  skipHospitalToken,
} = require("../controllers/hospitalController");
const {
  authMiddleware,
  requireRole,
  requireHospitalAccess,
} = require("../utils/auth");

const router = express.Router();

router.get("/", getHospitals);
router.get("/:id/doctors", getHospitalDoctors);
router.post(
  "/:id/doctors/:doctorId/attendance",
  authMiddleware,
  requireRole("ADMIN", "HOSPITAL"),
  requireHospitalAccess,
  updateDoctorAttendance
);
router.post(
  "/tokens",
  authMiddleware,
  requireRole("ADMIN", "HOSPITAL"),
  requireHospitalAccess,
  createHospitalToken
);
router.get(
  "/queue/status",
  authMiddleware,
  requireRole("ADMIN", "HOSPITAL"),
  requireHospitalAccess,
  getHospitalQueueStatus
);
router.post(
  "/queue/next",
  authMiddleware,
  requireRole("ADMIN", "HOSPITAL"),
  requireHospitalAccess,
  callNextHospitalToken
);
router.post(
  "/queue/complete",
  authMiddleware,
  requireRole("ADMIN", "HOSPITAL"),
  requireHospitalAccess,
  completeHospitalToken
);
router.post(
  "/queue/skip",
  authMiddleware,
  requireRole("ADMIN", "HOSPITAL"),
  requireHospitalAccess,
  skipHospitalToken
);

module.exports = router;

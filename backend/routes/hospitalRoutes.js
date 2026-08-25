const express = require("express");

const {
  getHospitals,
  getHospitalDoctors,
  updateDoctorAttendance,
  createHospitalToken,
  getMyHospitalAppointments,
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

// ======================================================
// GET ALL HOSPITALS
// GET /api/v1/hospitals
//
// PUBLIC
// ======================================================

router.get(
  "/",
  getHospitals
);

// ======================================================
// GET DOCTORS FOR A HOSPITAL
// GET /api/v1/hospitals/:id/doctors
//
// PUBLIC
// ======================================================

router.get(
  "/:id/doctors",
  getHospitalDoctors
);

// ======================================================
// MY HOSPITAL APPOINTMENTS
// GET /api/v1/hospitals/my-appointments
// ======================================================

router.get(
  "/my-appointments",
  authMiddleware,
  requireRole("USER"),
  getMyHospitalAppointments
);

// ======================================================
// DOCTOR ATTENDANCE
//
// POST
// /api/v1/hospitals/:hospitalId/doctors/:doctorId/attendance
//
// ADMIN + HOSPITAL ONLY
// ======================================================

router.post(
  "/:hospitalId/doctors/:doctorId/attendance",
  authMiddleware,
  requireRole("ADMIN", "HOSPITAL"),
  requireHospitalAccess,
  updateDoctorAttendance
);

// ======================================================
// CREATE / BOOK HOSPITAL TOKEN
//
// POST /api/v1/hospitals/tokens
//
// USER
//     → Online appointment
//
// HOSPITAL
//     → Offline token
//
// ADMIN
//     → Administrative booking
//
// IMPORTANT:
// DO NOT use requireHospitalAccess here.
//
// A USER does not have hospital ownership/access,
// so requireHospitalAccess would reject USER with 403.
//
// The controller itself receives hospitalId from the body.
// ======================================================

router.post(
  "/tokens",
  authMiddleware,
  requireRole("ADMIN", "HOSPITAL", "USER"),
  createHospitalToken
);

// ======================================================
// PUBLIC LIVE QUEUE STATUS
//
// GET /api/v1/hospitals/queue/status
//
// No login required.
//
// This is used by:
// - Citizen queue tracking
// - Hospital live queue
// - Appointment tracking
//
// IMPORTANT:
// Do NOT add authMiddleware here.
// ======================================================

router.get(
  "/queue/status",
  getHospitalQueueStatus
);

// ======================================================
// CALL NEXT PATIENT
//
// POST /api/v1/hospitals/queue/next
//
// ADMIN + HOSPITAL ONLY
// ======================================================

router.post(
  "/queue/next",
  authMiddleware,
  requireRole("ADMIN", "HOSPITAL"),
  requireHospitalAccess,
  callNextHospitalToken
);

// ======================================================
// COMPLETE CURRENT PATIENT
//
// POST /api/v1/hospitals/queue/complete
//
// ADMIN + HOSPITAL ONLY
// ======================================================

router.post(
  "/queue/complete",
  authMiddleware,
  requireRole("ADMIN", "HOSPITAL"),
  requireHospitalAccess,
  completeHospitalToken
);

// ======================================================
// SKIP CURRENT PATIENT
//
// POST /api/v1/hospitals/queue/skip
//
// ADMIN + HOSPITAL ONLY
// ======================================================

router.post(
  "/queue/skip",
  authMiddleware,
  requireRole("ADMIN", "HOSPITAL"),
  requireHospitalAccess,
  skipHospitalToken
);

// ======================================================
// EXPORT
// ======================================================

module.exports = router;
const express = require("express");

const {
  getHospitals,
  getHospitalDoctors,
  createHospitalToken,
} = require("../controllers/hospitalController");

const router = express.Router();

// ======================================================
// GET ALL HOSPITALS
// GET /api/v1/hospitals
// ======================================================

router.get("/", getHospitals);

// ======================================================
// GET DOCTORS FOR A HOSPITAL
// GET /api/v1/hospitals/:id/doctors
// ======================================================

// Public route.
// Used by Hospitals.jsx to load doctors.

router.get(
  "/:id/doctors",
  getHospitalDoctors
);

// ======================================================
// BOOK HOSPITAL APPOINTMENT
// POST /api/v1/hospitals/tokens
// ======================================================

// Public booking route.
// Citizen does NOT need to be logged in.

router.post(
  "/tokens",
  createHospitalToken
);

// ======================================================
// EXPORT ROUTER
// ======================================================

module.exports = router;
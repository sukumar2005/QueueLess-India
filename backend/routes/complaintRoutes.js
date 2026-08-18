const express = require("express");
const {
  submitComplaint,
  getComplaints,
  getComplaintById,
  updateComplaintStatus,
  addComplaintRating,
} = require("../controllers/complaintController");
const { authMiddleware } = require("../utils/auth");

const router = express.Router();

router.post("/", submitComplaint);
router.get("/", authMiddleware, getComplaints);
router.get("/:id", authMiddleware, getComplaintById);
router.patch("/:id/status", authMiddleware, updateComplaintStatus);
router.patch("/:id/rating", addComplaintRating);

module.exports = router;

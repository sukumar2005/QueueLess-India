const express = require("express");

const {
  getQueueStatus,
  createToken,
  callNext,
  completeService,
  skipToken,
} = require("../controllers/queueController");

const router = express.Router();

router.get("/status", getQueueStatus);
router.post("/token", createToken);
router.post("/next", callNext);
router.post("/complete", completeService);
router.post("/skip", skipToken);

module.exports = router;
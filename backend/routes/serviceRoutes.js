const express = require("express");

const {
  getServices,
  getServiceById,
  getDocumentServices,
} = require("../controllers/serviceController");

const router = express.Router();

router.get("/", getServices);
router.get("/documents", getDocumentServices);
router.get("/:id", getServiceById);

module.exports = router;

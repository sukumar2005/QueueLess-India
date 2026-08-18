const Complaint = require("../models/Complaint");
const Hospital = require("../models/Hospital");
const GovernmentOffice = require("../models/GovernmentOffice");

const submitComplaint = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      severity,
      location,
      hospitalId,
      officeId,
      submitterName,
      submitterPhone,
    } = req.body;

    if (!title || !description || !location || !submitterName || !submitterPhone) {
      return res.status(400).json({
        success: false,
        message:
          "Title, description, location, submitter name and phone are required",
      });
    }

    if (location === "Hospital" && !hospitalId) {
      return res.status(400).json({
        success: false,
        message: "Hospital ID is required for hospital complaints",
      });
    }

    if (location === "Government Office" && !officeId) {
      return res.status(400).json({
        success: false,
        message: "Office ID is required for government office complaints",
      });
    }

    const complaint = await Complaint.create({
      title,
      description,
      category: category || "Other",
      severity: severity || "Medium",
      location,
      hospital: location === "Hospital" ? hospitalId : null,
      governmentOffice: location === "Government Office" ? officeId : null,
      submittedBy: req.user?._id || null,
      submitterName,
      submitterPhone,
    });

    res.status(201).json({
      success: true,
      message: "Complaint submitted successfully",
      complaint,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getComplaints = async (req, res) => {
  try {
    const { status, location, severity, hospitalId, officeId } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (location) filter.location = location;
    if (severity) filter.severity = severity;

    if (req.user?.role === "HOSPITAL" && req.user?.hospitalId) {
      filter.hospital = req.user.hospitalId;
    } else if (req.user?.role === "GOVERNMENT OFFICE" && req.user?.officeId) {
      filter.governmentOffice = req.user.officeId;
    } else if (req.user?.role === "ADMIN") {
      if (hospitalId) filter.hospital = hospitalId;
      if (officeId) filter.governmentOffice = officeId;
    } else {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    const complaints = await Complaint.find(filter)
      .populate("hospital", "name")
      .populate("governmentOffice", "name")
      .populate("submittedBy", "username name")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: complaints.length,
      complaints,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getComplaintById = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate("hospital", "name")
      .populate("governmentOffice", "name")
      .populate("submittedBy", "username name");

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found",
      });
    }

    if (
      req.user?.role === "HOSPITAL" &&
      String(req.user.hospitalId) !== String(complaint.hospital?._id)
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    if (
      req.user?.role === "GOVERNMENT OFFICE" &&
      String(req.user.officeId) !== String(complaint.governmentOffice?._id)
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    res.json({
      success: true,
      complaint,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateComplaintStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, resolution } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required",
      });
    }

    const complaint = await Complaint.findById(id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found",
      });
    }

    if (req.user?.role === "HOSPITAL" && req.user?.hospitalId) {
      if (String(complaint.hospital) !== String(req.user.hospitalId)) {
        return res.status(403).json({
          success: false,
          message: "Access denied",
        });
      }
    } else if (req.user?.role === "GOVERNMENT OFFICE" && req.user?.officeId) {
      if (String(complaint.governmentOffice) !== String(req.user.officeId)) {
        return res.status(403).json({
          success: false,
          message: "Access denied",
        });
      }
    } else if (req.user?.role !== "ADMIN") {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    complaint.status = status;
    if (resolution) complaint.resolution = resolution;
    if (status === "Resolved" || status === "Closed") {
      complaint.resolvedAt = new Date();
    }

    await complaint.save();

    res.json({
      success: true,
      message: "Complaint updated successfully",
      complaint,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const addComplaintRating = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5",
      });
    }

    const complaint = await Complaint.findByIdAndUpdate(
      id,
      { rating },
      { new: true }
    );

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found",
      });
    }

    res.json({
      success: true,
      message: "Rating added successfully",
      complaint,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  submitComplaint,
  getComplaints,
  getComplaintById,
  updateComplaintStatus,
  addComplaintRating,
};

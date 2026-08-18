const GovernmentOffice = require("../models/GovernmentOffice");
const Officer = require("../models/Officer");
const Token = require("../models/Token");

const addMinutes = (minutes) => {
  const date = new Date(Date.now() + minutes * 60000);
  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const ensureOfficeData = async () => {
  const count = await GovernmentOffice.countDocuments();

  if (count > 0) {
    return;
  }

  const offices = await GovernmentOffice.insertMany([
    {
      name: "Coimbatore Taluk Office",
      type: "Taluk Office",
      state: "Tamil Nadu",
      district: "Coimbatore",
      village: "Coimbatore",
      address: "Coimbatore Collectorate Campus",
      available: true,
    },
    {
      name: "Coimbatore Municipal Office",
      type: "Municipal Office",
      state: "Tamil Nadu",
      district: "Coimbatore",
      village: "Coimbatore",
      address: "Town Hall, Coimbatore",
      available: true,
    },
    {
      name: "Pollachi Revenue Office",
      type: "Revenue Office",
      state: "Tamil Nadu",
      district: "Coimbatore",
      village: "Pollachi",
      address: "Pollachi Main Road",
      available: true,
    },
    {
      name: "Vijayawada RTO Office",
      type: "RTO Office",
      state: "Andhra Pradesh",
      district: "Krishna",
      village: "Vijayawada",
      address: "Vijayawada",
      available: true,
    },
  ]);

  await Officer.insertMany([
    {
      name: "Ravi Kumar",
      department: "Revenue Department",
      designation: "VAO",
      governmentOffice: offices[0]._id,
      status: "Available",
      counter: 1,
      currentWaiting: 6,
      averageServiceTime: 15,
      purposes: ["Income Certificate", "Community Certificate"],
    },
    {
      name: "Anitha Rao",
      department: "Municipal Administration",
      designation: "Municipal Officer",
      governmentOffice: offices[1]._id,
      status: "Available",
      counter: 2,
      currentWaiting: 4,
      averageServiceTime: 15,
      purposes: ["Birth Certificate"],
    },
    {
      name: "Suresh Babu",
      department: "Revenue Department",
      designation: "MRO",
      governmentOffice: offices[2]._id,
      status: "Offline",
      expectedArrival: "2:00 PM",
      counter: 1,
      currentWaiting: 0,
      averageServiceTime: 20,
      purposes: ["Land Records", "Income Certificate"],
    },
    {
      name: "Prakash Reddy",
      department: "Transport Department",
      designation: "RTO Officer",
      governmentOffice: offices[3]._id,
      status: "Available",
      counter: 1,
      currentWaiting: 5,
      averageServiceTime: 20,
      purposes: ["Driving Licence", "Vehicle Registration"],
    },
  ]);
};

const getGovernmentOffices = async (req, res) => {
  try {
    await ensureOfficeData();

    const { state, district, village } = req.query;
    const filter = {};

    if (state) filter.state = state;
    if (district) filter.district = district;
    if (village) filter.village = village;

    const offices = await GovernmentOffice.find(filter).sort({
      name: 1,
    });

    const results = await Promise.all(
      offices.map(async (office) => {
        const [availableOfficers, waitingCount] = await Promise.all([
          Officer.countDocuments({
            governmentOffice: office._id,
            status: "Available",
          }),
          Token.countDocuments({
            tokenType: "office",
            governmentOffice: office._id,
            status: "waiting",
          }),
        ]);

        return {
          ...office.toObject(),
          availableOfficers,
          waitingCount,
        };
      })
    );

    res.json({ success: true, offices: results });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getOfficeOfficers = async (req, res) => {
  try {
    await ensureOfficeData();

    const { purpose } = req.query;
    const filter = { governmentOffice: req.params.id };

    if (purpose) {
      filter.purposes = purpose;
    }

    const officers = await Officer.find(filter).populate(
      "governmentOffice"
    );

    const results = await Promise.all(
      officers.map(async (officer) => {
        const waitingCount = await Token.countDocuments({
          tokenType: "office",
          governmentOffice: officer.governmentOffice._id,
          officer: officer._id,
          status: "waiting",
        });

        const peopleWaiting =
          waitingCount || officer.currentWaiting || 0;

        return {
          ...officer.toObject(),
          available: officer.status === "Available",
          peopleWaiting,
          estimatedWaitingTime:
            peopleWaiting * officer.averageServiceTime,
        };
      })
    );

    res.json({ success: true, officers: results });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateOfficerAttendance = async (req, res) => {
  try {
    const { officerId } = req.params;
    const { action, reason = "" } = req.body;
    const officeId = req.params.id || req.body.officeId || req.user?.officeId;

    if (!officeId || !officerId) {
      return res.status(400).json({
        success: false,
        message: "Office and officer are required",
      });
    }

    if (req.user && req.user.role === "GOVERNMENT OFFICE" && String(req.user.officeId) !== String(officeId)) {
      return res.status(403).json({
        success: false,
        message: "You can only manage your office staff",
      });
    }

    const officer = await Officer.findOne({ _id: officerId, governmentOffice: officeId });

    if (!officer) {
      return res.status(404).json({
        success: false,
        message: "Officer not found for this office",
      });
    }

    const normalizedAction = String(action || "checkin").toLowerCase();

    if (normalizedAction === "checkin") {
      officer.attendanceStatus = "Present";
      officer.isOnBreak = false;
      officer.breakReason = "";
      officer.lastCheckInAt = new Date();
    } else if (normalizedAction === "checkout") {
      officer.attendanceStatus = "Absent";
      officer.isOnBreak = false;
      officer.breakReason = "";
      officer.lastCheckInAt = null;
    } else if (normalizedAction === "break-start") {
      officer.attendanceStatus = "On Break";
      officer.isOnBreak = true;
      officer.breakReason = reason || "Break";
      officer.lastBreakStartedAt = new Date();
    } else if (normalizedAction === "break-end") {
      officer.attendanceStatus = "Present";
      officer.isOnBreak = false;
      officer.breakReason = "";
      officer.lastBreakEndedAt = new Date();
    } else if (normalizedAction === "working-hours") {
      const { start, end } = req.body;
      if (start) officer.workingHoursStart = start;
      if (end) officer.workingHoursEnd = end;
    } else {
      return res.status(400).json({
        success: false,
        message: "Unsupported attendance action",
      });
    }

    await officer.save();

    res.json({
      success: true,
      message: "Officer attendance updated",
      officer,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createOfficeToken = async (req, res) => {
  try {
    let officeId = req.body.officeId;
    const {
      citizenName,
      officerId,
      purpose,
      phone,
      source = "online",
    } = req.body;

    if (req.user && req.user.role === "GOVERNMENT OFFICE") {
      officeId = req.user.officeId;
    }

    if (!citizenName || !officeId || !officerId) {
      return res.status(400).json({
        success: false,
        message: "Citizen, office and officer are required",
      });
    }

    const officer = await Officer.findById(officerId).populate(
      "governmentOffice"
    );

    if (!officer || String(officer.governmentOffice._id) !== officeId) {
      return res.status(404).json({
        success: false,
        message: "Officer not found for this office",
      });
    }

    if (officer.status !== "Available") {
      return res.status(400).json({
        success: false,
        message: "Officer is not available",
      });
    }

    const tokenCount = await Token.countDocuments({
      tokenType: "office",
      governmentOffice: officeId,
      officer: officerId,
    });

    const waitingCount = await Token.countDocuments({
      tokenType: "office",
      governmentOffice: officeId,
      officer: officerId,
      status: "waiting",
    });

    const token = await Token.create({
      tokenType: "office",
      source,
      tokenNumber: `G-${String(tokenCount + 1).padStart(3, "0")}`,
      citizenName,
      phone,
      governmentOffice: officeId,
      officer: officerId,
      status: "waiting",
      counter: null,
      expectedTime: addMinutes(
        waitingCount * officer.averageServiceTime
      ),
      problem: purpose,
    });

    const populatedToken = await Token.findById(token._id)
      .populate("governmentOffice")
      .populate("officer");

    res.status(201).json({
      success: true,
      message: "Government office appointment booked",
      token: populatedToken,
      peopleAhead: waitingCount,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getOfficeQueueStatus = async (req, res) => {
  try {
    const { officerId } = req.query;
    let officeId = req.query.officeId;

    if (req.user && req.user.role === "GOVERNMENT OFFICE") {
      officeId = req.user.officeId;
    }

    if (!officeId || !officerId) {
      return res.status(400).json({
        success: false,
        message: "Office and officer are required",
      });
    }

    const queue = await Token.find({
      tokenType: "office",
      governmentOffice: officeId,
      officer: officerId,
      status: { $in: ["waiting", "serving"] },
    })
      .populate("governmentOffice")
      .populate("officer")
      .sort({ createdAt: 1 });

    res.json({
      success: true,
      currentToken:
        queue.find((token) => token.status === "serving") || null,
      peopleWaiting: queue.filter((token) => token.status === "waiting")
        .length,
      queue,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const callNextOfficeToken = async (req, res) => {
  try {
    let officeId = req.body.officeId;
    const { officerId, counter } = req.body;

    if (req.user && req.user.role === "GOVERNMENT OFFICE") {
      officeId = req.user.officeId;
    }

    const selectedCounter = Number(counter);

    if (![1, 2, 3].includes(selectedCounter)) {
      return res.status(400).json({
        success: false,
        message: "Counter must be 1, 2, or 3",
      });
    }

    const currentServing = await Token.findOne({
      tokenType: "office",
      governmentOffice: officeId,
      officer: officerId,
      status: "serving",
    });

    if (currentServing) {
      return res.status(400).json({
        success: false,
        message: "Complete or skip the current citizen first.",
      });
    }

    const nextToken = await Token.findOne({
      tokenType: "office",
      governmentOffice: officeId,
      officer: officerId,
      status: "waiting",
    }).sort({ createdAt: 1 });

    if (!nextToken) {
      return res.json({
        success: true,
        message: "No citizens waiting",
        token: null,
      });
    }

    nextToken.status = "serving";
    nextToken.counter = selectedCounter;

    await nextToken.save();

    res.json({
      success: true,
      message: "Next citizen called",
      token: nextToken,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const completeOfficeToken = async (req, res) => {
  try {
    let officeId = req.body.officeId;
    const { officerId } = req.body;

    if (req.user && req.user.role === "GOVERNMENT OFFICE") {
      officeId = req.user.officeId;
    }

    const token = await Token.findOne({
      tokenType: "office",
      governmentOffice: officeId,
      officer: officerId,
      status: "serving",
    });

    if (!token) {
      return res.status(404).json({
        success: false,
        message: "No citizen is currently being served",
      });
    }

    token.status = "completed";
    token.servedAt = new Date();

    await token.save();

    res.json({ success: true, message: "Citizen completed", token });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const skipOfficeToken = async (req, res) => {
  try {
    let officeId = req.body.officeId;
    const { officerId } = req.body;

    if (req.user && req.user.role === "GOVERNMENT OFFICE") {
      officeId = req.user.officeId;
    }

    const token = await Token.findOne({
      tokenType: "office",
      governmentOffice: officeId,
      officer: officerId,
      status: "serving",
    });

    if (!token) {
      return res.status(404).json({
        success: false,
        message: "No active citizen token",
      });
    }

    token.status = "skipped";

    await token.save();

    res.json({ success: true, message: "Citizen skipped", token });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getGovernmentOffices,
  getOfficeOfficers,
  updateOfficerAttendance,
  createOfficeToken,
  getOfficeQueueStatus,
  callNextOfficeToken,
  completeOfficeToken,
  skipOfficeToken,
};

const Token = require("../models/Token");
const Service = require("../models/Service");
const {
  createNotificationRecord,
} = require("./notificationController");

// ==========================================
// GET QUEUE STATUS
// ==========================================

const getQueueStatus = async (req, res) => {
  try {
    const { serviceId } = req.query;

    const filter = {
      status: {
        $in: ["waiting", "serving"],
      },
    };

    // If serviceId is provided,
    // only return that service queue.
    if (serviceId) {
      filter.service = serviceId;
    }

    const tokens = await Token.find(filter)
      .populate("service")
      .sort({ createdAt: 1 });

    const waitingTokens = tokens.filter(
      (token) => token.status === "waiting"
    );

    const servingToken = tokens.find(
      (token) => token.status === "serving"
    );

    res.json({
      success: true,
      serviceId: serviceId || null,
      currentToken: servingToken || null,
      peopleWaiting: waitingTokens.length,
      queue: tokens,
    });
  } catch (error) {
    console.error("Queue status error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// CREATE DIGITAL TOKEN
// ==========================================

const createToken = async (req, res) => {
  try {
    const {
      citizenName,
      serviceId,
    } = req.body;

    if (!citizenName || !serviceId) {
      return res.status(400).json({
        success: false,
        message: "Citizen name and service are required",
      });
    }

    const service = await Service.findById(serviceId);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    // Count tokens belonging to this service.
    const serviceTokenCount = await Token.countDocuments({
      service: serviceId,
    });

    const tokenNumber = `A-${String(
      serviceTokenCount + 1
    ).padStart(3, "0")}`;

    const token = await Token.create({
      tokenNumber,
      service: serviceId,
      citizenName,
      status: "waiting",
      counter: null,
    });

    const populatedToken = await Token.findById(
      token._id
    ).populate("service");

    res.status(201).json({
      success: true,
      message: "Digital token created",
      token: populatedToken,
    });
  } catch (error) {
    console.error("Create token error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// CALL NEXT CITIZEN
// ==========================================

const callNext = async (req, res) => {
  try {
    const { serviceId, counter } = req.body;

    if (!serviceId) {
      return res.status(400).json({
        success: false,
        message: "Service ID is required",
      });
    }

    const officerCounter = Number(counter);

    if (![1, 2, 3].includes(officerCounter)) {
      return res.status(400).json({
        success: false,
        message: "Officer counter must be 1, 2, or 3",
      });
    }

    // Check whether this service already has
    // a citizen being served.
    const currentServing = await Token.findOne({
      service: serviceId,
      status: "serving",
    });

    if (currentServing) {
      return res.status(400).json({
        success: false,
        message:
          "Complete or skip the current citizen before calling the next token.",
        token: currentServing,
      });
    }

    // Find oldest waiting citizen
    // only from this service.
    const nextToken = await Token.findOne({
      service: serviceId,
      status: "waiting",
    })
      .sort({ createdAt: 1 })
      .populate("service");

    if (!nextToken) {
      return res.json({
        success: true,
        message: "No citizens waiting for this service",
        token: null,
      });
    }

    nextToken.status = "serving";
    nextToken.counter = officerCounter;

    await nextToken.save();

    await createNotificationRecord({
      tokenId: nextToken._id,
      title: "Your turn is ready",
      message: `Token ${nextToken.tokenNumber} is now being served at counter ${officerCounter}.`,
      type: "turn_ready",
      serviceId: serviceId,
    });

    res.json({
      success: true,
      message: "Next citizen called",
      token: nextToken,
    });
  } catch (error) {
    console.error("Call next error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// COMPLETE CURRENT SERVICE
// ==========================================

const completeService = async (req, res) => {
  try {
    const { serviceId } = req.body;

    if (!serviceId) {
      return res.status(400).json({
        success: false,
        message: "Service ID is required",
      });
    }

    const token = await Token.findOne({
      service: serviceId,
      status: "serving",
    });

    if (!token) {
      return res.status(404).json({
        success: false,
        message:
          "No citizen is currently being served for this service",
      });
    }

    token.status = "completed";
    token.servedAt = new Date();

    await token.save();

    await createNotificationRecord({
      tokenId: token._id,
      title: "Service completed",
      message: `Token ${token.tokenNumber} has been completed successfully.`,
      type: "service_update",
      serviceId: serviceId,
    });

    res.json({
      success: true,
      message: "Service completed",
      token,
    });
  } catch (error) {
    console.error("Complete service error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// SKIP CURRENT CITIZEN
// ==========================================

const skipToken = async (req, res) => {
  try {
    const { serviceId } = req.body;

    if (!serviceId) {
      return res.status(400).json({
        success: false,
        message: "Service ID is required",
      });
    }

    const token = await Token.findOne({
      service: serviceId,
      status: "serving",
    });

    if (!token) {
      return res.status(404).json({
        success: false,
        message: "No active token for this service",
      });
    }

    token.status = "skipped";

    await token.save();

    await createNotificationRecord({
      tokenId: token._id,
      title: "Token skipped",
      message: `Token ${token.tokenNumber} was skipped and moved to the next available service.` ,
      type: "service_update",
      serviceId: serviceId,
    });

    res.json({
      success: true,
      message: "Token skipped",
      token,
    });
  } catch (error) {
    console.error("Skip token error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// EXPORTS
// ==========================================

module.exports = {
  getQueueStatus,
  createToken,
  callNext,
  completeService,
  skipToken,
};

const mongoose = require("mongoose");

const GovernmentOffice = require("../models/GovernmentOffice");
const Officer = require("../models/Officer");
const Token = require("../models/Token");

// ============================================================
// HELPER
// ============================================================

const getId = (value) => {
  if (!value) return null;

  // ObjectId itself
  if (typeof value === "object") {
    if (value._id) {
      return String(value._id);
    }

    if (value.id) {
      return String(value.id);
    }

    return null;
  }

  const stringValue = String(value).trim();

  // Prevent MongoDB from receiving "[object Object]"
  if (
    !stringValue ||
    stringValue === "[object Object]" ||
    stringValue === "undefined" ||
    stringValue === "null"
  ) {
    return null;
  }

  return stringValue;
};

const isValidObjectId = (value) =>
  !!value && mongoose.Types.ObjectId.isValid(String(value));

const sendError = (res, status, message, error = null) => {
  console.error(message, error?.message || "");

  return res.status(status).json({
    success: false,
    message,
  });
};

// ============================================================
// GET ALL GOVERNMENT OFFICES
// ============================================================

const getGovernmentOffices = async (req, res) => {
  try {
    const offices = await GovernmentOffice.find({
      available: true,
    }).sort({ name: 1 });

    return res.json({
      success: true,
      offices,
    });
  } catch (error) {
    return sendError(
      res,
      500,
      "Unable to load government offices",
      error
    );
  }
};
// ============================================================
// GET OFFICE OFFICERS
// ============================================================

const getOfficeOfficers = async (req, res) => {
  try {
    const officeId =
      getId(req.params.id) ||
      getId(req.params.officeId) ||
      getId(req.query.officeId);

    if (!officeId) {
      return sendError(
        res,
        400,
        "Government office ID is required"
      );
    }

    const office =
      await GovernmentOffice.findById(officeId);

    if (!office) {
      return sendError(
        res,
        404,
        "Government office not found"
      );
    }

    const officers = await Officer.find({
      governmentOffice: officeId,
    }).sort({
      counter: 1,
      name: 1,
    });

    const officerData = officers.map((officer) => ({
      ...officer.toObject(),
      available: officer.status === "Available",
    }));

    return res.json({
      success: true,
      office,
      officers: officerData,
    });
  } catch (error) {
    return sendError(
      res,
      500,
      "Unable to load office officers",
      error
    );
  }
};

// ============================================================
// GET OFFICERS FOR A GOVERNMENT OFFICE
// ============================================================
const getOfficeQueueStatus = async (req, res) => {
  try {
    // ========================================================
    // DETERMINE OFFICE ID
    // ========================================================

    let officeId =
      getId(req.query?.officeId) ||
      getId(req.query?.governmentOffice) ||
      getId(req.query?.id);

    // --------------------------------------------------------
    // If tokenId is provided, get office from token
    // --------------------------------------------------------

    const tokenId = getId(req.query?.tokenId);

    if (!officeId && tokenId && isValidObjectId(tokenId)) {
      const token = await Token.findById(tokenId)
        .select("governmentOffice");

      if (token?.governmentOffice) {
        officeId = getId(token.governmentOffice);
      }
    }

    // --------------------------------------------------------
    // Government office staff
    // --------------------------------------------------------

    if (!officeId && req.user?.officeId) {
      officeId = getId(req.user.officeId);
    }

    // --------------------------------------------------------
    // Validate ID
    // --------------------------------------------------------

    if (!officeId) {
      return sendError(
        res,
        400,
        "Government office ID is required"
      );
    }

    // --------------------------------------------------------
    // Make sure ID is a valid MongoDB ObjectId
    // --------------------------------------------------------

    if (!mongoose.Types.ObjectId.isValid(officeId)) {
      return sendError(
        res,
        400,
        "Invalid government office ID"
      );
    }

    // ========================================================
    // FIND OFFICE
    // ========================================================

    const office = await GovernmentOffice.findById(
      officeId
    );

    if (!office) {
      return sendError(
        res,
        404,
        "Government office not found"
      );
    }

    // ========================================================
    // GET OFFICERS
    // ========================================================

    const officers = await Officer.find({
      governmentOffice: officeId,
    }).sort({
      counter: 1,
      name: 1,
    });

    // ========================================================
    // GET ACTIVE OFFICE QUEUE
    // ========================================================

    const queue = await Token.find({
      governmentOffice: officeId,
      tokenType: "office",
      status: {
        $in: [
          "waiting",
          "serving",
        ],
      },
    })
      .populate("officer")
      .populate("service")
      .populate("user")
      .sort({
        createdAt: 1,
      });

    // ========================================================
    // SERVING TOKENS
    // ========================================================

    const servingTokens = queue.filter(
      (token) =>
        token.status === "serving"
    );

    // ========================================================
    // WAITING TOKENS
    // ========================================================

    const waitingTokens = queue.filter(
      (token) =>
        token.status === "waiting"
    );

    // ========================================================
    // CURRENT TOKEN
    // ========================================================

    const currentToken =
      servingTokens.length > 0
        ? servingTokens[0]
        : null;

    // ========================================================
    // TODAY'S COMPLETED / SKIPPED COUNTS
    // ========================================================

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const [completedToday, skippedToday] =
      await Promise.all([
        Token.countDocuments({
          governmentOffice: officeId,
          tokenType: "office",
          status: "completed",
          updatedAt: { $gte: startOfDay },
        }),
        Token.countDocuments({
          governmentOffice: officeId,
          tokenType: "office",
          status: "skipped",
          updatedAt: { $gte: startOfDay },
        }),
      ]);

    // ========================================================
    // OFFICER QUEUE INFORMATION
    // ========================================================

    const officerQueue = officers.map(
      (officer) => {
        const officerId = String(
          officer._id
        );

        const officerWaitingTokens =
          waitingTokens.filter(
            (token) =>
              token.officer &&
              String(
                getId(token.officer)
              ) === officerId
          );

        const officerServingToken =
          servingTokens.find(
            (token) =>
              token.officer &&
              String(
                getId(token.officer)
              ) === officerId
          ) || null;

        return {
          ...officer.toObject(),

          waitingCount:
            officerWaitingTokens.length,

          available:
            officer.status === "Available",

          currentToken:
            officerServingToken,
        };
      }
    );

    // ========================================================
    // RETURN QUEUE
    // ========================================================

    return res.json({
      success: true,

      office,

      officers: officerQueue,

      queue,

      waitingQueue:
        waitingTokens,

      servingQueue:
        servingTokens,

      currentToken,

      totalWaiting:
        waitingTokens.length,

      totalServing:
        servingTokens.length,

      completedToday,
      skippedToday,

      averageServiceTime:
        officers.length > 0
          ? Math.round(
              officers.reduce(
                (sum, officer) =>
                  sum +
                  Number(
                    officer.averageServiceTime ||
                      15
                  ),
                0
              ) /
                officers.length
            )
          : 15,
    });
  } catch (error) {
    console.error(
      "Unable to load office queue:",
      error
    );

    return sendError(
      res,
      500,
      "Unable to load office queue",
      error
    );
  }
};

// ============================================================
// UPDATE OFFICER ATTENDANCE
// ============================================================

const updateOfficerAttendance = async (req, res) => {
  try {
    const { id, officerId } = req.params;

    const {
      attendanceStatus,
      isOnBreak,
      breakReason,
    } = req.body;

    const officer = await Officer.findOne({
      _id: officerId,
      governmentOffice: id,
    });

    if (!officer) {
      return sendError(
        res,
        404,
        "Officer not found in this government office"
      );
    }

    if (attendanceStatus) {
      officer.attendanceStatus = attendanceStatus;
    }

    if (typeof isOnBreak === "boolean") {
      officer.isOnBreak = isOnBreak;
    }

    if (breakReason !== undefined) {
      officer.breakReason = breakReason;
    }

    if (
      attendanceStatus === "Present" &&
      !isOnBreak
    ) {
      officer.lastCheckInAt = new Date();
      officer.lastBreakEndedAt = new Date();
    }

    if (isOnBreak) {
      officer.lastBreakStartedAt = new Date();
    }

    await officer.save();

    return res.json({
      success: true,
      message: "Officer attendance updated",
      officer,
    });
  } catch (error) {
    return sendError(
      res,
      500,
      "Unable to update officer attendance",
      error
    );
  }
};

// ============================================================
// CREATE GOVERNMENT OFFICE TOKEN
// ============================================================
//
// IMPORTANT:
// USER is allowed to create a token.
// The token is stored in the SAME Token collection that
// officers use.
//
// This is what connects:
// USER SIDE <----> SAME QUEUE <----> OFFICER SIDE
// ============================================================

const createOfficeToken = async (req, res) => {
  try {
    const {
      governmentOffice,
      officeId,
      service,
      serviceId,
      citizenName,
      phone,
      problem,
      purpose,
      expectedTime,
      source = "online",
      officer,
      officerId,
    } = req.body;

    const requestedOfficeId =
      getId(governmentOffice) ||
      getId(officeId);

    if (!requestedOfficeId) {
      return sendError(
        res,
        400,
        "Government office is required"
      );
    }

    if (!isValidObjectId(requestedOfficeId)) {
      return sendError(
        res,
        400,
        "Invalid government office ID"
      );
    }

    const office = await GovernmentOffice.findById(
      requestedOfficeId
    );

    if (!office) {
      return sendError(
        res,
        404,
        "Government office not found"
      );
    }

    if (!office.available) {
      return sendError(
        res,
        400,
        "Government office is currently unavailable"
      );
    }

    if (!citizenName) {
      return sendError(
        res,
        400,
        "Citizen name is required"
      );
    }

    // --------------------------------------------------------
    // FIND LAST OFFICE TOKEN
    // --------------------------------------------------------

    const lastToken = await Token.findOne({
      governmentOffice: requestedOfficeId,
      tokenType: "office",
    }).sort({
      createdAt: -1,
    });

    let nextNumber = 1;

    if (lastToken?.tokenNumber) {
      const match =
        String(lastToken.tokenNumber).match(/\d+/);

      if (match) {
        nextNumber =
          parseInt(match[0], 10) + 1;
      }
    }

    const tokenNumber = `G${String(
      nextNumber
    ).padStart(3, "0")}`;

    // --------------------------------------------------------
    // OPTIONAL OFFICER
    // --------------------------------------------------------

    let assignedOfficer = null;

    const requestedOfficer =
      getId(officer) || getId(officerId);

    if (requestedOfficer) {
      const officerRecord = await Officer.findOne({
        _id: requestedOfficer,
        governmentOffice: requestedOfficeId,
      });

      if (!officerRecord) {
        return sendError(
          res,
          400,
          "Selected officer does not belong to this office"
        );
      }

      assignedOfficer = officerRecord._id;
    }

    // --------------------------------------------------------
    // CREATE TOKEN
    // --------------------------------------------------------

    const token = await Token.create({
      tokenNumber,

      tokenType: "office",

      source:
        source === "offline"
          ? "offline"
          : "online",

      governmentOffice:
        requestedOfficeId,

      user: req.user?._id ||
        req.user?.userId ||
        null,

      service:
        getId(service) ||
        getId(serviceId) ||
        null,

      officer: assignedOfficer,

      citizenName,

      phone: phone || "",

      problem:
        problem ||
        purpose ||
        "",

      expectedTime:
        expectedTime || "",

      status: "waiting",

      counter: null,

      createdAt: new Date(),
    });

    const populatedToken =
      await Token.findById(token._id)
        .populate("governmentOffice")
        .populate("officer")
        .populate("service")
        .populate("user");

    return res.status(201).json({
      success: true,
      message:
        "Government office appointment booked successfully",
      token: populatedToken,
    });
  } catch (error) {
    return sendError(
      res,
      500,
      "Unable to create government office token",
      error
    );
  }
};


// ============================================================
// GET CITIZEN'S OWN GOVERNMENT OFFICE QUEUE
// ============================================================

const getCitizenOfficeQueue = async (req, res) => {
  try {
    const userId =
      req.user?._id ||
      req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User authentication required",
      });
    }

    // Find the citizen's active office token
    const myToken = await Token.findOne({
      user: userId,
      tokenType: "office",
      status: {
        $in: ["waiting", "serving"],
      },
    })
      .sort({ createdAt: -1 })
      .populate("governmentOffice")
      .populate("officer");

    // Citizen has no active token
    if (!myToken) {
      return res.json({
        success: true,
        hasToken: false,
        data: {
          myToken: null,
          currentServing: null,
          peopleAhead: 0,
          estimatedTime: 0,
          counter: null,
        },
      });
    }

    const officeId = myToken.governmentOffice?._id;

    if (!officeId) {
      return res.status(400).json({
        success: false,
        message:
          "Government office is not assigned to this token",
      });
    }

    // --------------------------------------------------------
    // CURRENTLY SERVING
    // --------------------------------------------------------

    const currentServing = await Token.findOne({
      governmentOffice: officeId,
      tokenType: "office",
      status: "serving",
    })
      .sort({ startedAt: -1 })
      .populate("officer");

    // --------------------------------------------------------
    // PEOPLE AHEAD OF THIS CITIZEN
    // --------------------------------------------------------

    const peopleAhead = await Token.countDocuments({
      governmentOffice: officeId,
      tokenType: "office",
      status: "waiting",
      createdAt: {
        $lt: myToken.createdAt,
      },
    });

    // --------------------------------------------------------
    // ACTIVE OFFICERS
    // --------------------------------------------------------

    const officers = await Officer.find({
      governmentOffice: officeId,
      attendanceStatus: "Present",
      isOnBreak: false,
      status: {
        $ne: "Offline",
      },
    });

    // --------------------------------------------------------
    // AVERAGE SERVICE TIME
    // --------------------------------------------------------

    let averageServiceTime = 15;

    if (officers.length > 0) {
      const totalServiceTime =
        officers.reduce(
          (sum, officer) =>
            sum +
            Number(
              officer.averageServiceTime || 15
            ),
          0
        );

      averageServiceTime =
        totalServiceTime / officers.length;
    }

    const estimatedTime = Math.max(
      0,
      Math.ceil(
        peopleAhead * averageServiceTime
      )
    );

    // --------------------------------------------------------
    // SEND RESPONSE
    // --------------------------------------------------------

    return res.json({
      success: true,
      hasToken: true,

      data: {
        myToken: {
          id: myToken._id,
          tokenNumber: myToken.tokenNumber,
          status: myToken.status,
          counter: myToken.counter,
          citizenName: myToken.citizenName,
          createdAt: myToken.createdAt,
          startedAt: myToken.startedAt,
          servedAt: myToken.servedAt,
          officer: myToken.officer || null,
        },

        currentServing: currentServing
          ? {
              tokenNumber:
                currentServing.tokenNumber,
              counter:
                currentServing.counter,
              status:
                currentServing.status,
              officer:
                currentServing.officer || null,
            }
          : null,

        peopleAhead,

        estimatedTime,

        counter:
          myToken.counter ||
          currentServing?.counter ||
          null,

        office:
          myToken.governmentOffice,
      },
    });
  } catch (error) {
    console.error(
      "getCitizenOfficeQueue error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to load citizen office queue",
    });
  }
};

// ============================================================
// CALL NEXT OFFICE TOKEN
// ============================================================

const callNextOfficeToken = async (
  req,
  res
) => {
  try {
    const {
      officeId,
      governmentOffice,
      officerId,
      counter,
    } = req.body;

    const requestedOfficeId =
      getId(governmentOffice) ||
      getId(officeId) ||
      getId(req.user?.officeId);

    if (!requestedOfficeId) {
      return sendError(
        res,
        400,
        "Government office ID is required"
      );
    }

    // Officer can be supplied by the dashboard.
    // If it is not supplied, automatically use the first available
    // officer in this office. This keeps the officer dashboard simple
    // while still assigning every citizen to a real MongoDB officer.
    let officer = null;

    if (officerId) {
      if (!isValidObjectId(officerId)) {
        return sendError(
          res,
          400,
          "Invalid officer ID"
        );
      }

      officer = await Officer.findOne({
        _id: getId(officerId),
        governmentOffice: requestedOfficeId,
      });
    } else {
      officer = await Officer.findOne({
        governmentOffice: requestedOfficeId,
        status: { $ne: "Offline" },
      }).sort({ counter: 1, name: 1 });
    }

    if (!officer) {
      return sendError(
        res,
        404,
        "No officer is available for this government office"
      );
    }

    // --------------------------------------------------------
    // CHECK WHETHER OFFICER IS ALREADY SERVING
    // --------------------------------------------------------

    const existingServing =
      await Token.findOne({
        governmentOffice:
          requestedOfficeId,

        officer: officer._id,

        status: "serving",
      });

    if (existingServing) {
      return sendError(
        res,
        400,
        `Officer is already serving ${existingServing.tokenNumber}`
      );
    }

    // --------------------------------------------------------
    // FIND NEXT WAITING TOKEN
    //
    // If tokens are assigned to this officer, prefer those.
    // Otherwise take the oldest office token.
    // --------------------------------------------------------

    let nextToken =
      await Token.findOne({
        governmentOffice:
          requestedOfficeId,

        officer: officer._id,

        status: "waiting",

        tokenType: "office",
      }).sort({
        createdAt: 1,
      });

    if (!nextToken) {
      nextToken =
        await Token.findOne({
          governmentOffice:
            requestedOfficeId,

          status: "waiting",

          tokenType: "office",
        }).sort({
          createdAt: 1,
        });
    }

    if (!nextToken) {
      return res.status(404).json({
        success: false,
        message:
          "No waiting citizen token",
      });
    }

    // --------------------------------------------------------
    // ASSIGN TOKEN TO OFFICER
    // --------------------------------------------------------

    nextToken.officer =
      officer._id;

    nextToken.status =
      "serving";

    nextToken.counter =
      counter ||
      officer.counter ||
      1;

    nextToken.startedAt =
      new Date();

    // servedAt is set only when the service is completed/skipped.

    await nextToken.save();

    // --------------------------------------------------------
    // OFFICER BUSY
    // --------------------------------------------------------

    officer.status = "Busy";

    await officer.save();

    const populatedToken =
      await Token.findById(
        nextToken._id
      )
        .populate("governmentOffice")
        .populate("officer")
        .populate("service")
        .populate("user");

    return res.json({
      success: true,

      message:
        `Now serving ${nextToken.tokenNumber}`,

      token: populatedToken,

      currentToken:
        populatedToken,
    });
  } catch (error) {
    return sendError(
      res,
      500,
      "Unable to call next office token",
      error
    );
  }
};

// ============================================================
// COMPLETE OFFICE TOKEN
// ============================================================

const completeOfficeToken = async (
  req,
  res
) => {
  try {
    const {
      tokenId,
      officerId,
    } = req.body;

    if (!tokenId) {
      return sendError(
        res,
        400,
        "Token ID is required"
      );
    }

    if (!isValidObjectId(tokenId)) {
      return sendError(
        res,
        400,
        "Invalid token ID"
      );
    }

    const token =
      await Token.findOne({
        _id: tokenId,

        tokenType: "office",

        status: "serving",
      });

    if (!token) {
      return sendError(
        res,
        404,
        "Active office token not found"
      );
    }

    if (
      officerId &&
      token.officer &&
      String(
        getId(token.officer)
      ) !==
        String(getId(officerId))
    ) {
      return sendError(
        res,
        403,
        "This token is assigned to another officer"
      );
    }

    token.status =
      "completed";

    token.servedAt =
      new Date();

    await token.save();

    // --------------------------------------------------------
    // MAKE OFFICER AVAILABLE
    // --------------------------------------------------------

    if (token.officer) {
      await Officer.findByIdAndUpdate(
        token.officer,
        {
          status: "Available",
        }
      );
    }

    const completedToken =
      await Token.findById(
        token._id
      )
        .populate("governmentOffice")
        .populate("officer")
        .populate("user");

    return res.json({
      success: true,

      message:
        "Citizen token completed",

      token:
        completedToken,
    });
  } catch (error) {
    return sendError(
      res,
      500,
      "Unable to complete office token",
      error
    );
  }
};

// ============================================================
// SKIP OFFICE TOKEN
// ============================================================

const skipOfficeToken = async (
  req,
  res
) => {
  try {
    const {
      tokenId,
      officerId,
    } = req.body;

    if (!tokenId) {
      return sendError(
        res,
        400,
        "Token ID is required"
      );
    }

    if (!isValidObjectId(tokenId)) {
      return sendError(
        res,
        400,
        "Invalid token ID"
      );
    }

    const token =
      await Token.findOne({
        _id: tokenId,

        tokenType: "office",

        status: "serving",
      });

    if (!token) {
      return sendError(
        res,
        404,
        "Active citizen token not found"
      );
    }

    if (
      officerId &&
      token.officer &&
      String(
        getId(token.officer)
      ) !==
        String(getId(officerId))
    ) {
      return sendError(
        res,
        403,
        "This token is assigned to another officer"
      );
    }

    token.status =
      "skipped";

    token.servedAt =
      new Date();

    await token.save();

    if (token.officer) {
      await Officer.findByIdAndUpdate(
        token.officer,
        {
          status: "Available",
        }
      );
    }

    const skippedToken =
      await Token.findById(
        token._id
      )
        .populate("governmentOffice")
        .populate("officer")
        .populate("user");

    return res.json({
      success: true,

      message:
        "Citizen token skipped",

      token:
        skippedToken,
    });
  } catch (error) {
    return sendError(
      res,
      500,
      "Unable to skip office token",
      error
    );
  }
};

// ============================================================
// EXPORT
// ============================================================

module.exports = {
  getGovernmentOffices,
  getOfficeOfficers,
  updateOfficerAttendance,
  createOfficeToken,

  getOfficeQueueStatus,
  getCitizenOfficeQueue,

  callNextOfficeToken,
  completeOfficeToken,
  skipOfficeToken,
};
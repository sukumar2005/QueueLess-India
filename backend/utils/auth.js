const jwt = require("jsonwebtoken");
const User = require("../models/User");

const JWT_SECRET =
  process.env.JWT_SECRET || "queueless-india-dev-secret";

// ======================================================
// GENERATE JWT TOKEN
// ======================================================

const generateToken = (user) => {
  return jwt.sign(
    {
      userId: user._id,
      role: user.role,
      hospitalId: user.hospitalId || null,
      officeId: user.officeId || null,
      username: user.username,
    },
    JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
};

// ======================================================
// AUTHENTICATION MIDDLEWARE
// ======================================================

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";

    const token = authHeader.startsWith("Bearer ")
      ? authHeader.replace("Bearer ", "")
      : null;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await User.findById(decoded.userId).select("-password");

    if (!user || !user.active) {
      return res.status(401).json({
        success: false,
        message: "Invalid or inactive user",
      });
    }

    // Attach authenticated user to request
    req.user = {
      ...user.toObject(),

      userId: user._id,

      role: decoded.role || user.role,

      hospitalId:
        decoded.hospitalId ||
        user.hospitalId ||
        null,

      officeId:
        decoded.officeId ||
        user.officeId ||
        null,

      username:
        decoded.username ||
        user.username,
    };

    next();
  } catch (error) {
    console.error("Authentication error:", error.message);

    return res.status(401).json({
      success: false,
      message: "Invalid session",
    });
  }
};

// ======================================================
// ROLE MIDDLEWARE
// ======================================================

const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Access denied for this role",
        currentRole: req.user.role,
        allowedRoles,
      });
    }

    next();
  };
};

// ======================================================
// HOSPITAL ACCESS
// ======================================================

const requireHospitalAccess = async (req, res, next) => {
  try {
    // IMPORTANT:
    // authMiddleware must run before this middleware.
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const user = req.user;

    // --------------------------------------------------
    // ADMIN
    // --------------------------------------------------

    if (user.role === "ADMIN") {
      return next();
    }

    // --------------------------------------------------
    // HOSPITAL STAFF
    // --------------------------------------------------

    if (user.role !== "HOSPITAL") {
      return res.status(403).json({
        success: false,
        message: "Hospital access required",
      });
    }

    // --------------------------------------------------
    // USER MUST HAVE HOSPITAL ID
    // --------------------------------------------------

    if (!user.hospitalId) {
      return res.status(400).json({
        success: false,
        message: "Hospital ID is not assigned to this user",
      });
    }

    // --------------------------------------------------
    // FIND REQUESTED HOSPITAL
    // --------------------------------------------------

    const hospitalId =
      req.params?.hospitalId ||
      req.params?.id ||
      req.body?.hospitalId ||
      req.query?.hospitalId ||
      req.query?.id;

    // --------------------------------------------------
    // VERIFY HOSPITAL OWNERSHIP
    // --------------------------------------------------

    if (
      hospitalId &&
      String(user.hospitalId) !== String(hospitalId)
    ) {
      return res.status(403).json({
        success: false,
        message: "You can access only your hospital",
      });
    }

    // Make hospital ID available to controllers
    req.user.hospitalId = user.hospitalId;

    next();
  } catch (error) {
    console.error(
      "requireHospitalAccess error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Hospital access validation failed",
    });
  }
};

// ======================================================
// GOVERNMENT OFFICE ACCESS
// ======================================================

const requireOfficeAccess = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const user = req.user;

    // ADMIN can access any office
    if (user.role === "ADMIN") {
      return next();
    }

    // Only government office users
    if (user.role !== "GOVERNMENT OFFICE") {
      return res.status(403).json({
        success: false,
        message: "Government office access required",
      });
    }

    // User must have office ID
    if (!user.officeId) {
      return res.status(400).json({
        success: false,
        message: "Office ID is not assigned to this user",
      });
    }

    const officeId =
      req.params?.officeId ||
      req.params?.id ||
      req.body?.officeId ||
      req.query?.officeId ||
      req.query?.id;

    if (
      officeId &&
      String(user.officeId) !== String(officeId)
    ) {
      return res.status(403).json({
        success: false,
        message: "You can access only your office",
      });
    }

    req.user.officeId = user.officeId;

    next();
  } catch (error) {
    console.error(
      "requireOfficeAccess error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Office access validation failed",
    });
  }
};

// ======================================================
// EXPORT EVERYTHING
// ======================================================

module.exports = {
  generateToken,
  authMiddleware,
  requireRole,
  requireHospitalAccess,
  requireOfficeAccess,
};
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const JWT_SECRET =
  process.env.JWT_SECRET || "queueless-india-dev-secret";

// ======================================================
// ROLE NORMALIZER
// ======================================================

const normalizeRole = (role) => {
  return String(role || "")
    .trim()
    .toUpperCase();
};

// ======================================================
// GENERATE JWT TOKEN
// ======================================================

const generateToken = (user) => {
  return jwt.sign(
    {
      userId: user._id,
      role: normalizeRole(user.role),
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
      ? authHeader.replace("Bearer ", "").trim()
      : null;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await User.findById(decoded.userId).select(
      "-password"
    );

    if (!user || !user.active) {
      return res.status(401).json({
        success: false,
        message: "Invalid or inactive user",
      });
    }

    // ==================================================
    // NORMALIZE ROLE
    // ==================================================

    const role = normalizeRole(
      decoded.role || user.role
    );

    // ==================================================
    // ATTACH USER TO REQUEST
    // ==================================================

    req.user = {
      ...user.toObject(),

      userId: user._id,

      role,

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
    console.error(
      "Authentication error:",
      error.message
    );

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
  const normalizedAllowedRoles =
    allowedRoles.map(normalizeRole);

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const currentRole = normalizeRole(
      req.user.role
    );

    if (
      !normalizedAllowedRoles.includes(currentRole)
    ) {
      console.log("ROLE ACCESS DENIED:", {
        currentRole,
        allowedRoles: normalizedAllowedRoles,
        username: req.user.username,
      });

      return res.status(403).json({
        success: false,
        message: "Access denied for this role",
        currentRole,
        allowedRoles: normalizedAllowedRoles,
      });
    }

    // Keep normalized role
    req.user.role = currentRole;

    next();
  };
};

// ======================================================
// HOSPITAL ACCESS
// ======================================================

const requireHospitalAccess = async (
  req,
  res,
  next
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const user = req.user;
    const role = normalizeRole(user.role);

    // --------------------------------------------------
    // ADMIN
    // --------------------------------------------------

    if (role === "ADMIN") {
      return next();
    }

    // --------------------------------------------------
    // HOSPITAL STAFF
    // --------------------------------------------------

    if (role !== "HOSPITAL") {
      return res.status(403).json({
        success: false,
        message: "Hospital access required",
      });
    }

    // --------------------------------------------------
    // HOSPITAL ID
    // --------------------------------------------------

    if (!user.hospitalId) {
      return res.status(400).json({
        success: false,
        message:
          "Hospital ID is not assigned to this user",
      });
    }

    // --------------------------------------------------
    // REQUESTED HOSPITAL
    // --------------------------------------------------

    const hospitalId =
      req.params?.hospitalId ||
      req.params?.id ||
      req.body?.hospitalId ||
      req.query?.hospitalId ||
      req.query?.id;

    // --------------------------------------------------
    // VERIFY ACCESS
    // --------------------------------------------------

    if (
      hospitalId &&
      String(user.hospitalId) !==
        String(hospitalId)
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You can access only your hospital",
      });
    }

    req.user.hospitalId = user.hospitalId;

    next();
  } catch (error) {
    console.error(
      "requireHospitalAccess error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Hospital access validation failed",
    });
  }
};

// ======================================================
// GOVERNMENT OFFICE ACCESS
// ======================================================

const requireOfficeAccess = async (
  req,
  res,
  next
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const user = req.user;
    const role = normalizeRole(user.role);

    console.log("OFFICE ACCESS CHECK:", {
      username: user.username,
      role,
      officeId: user.officeId,
      requestedOfficeId:
        req.params?.officeId ||
        req.params?.id ||
        req.body?.officeId ||
        req.query?.officeId ||
        req.query?.id,
    });

    // --------------------------------------------------
    // ADMIN
    // --------------------------------------------------

    if (role === "ADMIN") {
      return next();
    }

    // --------------------------------------------------
    // GOVERNMENT OFFICE
    // --------------------------------------------------

    if (role !== "GOVERNMENT OFFICE") {
      return res.status(403).json({
        success: false,
        message:
          "Government office access required",
        currentRole: role,
      });
    }

    // --------------------------------------------------
    // OFFICE ID REQUIRED
    // --------------------------------------------------

    if (!user.officeId) {
      return res.status(400).json({
        success: false,
        message:
          "Office ID is not assigned to this user",
      });
    }

    // --------------------------------------------------
    // REQUESTED OFFICE
    // --------------------------------------------------

    const officeId =
      req.params?.officeId ||
      req.params?.id ||
      req.body?.officeId ||
      req.query?.officeId ||
      req.query?.id;

    // --------------------------------------------------
    // VERIFY OFFICE ACCESS
    // --------------------------------------------------

    if (
      officeId &&
      String(user.officeId) !==
        String(officeId)
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You can access only your office",
        userOfficeId: String(user.officeId),
        requestedOfficeId: String(officeId),
      });
    }

    // --------------------------------------------------
    // MAKE OFFICE ID AVAILABLE
    // --------------------------------------------------

    req.user.officeId = user.officeId;

    next();
  } catch (error) {
    console.error(
      "requireOfficeAccess error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Office access validation failed",
    });
  }
};

// ======================================================
// EXPORT
// ======================================================

module.exports = {
  generateToken,
  authMiddleware,
  requireRole,
  requireHospitalAccess,
  requireOfficeAccess,
};
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const JWT_SECRET = process.env.JWT_SECRET || "queueless-india-dev-secret";

const generateToken = (user) =>
  jwt.sign(
    {
      userId: user._id,
      role: user.role,
      hospitalId: user.hospitalId || null,
      officeId: user.officeId || null,
      username: user.username,
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );

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

    req.user = {
      ...user.toObject(),
      role: decoded.role || user.role,
      hospitalId: decoded.hospitalId || user.hospitalId || null,
      officeId: decoded.officeId || user.officeId || null,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid session",
    });
  }
};

const requireRole = (...allowedRoles) => (req, res, next) => {
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
    });
  }

  next();
};

const requireHospitalAccess = async (req, res, next) => {
  const user = req.user;

  if (user.role === "ADMIN") {
    return next();
  }

  if (user.role !== "HOSPITAL") {
    return res.status(403).json({
      success: false,
      message: "Hospital access required",
    });
  }

  const hospitalId =
    req.params.hospitalId ||
    req.params.id ||
    req.body.hospitalId ||
    req.query.hospitalId ||
    req.query.id;

  if (hospitalId && String(user.hospitalId) !== String(hospitalId)) {
    return res.status(403).json({
      success: false,
      message: "You can access only your hospital",
    });
  }

  req.user.hospitalId = user.hospitalId;
  next();
};

const requireOfficeAccess = async (req, res, next) => {
  const user = req.user;

  if (user.role === "ADMIN") {
    return next();
  }

  if (user.role !== "GOVERNMENT OFFICE") {
    return res.status(403).json({
      success: false,
      message: "Government office access required",
    });
  }

  const officeId =
    req.params.officeId ||
    req.params.id ||
    req.body.officeId ||
    req.query.officeId ||
    req.query.id;

  if (officeId && String(user.officeId) !== String(officeId)) {
    return res.status(403).json({
      success: false,
      message: "You can access only your office",
    });
  }

  req.user.officeId = user.officeId;
  next();
};

module.exports = {
  generateToken,
  authMiddleware,
  requireRole,
  requireHospitalAccess,
  requireOfficeAccess,
};

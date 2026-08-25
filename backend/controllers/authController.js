const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Hospital = require("../models/Hospital");
const GovernmentOffice = require("../models/GovernmentOffice");
const { generateToken } = require("../utils/auth");

// ======================================================
// LOGIN
// ======================================================

const login = async (req, res) => {
  try {
    const { username, password, role } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Username and password are required",
      });
    }

    // Find account using username
    const user = await User.findOne({
      username: username.trim().toLowerCase(),
    });

    if (!user || !user.active) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Compare password with hashed password
    const isPasswordValid = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Check selected role
    const requestedRole = role?.trim().toUpperCase();
    const actualRole = user.role?.trim().toUpperCase();

    if (requestedRole && requestedRole !== actualRole) {
      return res.status(403).json({
        success: false,
        message: "Role mismatch",
      });
    }

    // Generate JWT token
    const token = generateToken(user);

    return res.json({
      success: true,
      message: "Login successful",

      token,

      user: {
        _id: user._id,
        name: user.name,
        username: user.username,
        role: user.role,
        hospitalId: user.hospitalId || null,
        officeId: user.officeId || null,
      },
    });

  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ======================================================
// USER REGISTRATION
// ======================================================

const registerUser = async (req, res) => {
  try {
    const {
      name,
      username,
      password,
    } = req.body;

    // Validate fields
    if (!name || !username || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, username and password are required",
      });
    }

    // Password validation
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must contain at least 6 characters",
      });
    }

    // Normalize username
    const normalizedUsername = username
      .trim()
      .toLowerCase();

    // Check username already exists
    const existingUser = await User.findOne({
      username: normalizedUsername,
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Username already exists",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(
      password,
      10
    );

    // Create USER account
    const user = await User.create({
      name: name.trim(),
      username: normalizedUsername,
      password: hashedPassword,

      // Registration page creates USER only
      role: "USER",

      hospitalId: null,
      officeId: null,

      active: true,
    });

    return res.status(201).json({
      success: true,
      message: "User account created successfully",

      user: {
        _id: user._id,
        name: user.name,
        username: user.username,
        role: user.role,
      },
    });

  } catch (error) {
    console.error("User registration error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ======================================================
// CREATE STAFF ACCOUNT
// ADMIN ONLY
// ======================================================

const createStaffAccount = async (req, res) => {
  try {
    const {
      name,
      username,
      password,
      role,
      hospitalId,
      officeId,
    } = req.body;

    // Validate required fields
    if (!name || !username || !password || !role) {
      return res.status(400).json({
        success: false,
        message:
          "Name, username, password and role are required",
      });
    }

    // Normalize values
    const normalizedUsername = username
      .trim()
      .toLowerCase();

    const normalizedRole = role
      .trim()
      .toUpperCase();

    // Allowed roles
    const allowedRoles = [
      "USER",
      "HOSPITAL",
      "GOVERNMENT OFFICE",
      "ADMIN",
    ];

    if (!allowedRoles.includes(normalizedRole)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role",
      });
    }

    // ==================================================
    // HOSPITAL ACCOUNT VALIDATION
    // ==================================================

    if (normalizedRole === "HOSPITAL") {

      if (!hospitalId) {
        return res.status(400).json({
          success: false,
          message:
            "Hospital ID is required for hospital account",
        });
      }

      const hospital =
        await Hospital.findById(hospitalId);

      if (!hospital) {
        return res.status(404).json({
          success: false,
          message: "Hospital not found",
        });
      }
    }

    // ==================================================
    // GOVERNMENT OFFICE VALIDATION
    // ==================================================

    if (normalizedRole === "GOVERNMENT OFFICE") {

      if (!officeId) {
        return res.status(400).json({
          success: false,
          message:
            "Office ID is required for government office account",
        });
      }

      const office =
        await GovernmentOffice.findById(officeId);

      if (!office) {
        return res.status(404).json({
          success: false,
          message: "Government office not found",
        });
      }
    }

    // ==================================================
    // CHECK USERNAME
    // ==================================================

    const existingUser = await User.findOne({
      username: normalizedUsername,
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Username already exists",
      });
    }

    // ==================================================
    // HASH PASSWORD
    // ==================================================

    const hashedPassword = await bcrypt.hash(
      password,
      10
    );

    // ==================================================
    // CREATE ACCOUNT
    // ==================================================

    const user = await User.create({
      name: name.trim(),

      username: normalizedUsername,

      password: hashedPassword,

      role: normalizedRole,

      hospitalId:
        normalizedRole === "HOSPITAL"
          ? hospitalId
          : null,

      officeId:
        normalizedRole === "GOVERNMENT OFFICE"
          ? officeId
          : null,

      active: true,
    });

    // ==================================================
    // RESPONSE
    // ==================================================

    return res.status(201).json({
      success: true,

      message: "Account created successfully",

      user: {
        _id: user._id,
        name: user.name,
        username: user.username,
        role: user.role,
        hospitalId: user.hospitalId,
        officeId: user.officeId,
      },
    });

  } catch (error) {
    console.error("Create account error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ======================================================
// CREATE ADMIN ACCOUNT
// ======================================================

const seedAdmin = async () => {
  try {

    const adminUsername = "admin";
    const adminPassword = "admin123";

    const existingAdmin =
      await User.findOne({
        username: adminUsername,
      });

    if (existingAdmin) {
      return;
    }

    const hashedPassword =
      await bcrypt.hash(
        adminPassword,
        10
      );

    await User.create({
      name: "System Admin",

      username: adminUsername,

      password: hashedPassword,

      role: "ADMIN",

      hospitalId: null,

      officeId: null,

      active: true,
    });

    console.log("Admin account created");
    console.log("Username: admin");
    console.log("Password: admin123");

  } catch (error) {

    console.error(
      "Admin creation error:",
      error.message
    );
  }
};


// ======================================================
// CREATE DEMO HOSPITAL + GOVERNMENT OFFICE ACCOUNTS
// ======================================================

const createDemoAccounts = async () => {
  try {

    const hospitals =
      await Hospital.find();

    const offices =
      await GovernmentOffice.find();


    // ==================================================
    // HOSPITAL ACCOUNTS
    // ==================================================

    for (const hospital of hospitals) {

      const username =
        `hospital_${hospital._id
          .toString()
          .slice(-6)}`;

      const existing =
        await User.findOne({
          username,
        });

      if (!existing) {

        const password =
          "hospital123";

        const hashedPassword =
          await bcrypt.hash(
            password,
            10
          );

        await User.create({
          name:
            `${hospital.name} Staff`,

          username,

          password: hashedPassword,

          role: "HOSPITAL",

          hospitalId:
            hospital._id,

          officeId: null,

          active: true,
        });

        console.log("");
        console.log(
          "Hospital account created"
        );

        console.log(
          `Hospital: ${hospital.name}`
        );

        console.log(
          `Username: ${username}`
        );

        console.log(
          `Password: ${password}`
        );
      }
    }


    // ==================================================
    // GOVERNMENT OFFICE ACCOUNTS
    // ==================================================

    for (const office of offices) {

      const username =
        `office_${office._id
          .toString()
          .slice(-6)}`;

      const existing =
        await User.findOne({
          username,
        });

      if (!existing) {

        const password =
          "office123";

        const hashedPassword =
          await bcrypt.hash(
            password,
            10
          );

        await User.create({
          name:
            `${office.name} Staff`,

          username,

          password: hashedPassword,

          role:
            "GOVERNMENT OFFICE",

          hospitalId: null,

          officeId:
            office._id,

          active: true,
        });

        console.log("");
        console.log(
          "Government office account created"
        );

        console.log(
          `Office: ${office.name}`
        );

        console.log(
          `Username: ${username}`
        );

        console.log(
          `Password: ${password}`
        );
      }
    }

  } catch (error) {

    console.error(
      "Demo account creation error:",
      error.message
    );
  }
};


// ======================================================
// EXPORT
// ======================================================

module.exports = {
  login,
  registerUser,
  createStaffAccount,
  seedAdmin,
  createDemoAccounts,
};
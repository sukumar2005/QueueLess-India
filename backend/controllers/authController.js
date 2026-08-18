const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Hospital = require("../models/Hospital");
const GovernmentOffice = require("../models/GovernmentOffice");
const { generateToken } = require("../utils/auth");

const login = async (req, res) => {
  try {
    const { username, password, role } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Username and password are required",
      });
    }

    const user = await User.findOne({ username: username.trim().toLowerCase() });

    if (!user || !user.active) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const requestedRole = role || user.role;
    if (requestedRole && requestedRole !== user.role) {
      return res.status(403).json({
        success: false,
        message: "Role mismatch",
      });
    }

    const token = generateToken(user);

    res.json({
      success: true,
      token,
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
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const createStaffAccount = async (req, res) => {
  try {
    const { name, username, password, role, hospitalId, officeId } = req.body;

    if (!name || !username || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "Name, username, password and role are required",
      });
    }

    if (["HOSPITAL", "GOVERNMENT OFFICE"].includes(role)) {
      if (role === "HOSPITAL" && !hospitalId) {
        return res.status(400).json({
          success: false,
          message: "Hospital ID is required for hospital account",
        });
      }

      if (role === "GOVERNMENT OFFICE" && !officeId) {
        return res.status(400).json({
          success: false,
          message: "Office ID is required for government office account",
        });
      }
    }

    const existingUser = await User.findOne({ username: username.trim().toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Username already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      username: username.trim().toLowerCase(),
      password: hashedPassword,
      role,
      hospitalId: role === "HOSPITAL" ? hospitalId : null,
      officeId: role === "GOVERNMENT OFFICE" ? officeId : null,
      active: true,
    });

    res.status(201).json({
      success: true,
      message: "Account created successfully",
      user: {
        _id: user._id,
        name: user.name,
        username: user.username,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const seedAdmin = async () => {
  const adminUsername = "admin";
  const adminPassword = "admin123";

  const existingAdmin = await User.findOne({ username: adminUsername });
  if (existingAdmin) {
    return;
  }

  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  await User.create({
    name: "System Admin",
    username: adminUsername,
    password: hashedPassword,
    role: "ADMIN",
    active: true,
  });
};

const createDemoAccounts = async () => {
  const hospitals = await Hospital.find();
  const offices = await GovernmentOffice.find();

  for (const hospital of hospitals) {
    const username = `hospital_${hospital._id.toString().slice(-6)}`;
    const existing = await User.findOne({ username });
    if (!existing) {
      const hashedPassword = await bcrypt.hash("hospital123", 10);
      await User.create({
        name: `${hospital.name} Staff`,
        username,
        password: hashedPassword,
        role: "HOSPITAL",
        hospitalId: hospital._id,
        active: true,
      });
    }
  }

  for (const office of offices) {
    const username = `office_${office._id.toString().slice(-6)}`;
    const existing = await User.findOne({ username });
    if (!existing) {
      const hashedPassword = await bcrypt.hash("office123", 10);
      await User.create({
        name: `${office.name} Staff`,
        username,
        password: hashedPassword,
        role: "GOVERNMENT OFFICE",
        officeId: office._id,
        active: true,
      });
    }
  }
};

module.exports = {
  login,
  createStaffAccount,
  seedAdmin,
  createDemoAccounts,
};

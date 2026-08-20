const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = require("../config/db");

const Hospital = require("../models/Hospital");
const GovernmentOffice = require("../models/GovernmentOffice");

const {
  createDemoAccounts,
} = require("../controllers/authController");

const seedDemoData = async () => {
  try {
    console.log("========================================");
    console.log("QueueLess India Demo Data Seeder");
    console.log("========================================");

    // Connect to MongoDB
    await connectDB();

    console.log("MongoDB connected");

    // ========================================
    // HOSPITAL DATA
    // ========================================

    const hospitals = [
      {
        name: "Coimbatore Government Hospital",
        state: "Tamil Nadu",
        district: "Coimbatore",
        village: "Coimbatore",
        address: "Trichy Road, Coimbatore",
        latitude: 11.0168,
        longitude: 76.9558,
        available: true,
      },
      {
        name: "Gandhipuram General Hospital",
        state: "Tamil Nadu",
        district: "Coimbatore",
        village: "Gandhipuram",
        address: "100 Feet Road, Gandhipuram, Coimbatore",
        latitude: 11.0168,
        longitude: 76.9674,
        available: true,
      },
      {
        name: "Pollachi Government Hospital",
        state: "Tamil Nadu",
        district: "Coimbatore",
        village: "Pollachi",
        address: "Hospital Road, Pollachi",
        latitude: 10.6581,
        longitude: 77.0081,
        available: true,
      },
    ];

    // ========================================
    // INSERT HOSPITALS
    // ========================================

    for (const hospitalData of hospitals) {
      const existingHospital = await Hospital.findOne({
        name: hospitalData.name,
      });

      if (!existingHospital) {
        await Hospital.create(hospitalData);

        console.log(
          `Hospital created: ${hospitalData.name}`
        );
      } else {
        console.log(
          `Hospital already exists: ${hospitalData.name}`
        );
      }
    }

    // ========================================
    // GOVERNMENT OFFICE DATA
    // ========================================

    const governmentOffices = [
      {
        name: "Coimbatore RTO Office",
        type: "Regional Transport Office",
        state: "Tamil Nadu",
        district: "Coimbatore",
        village: "Coimbatore",
        address: "Dr. Balasundaram Road, Coimbatore",
        available: true,
      },
      {
        name: "Coimbatore Taluk Office",
        type: "Taluk Office",
        state: "Tamil Nadu",
        district: "Coimbatore",
        village: "Coimbatore",
        address: "Collectorate Campus, Coimbatore",
        available: true,
      },
      {
        name: "Pollachi Government Office",
        type: "Revenue Office",
        state: "Tamil Nadu",
        district: "Coimbatore",
        village: "Pollachi",
        address: "Taluk Office Road, Pollachi",
        available: true,
      },
    ];

    // ========================================
    // INSERT GOVERNMENT OFFICES
    // ========================================

    for (const officeData of governmentOffices) {
      const existingOffice = await GovernmentOffice.findOne({
        name: officeData.name,
      });

      if (!existingOffice) {
        await GovernmentOffice.create(officeData);

        console.log(
          `Government office created: ${officeData.name}`
        );
      } else {
        console.log(
          `Government office already exists: ${officeData.name}`
        );
      }
    }

    // ========================================
    // CREATE LOGIN ACCOUNTS
    // ========================================

    console.log("");
    console.log("Creating demo login accounts...");

    await createDemoAccounts();

    console.log("");
    console.log("========================================");
    console.log("DEMO DATA CREATED SUCCESSFULLY");
    console.log("========================================");

    console.log("");
    console.log("ADMIN");
    console.log("Username: admin");
    console.log("Password: admin123");
    console.log("Role: ADMIN");

    console.log("");
    console.log("HOSPITAL ACCOUNTS");
    console.log("Password: hospital123");
    console.log("Role: HOSPITAL");

    console.log("");
    console.log("GOVERNMENT OFFICE ACCOUNTS");
    console.log("Password: office123");
    console.log("Role: GOVERNMENT OFFICE");

    console.log("");
    console.log("Check MongoDB Compass -> users");
    console.log("to see the generated usernames.");

    console.log("========================================");

    await mongoose.connection.close();

    process.exit(0);
  } catch (error) {
    console.error("");
    console.error("========================================");
    console.error("SEED FAILED");
    console.error("========================================");
    console.error(error.message);

    try {
      await mongoose.connection.close();
    } catch {}

    process.exit(1);
  }
};

seedDemoData();
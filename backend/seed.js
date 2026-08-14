const dotenv = require("dotenv");
const mongoose = require("mongoose");

const connectDB = require("./config/db");
const Service = require("./models/Service");

dotenv.config();

const services = [
  {
    name: "Birth Certificate",
    department: "Municipal Administration",
    office: "Municipal Office",
    documents: [
      "Hospital Birth Record",
      "Parent ID Proof",
      "Address Proof",
    ],
    averageTime: 15,
    available: true,
  },

  {
    name: "Income Certificate",
    department: "Revenue Department",
    office: "Taluk Office",
    documents: [
      "Aadhaar Card",
      "Address Proof",
      "Income Proof",
    ],
    averageTime: 20,
    available: true,
  },

  {
    name: "Community Certificate",
    department: "Revenue Department",
    office: "Taluk Office",
    documents: [
      "Aadhaar Card",
      "Address Proof",
      "Parent Community Certificate",
    ],
    averageTime: 20,
    available: true,
  },

  {
    name: "Aadhaar Services",
    department: "UIDAI Services",
    office: "Aadhaar Seva Centre",
    documents: [
      "Aadhaar Card",
      "Identity Proof",
      "Address Proof",
    ],
    averageTime: 15,
    available: true,
  },

  {
    name: "Driving Licence",
    department: "Transport Department",
    office: "RTO Office",
    documents: [
      "Learner Licence",
      "Aadhaar Card",
      "Address Proof",
    ],
    averageTime: 30,
    available: true,
  },

  {
    name: "Property Registration",
    department: "Registration Department",
    office: "Sub-Registrar Office",
    documents: [
      "Sale Deed",
      "Identity Proof",
      "Property Documents",
      "Stamp Duty Receipt",
    ],
    averageTime: 40,
    available: true,
  },
];

const seedDatabase = async () => {
  try {
    await connectDB();

    await Service.deleteMany();

    await Service.insertMany(services);

    console.log("Government services added successfully");

    console.log(`Total services: ${services.length}`);

    await mongoose.connection.close();

    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:");
    console.error(error.message);

    process.exit(1);
  }
};

seedDatabase();
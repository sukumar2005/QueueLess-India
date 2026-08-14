require("dotenv").config();

const mongoose = require("mongoose");
const Service = require("./models/Service");

const services = [
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

const seedServices = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected");

    await Service.deleteMany({});

    const createdServices = await Service.insertMany(services);

    console.log(
      `Successfully inserted ${createdServices.length} services`
    );

    createdServices.forEach((service) => {
      console.log(`${service.name} -> ${service._id}`);
    });

    await mongoose.connection.close();

    console.log("Database connection closed");
    process.exit(0);
  } catch (error) {
    console.error("Seed error:");
    console.error(error.message);

    process.exit(1);
  }
};

seedServices();
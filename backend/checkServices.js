require("dotenv").config();

const mongoose = require("mongoose");
const Service = require("./models/Service");

async function checkServices() {
  try {
    const uri = process.env.MONGO_URI;

    if (!uri) {
      throw new Error("MONGO_URI is missing");
    }

    await mongoose.connect(uri);

    console.log("================================");
    console.log("DATABASE CHECK");
    console.log("================================");

    console.log("Database:", mongoose.connection.name);
    console.log("Host:", mongoose.connection.host);

    const collections = await mongoose.connection.db
      .listCollections()
      .toArray();

    console.log(
      "Collections:",
      collections.map((c) => c.name)
    );

    const count = await Service.countDocuments();

    console.log("Service count:", count);

    const services = await Service.find({})
      .select("name department office")
      .lean();

    console.log("Services:");

    services.forEach((service) => {
      console.log(
        `- ${service.name} | ${service.department} | ${service.office}`
      );
    });

    console.log("================================");

    await mongoose.disconnect();
  } catch (error) {
    console.error("CHECK FAILED:");
    console.error(error.message);
    process.exit(1);
  }
}

checkServices();
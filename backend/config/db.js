const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;

    if (!mongoUri) {
      throw new Error("MONGO_URI is missing");
    }

    const trimmedUri = mongoUri.trim();

    if (
      !trimmedUri.startsWith("mongodb://") &&
      !trimmedUri.startsWith("mongodb+srv://")
    ) {
      throw new Error(
        "MONGO_URI must start with mongodb:// or mongodb+srv://"
      );
    }

    await mongoose.connect(trimmedUri);

    console.log("MongoDB connected successfully");
    console.log("MongoDB database:", mongoose.connection.name);
    console.log("MongoDB host:", mongoose.connection.host);
  } catch (error) {
    console.error("MongoDB connection failed:");
    console.error(error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
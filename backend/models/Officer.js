const mongoose = require("mongoose");

const officerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    department: {
      type: String,
      required: true,
    },

    counter: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: [
        "Available",
        "Busy",
        "Offline",
      ],
      default: "Available",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Officer", officerSchema);
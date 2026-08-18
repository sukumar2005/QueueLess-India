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

    designation: {
      type: String,
    },

    governmentOffice: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "GovernmentOffice",
    },

    counter: {
      type: Number,
      default: 1,
    },

    expectedArrival: {
      type: String,
      default: "",
    },

    currentWaiting: {
      type: Number,
      default: 0,
    },
    attendanceStatus: {
      type: String,
      enum: ["Present", "Absent", "On Break", "Away"],
      default: "Present",
    },
    isOnBreak: {
      type: Boolean,
      default: false,
    },
    workingHoursStart: {
      type: String,
      default: "09:00",
    },
    workingHoursEnd: {
      type: String,
      default: "18:00",
    },
    breakReason: {
      type: String,
      default: "",
    },
    lastCheckInAt: {
      type: Date,
      default: null,
    },
    lastBreakStartedAt: {
      type: Date,
      default: null,
    },
    lastBreakEndedAt: {
      type: Date,
      default: null,
    },
    averageServiceTime: {
      type: Number,
      default: 15,
    },

    purposes: {
      type: [String],
      default: [],
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

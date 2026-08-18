const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    specialization: {
      type: String,
      required: true,
    },
    hospital: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hospital",
      required: true,
    },
    room: {
      type: String,
      required: true,
    },
    available: {
      type: Boolean,
      default: true,
    },
    expectedArrival: {
      type: String,
      default: "",
    },
    currentPatients: {
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
    averageConsultationTime: {
      type: Number,
      default: 15,
    },
    problems: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Doctor", doctorSchema);

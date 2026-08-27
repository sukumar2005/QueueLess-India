const mongoose = require("mongoose");

const tokenSchema = new mongoose.Schema(
  {
    tokenNumber: {
      type: String,
      required: true,
    },

    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      default: null,
    },

    tokenType: {
      type: String,
      enum: ["service", "hospital", "office"],
      default: "service",
    },

    source: {
      type: String,
      enum: ["online", "offline"],
      default: "online",
    },

    hospital: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hospital",
      default: null,
    },

    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      default: null,
    },

    governmentOffice: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "GovernmentOffice",
      default: null,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    officer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Officer",
      default: null,
    },

    phone: {
      type: String,
      default: "",
    },

    problem: {
      type: String,
      default: "",
    },

    expectedTime: {
      type: String,
      default: "",
    },

    citizenName: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: [
        "waiting",
        "serving",
        "completed",
        "skipped",
      ],
      default: "waiting",
    },

    counter: {
      type: Number,
      default: null,
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },

    startedAt: {
      type: Date,
      default: null,
    },

    servedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Token",
  tokenSchema
);
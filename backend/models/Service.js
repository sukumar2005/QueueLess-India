const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    department: {
      type: String,
      required: true,
    },

    office: {
      type: String,
      required: true,
    },

    category: {
      type: String,
      default: "Government Service",
    },

    purpose: {
      type: String,
      default: "",
    },

    officerRole: {
      type: String,
      default: "",
    },

    processingTime: {
      type: String,
      default: "",
    },

    applicationSteps: {
      type: [String],
      default: [],
    },

    guidance: {
      type: String,
      default: "",
    },

    stateInfo: {
      type: Object,
      default: {},
    },

    documents: {
      type: [String],
      default: [],
    },

    averageTime: {
      type: Number,
      default: 10,
    },

    available: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Service", serviceSchema);

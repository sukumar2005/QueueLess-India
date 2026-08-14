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
      required: true,
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
      default: 3,
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },

    servedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Token", tokenSchema);
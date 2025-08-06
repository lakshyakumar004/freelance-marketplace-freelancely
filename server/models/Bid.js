const mongoose = require("mongoose");

const bidSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      required: true,
    },
    comment: {
      type: String,
    },
    freelancer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "declined"],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Bid", bidSchema);

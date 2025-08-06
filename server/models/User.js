const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, minlength: 7 },
  accountType: { type: String, enum: ["Freelancer", "Client"], required: true },

  // Freelancer-specific fields
  username: String,
  skills: [String],
  experienceLevel: String,
  bio: String,
  portfolioUrl: String,
  hourlyRate: Number,

  // Client-specific fields
  company: String,
  projectDescription: String,
  budget: Number,
});

module.exports = mongoose.model("User", userSchema);

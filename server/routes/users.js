const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Message = require("../models/Message");
const verifyToken = require("../middlewares/verifyToken");

// ✅ Get all conversations (users you’ve chatted with)
router.get("/conversations", verifyToken, async (req, res) => {
  const myId = req.user._id;

  try {
    // Find all messages where user is sender or receiver
    const messages = await Message.find({
      $or: [{ senderId: myId }, { receiverId: myId }],
    }).select("senderId receiverId");

    const userIds = new Set();

    messages.forEach((msg) => {
      if (msg.senderId.toString() !== myId.toString()) {
        userIds.add(msg.senderId.toString());
      }
      if (msg.receiverId.toString() !== myId.toString()) {
        userIds.add(msg.receiverId.toString());
      }
    });

    const users = await User.find({ _id: { $in: Array.from(userIds) } })
      .select("_id fullName email");

    res.json({ users });
  } catch (err) {
    console.error("❌ Error getting conversations:", err);
    res.status(500).json({ error: "Failed to load conversations" });
  }
});

// ✅ New: Search all users by name/email, excluding self
router.get("/", verifyToken, async (req, res) => {
  const myId = req.user._id;
  const search = req.query.search || "";

  try {
    const regex = new RegExp(search, "i");
    const users = await User.find({
      _id: { $ne: myId },
      $or: [{ fullName: regex }, { email: regex }],
    }).select("_id fullName email");

    res.json({ users });
  } catch (err) {
    console.error("❌ Error searching users:", err);
    res.status(500).json({ error: "Failed to search users" });
  }
});

module.exports = router;

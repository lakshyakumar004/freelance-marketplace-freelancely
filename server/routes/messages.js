const express = require("express");
const router = express.Router();
const Message = require("../models/Message");
const User = require("../models/User"); // 👉 needed for sender/receiver details
const authMiddleware = require("../middlewares/verifyToken");

// ✅ Get messages between two users
router.get("/:userId", authMiddleware, async (req, res) => {
  const myId = req.user._id;
  const otherId = req.params.userId;

  try {
    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: otherId },
        { senderId: otherId, receiverId: myId },
      ],
    }).sort({ createdAt: 1 });

    res.json({ messages });
  } catch (err) {
    console.error("❌ Error fetching messages:", err);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

// ✅ Send new message + emit `newMessage` + `newConversation`
router.post("/", authMiddleware, async (req, res) => {
  const senderId = req.user._id;
  const { receiverId, content } = req.body;

  if (!receiverId || !content) {
    return res.status(400).json({ error: "Missing receiverId or content" });
  }

  try {
    const message = await Message.create({ senderId, receiverId, content });

    // Emit `newMessage` to both rooms
    req.io.to(senderId.toString()).emit("newMessage", message);
    req.io.to(receiverId.toString()).emit("newMessage", message);

    // ✅ ALSO emit `newConversation` so both users see each other instantly
    const sender = await User.findById(senderId).select("_id fullName email");
    const receiver = await User.findById(receiverId).select("_id fullName email");

    req.io.to(senderId.toString()).emit("newConversation", receiver);
    req.io.to(receiverId.toString()).emit("newConversation", sender);

    res.status(201).json({ message });
  } catch (err) {
    console.error("❌ Error sending message:", err);
    res.status(500).json({ error: "Message send failed" });
  }
});

module.exports = router;

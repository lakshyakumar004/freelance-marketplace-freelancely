const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: "*", // In production, restrict this to your frontend URL
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

// Attach io to app so it can be accessed later
app.set("io", io);

// Middleware
app.use(cors());
app.use(express.json());

// 🔧 Middleware to attach io to each request
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Routes
const authRoutes = require("./routes/auth");
const projectRoutes = require("./routes/project");
const bidRoutes = require("./routes/bid");
const messageRoutes = require("./routes/messages");
const userRoutes = require("./routes/users");

app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/bids", bidRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/users", userRoutes);

// Root route
app.get("/", (req, res) => {
  res.send("Backend running!");
});

// Real-time Socket.IO handling
io.on("connection", (socket) => {
  console.log("🟢 User connected:", socket.id);

  socket.on("joinRoom", (userId) => {
    socket.join(userId);
    console.log(`👤 User ${userId} joined room ${userId}`);
  });

  socket.on("typing", ({ senderId, receiverId }) => {
    io.to(receiverId).emit("typing", { senderId });
  });

  socket.on("disconnect", () => {
    console.log("🔴 User disconnected:", socket.id);
  });
});

// Connect to MongoDB and start server
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
    });
  })
  .catch((err) => console.error("❌ MongoDB connection error:", err));

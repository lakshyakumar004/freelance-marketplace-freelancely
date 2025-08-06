const express = require("express");
const router = express.Router();
const {
  createProject,
  getProjectsByUser,
  deleteProject,
  getAllProjects, // ✅ now properly imported
} = require("../controllers/projectController");

const verifyToken = require("../middlewares/verifyToken");

// ✅ Protected routes
router.post("/", verifyToken, createProject);
router.get("/user/:userId", verifyToken, getProjectsByUser);
router.delete("/:id", verifyToken, deleteProject);

// ✅ Public route to get all projects
router.get("/", getAllProjects);

module.exports = router;

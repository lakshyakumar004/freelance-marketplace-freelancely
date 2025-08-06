const Project = require("../models/Project");
const Bid = require("../models/Bid");

const createProject = async (req, res) => {
  try {
    const { title, description, skills, budget, deadline } = req.body;
    const postedBy = req.user._id;

    const newProject = new Project({
      title,
      description,
      skills,
      budget,
      deadline,
      postedBy
    });

    await newProject.save();

    // Emit socket event to notify freelancers
    const io = req.app.get("io");
    io.emit("newProjectPosted", newProject);  // 🔥 Real-time push to freelancers

    res.status(201).json({ message: "Project posted successfully", project: newProject });
  } catch (err) {
    res.status(500).json({ message: "Error creating project", error: err.message });
  }
};

const getProjectsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const projects = await Project.find({ postedBy: userId }).sort({ createdAt: -1 });
    res.status(200).json({ message: "Projects fetched successfully", projects });
  } catch (err) {
    res.status(500).json({ message: "Error fetching projects", error: err.message });
  }
};

const deleteProject = async (req, res) => {
  try {
    const projectId = req.params.id;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (req.user && project.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized to delete this project" });
    }

    await project.deleteOne();

    // Emit socket event to notify project removal
    const io = req.app.get("io");
    io.emit("projectUpdated", { projectId });  // 🧹 Real-time remove from UI

    res.status(200).json({ message: "Project deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting project", error: err.message });
  }
};

const getAllProjects = async (req, res) => {
  try {
    const projectsWithAcceptedBids = await Bid.find({ status: "accepted" }).distinct("project");

    const projects = await Project.find({
      _id: { $nin: projectsWithAcceptedBids }
    }).populate("postedBy", "fullName company");

    res.status(200).json({ projects });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch projects", error: err.message });
  }
};

module.exports = {
  createProject,
  getProjectsByUser,
  deleteProject,
  getAllProjects,
};

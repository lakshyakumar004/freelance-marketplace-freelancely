const Bid = require("../models/Bid");

exports.placeBid = async (req, res) => {
  try {
    const { amount, comment, projectId } = req.body;
    const freelancerId = req.user?._id;

    console.log("🚨 Incoming Bid Payload:");
    console.log("amount:", amount);
    console.log("comment:", comment);
    console.log("projectId:", projectId);
    console.log("freelancerId:", freelancerId);

    if (!freelancerId || !projectId || !amount) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const newBid = new Bid({
      amount,
      comment,
      project: projectId,
      freelancer: freelancerId,
    });

    await newBid.save();

    // Populate freelancer details if needed
    await newBid.populate("freelancer", "-password");

    // Emit bid to clients via Socket.IO
    const io = req.app.get("io");
    io.emit("newBid", {
      projectId,
      bid: newBid,
    });

    res.status(201).json({ message: "Bid placed successfully", bid: newBid });
  } catch (err) {
    console.error("❌ Bid creation error:", err);
    res.status(500).json({ message: "Failed to place bid", error: err.message });
  }
};

exports.getBidsForProject = async (req, res) => {
  try {
    const { projectId } = req.params;

    const bids = await Bid.find({ project: projectId })
      .populate("freelancer", "username skills experienceLevel")
      .sort({ createdAt: -1 });

    res.status(200).json({ bids });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch bids", error: err.message });
  }
};

exports.updateBidStatus = async (req, res) => {
  try {
    const { bidId } = req.params;
    const { status } = req.body;

    if (!["accepted", "declined"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const bid = await Bid.findById(bidId)
      .populate("freelancer", "_id") // Needed to emit freelancerId
      .populate({
        path: "project",
        populate: { path: "postedBy", model: "User" },
      });

    if (!bid) {
      return res.status(404).json({ message: "Bid not found" });
    }

    if (!bid.project?.postedBy) {
      return res.status(500).json({ message: "Project or postedBy is missing in bid" });
    }

    if (req.user._id.toString() !== bid.project.postedBy._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    bid.status = status;
    await bid.save();

    const io = req.app.get("io");

    if (io) {
      if (status === "accepted") {
        // 🔁 Remove from AvailableProjects for everyone
        console.log("✅ Emitting projectUpdated");
        io.emit("projectUpdated", { projectId: bid.project._id.toString() });

        // 🔔 Notify only the accepted freelancer
        console.log("✅ Emitting bidAccepted to freelancerId:", bid.freelancer._id.toString());
        io.emit("bidAccepted", {
          freelancerId: bid.freelancer._id.toString(),
          projectId: bid.project._id.toString(),
        });
      }
    }

    res.status(200).json({ message: `Bid ${status}`, bid });
  } catch (err) {
    console.error("Error updating bid status:", err);
    res.status(500).json({ message: "Error updating bid status", error: err.message });
  }
};

exports.getAcceptedBidsForFreelancer = async (req, res) => {
  try {
    const freelancerId = req.user._id;

    const acceptedBids = await Bid.find({ 
      freelancer: freelancerId, 
      status: "accepted" 
    })
    .populate({
      path: "project",
      populate: {
        path: "postedBy",
        select: "fullName company", // or email/username if needed
      },
    });

    res.status(200).json({ bids: acceptedBids });
  } catch (err) {
    res.status(500).json({ message: "Error fetching accepted projects", error: err.message });
  }
};


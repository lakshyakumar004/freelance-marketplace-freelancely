const express = require("express");
const router = express.Router();
const { placeBid } = require("../controllers/bidController");
const { getBidsForProject } = require("../controllers/bidController");
const verifyToken = require("../middlewares/verifyToken");
const { updateBidStatus } = require("../controllers/bidController");
const { getAcceptedBidsForFreelancer } = require("../controllers/bidController");

router.post("/", verifyToken, placeBid);
router.get("/:projectId/bids", verifyToken, getBidsForProject);
router.put("/:bidId/status", verifyToken, updateBidStatus);
router.get("/freelancer/accepted", verifyToken, getAcceptedBidsForFreelancer);

module.exports = router;

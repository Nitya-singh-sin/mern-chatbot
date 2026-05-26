const express = require("express");
const router = express.Router();
const { getChatHistory, sendMessage, deleteMessage, getAIResponse } = require("../controllers/chatController");
const { protect } = require("../middleware/authMiddleware");

router.get("/history/:room", protect, getChatHistory);
router.post("/send", protect, sendMessage);
router.delete("/:messageId", protect, deleteMessage);
router.post("/ai", protect, getAIResponse);

module.exports = router;

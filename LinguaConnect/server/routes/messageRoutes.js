const express = require("express");
const router = express.Router();

const messageController = require("../controllers/messageController");
const authController = require("../controllers/authController");

router.use(authController.protect); // Protect all routes after this middleware

router.post("/", messageController.createMessage); // Create a new message
router.get("/:chatId", messageController.getChatMessages); // Retrieve all messages for a specific chat
router.delete("/:messageId", messageController.deleteMessage); // Delete a message

module.exports = router;

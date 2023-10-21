const express = require("express");
const router = express.Router();

const chatController = require("./../controllers/chatController");
const authController = require("./../controllers/authController");

router.use(authController.protect); // Protect all routes after this middleware

router.post("/", chatController.createChat); // Create a new chat
router.get("/:userId", chatController.listChatsForUser); // List all chats for a specific user
router.get("/:user1Id/:user2Id", chatController.getChat); // Retrieve an existing chat between two users
router.delete("/:chatId", chatController.deleteChat); // Delete a chat

module.exports = router;

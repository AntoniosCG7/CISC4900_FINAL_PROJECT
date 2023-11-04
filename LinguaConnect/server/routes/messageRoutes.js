const express = require("express");
const router = express.Router();
const socketMiddleware = require("../utils/socketMiddleware");
const multer = require("multer");
const { storage } = require("./../cloudinary");
const upload = multer({ storage });

const messageController = require("../controllers/messageController");
const authController = require("../controllers/authController");

router.use(authController.protect); // Protect all routes after this middleware

router.post("/", messageController.createTextMessage, socketMiddleware); // Create a new text message
router.get("/:chatId/unread", messageController.getUnreadMessages); // Retrieve all unread messages for a specific chat
router.get("/:chatId", messageController.getChatMessages); // Retrieve all messages for a specific chat
router.delete("/:messageId", messageController.deleteMessage); // Delete a message
router.post(
  "/sendImage",
  upload.single("image"),
  messageController.createImageMessage,
  socketMiddleware
); // Create a new image-containing message

module.exports = router;

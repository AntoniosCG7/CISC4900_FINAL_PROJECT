const Message = require("../models/messageModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

// Create a new text message
exports.createTextMessage = catchAsync(async (req, res, next) => {
  const { chat, sender, content } = req.body;

  // Check if content is provided
  if (!content || content.trim() === "") {
    return res.status(400).json({
      status: "error",
      message: "Content must be provided for a text message.",
    });
  }

  // Create a new message
  const newMessage = await Message.create({
    chat,
    sender,
    content,
    delivered: Date.now(),
  });

  // Populate the sender and chat using a query
  const populatedMessage = await Message.findById(newMessage._id)
    .populate("sender", "firstName lastName _id")
    .populate("chat", "_id");

  // Set the populated message and the action type in res.locals
  res.locals.message = populatedMessage;
  res.locals.action = "messageSent";
  res.locals.success = true;

  next(); // Pass control to the next middleware
});

// Create a new message with an image
exports.createImageMessage = catchAsync(async (req, res, next) => {
  const { chat, sender } = req.body;

  // Check if an image is uploaded
  if (!req.file) {
    return res.status(400).json({
      status: "error",
      message: "An image must be provided for an image message.",
    });
  }

  const imageUrl = req.file.path;

  // Create a new message
  const newMessage = await Message.create({
    chat,
    sender,
    imageUrl,
    delivered: Date.now(),
  });

  // Populate the sender and chat using a query
  const populatedMessage = await Message.findById(newMessage._id)
    .populate("sender", "firstName lastName _id")
    .populate("chat", "_id");

  // Set the populated message and the action type in res.locals
  res.locals.message = populatedMessage;
  res.locals.action = "messageSent";
  res.locals.success = true;

  next(); // Pass control to the next middleware
});

// Retrieve all messages for a specific chat
exports.getChatMessages = catchAsync(async (req, res, next) => {
  const { chatId } = req.params;

  // Find all messages for the specified chat
  const messages = await Message.find({ chat: chatId })
    .populate("sender", "firstName _id")
    .sort("-timestamp");

  res.status(200).json({
    success: true,
    messages: messages,
  });
});

// Retrieve all unread messages for a specific chat
exports.getUnreadMessages = catchAsync(async (req, res, next) => {
  const { chatId } = req.params;
  const currentUserId = req.user._id;

  // Find all messages that are unread and sent by the other user
  const unreadMessages = await Message.find({
    chat: chatId,
    sender: { $ne: currentUserId },
    read: null,
  })
    .populate("sender", "firstName _id")
    .sort("-timestamp");

  res.status(200).json({
    success: true,
    messages: unreadMessages,
  });
});

// Delete a message
exports.deleteMessage = catchAsync(async (req, res, next) => {
  const { messageId } = req.params;
  const message = await Message.findById(messageId);
  if (!message) {
    return next(new AppError("Message not found.", 404));
  }
  await message.remove();
  res.status(204).send();
});

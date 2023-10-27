const Message = require("../models/messageModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

exports.createMessage = catchAsync(async (req, res, next) => {
  const { chat, sender, content } = req.body;
  const newMessage = await Message.create({ chat, sender, content });

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

exports.getChatMessages = catchAsync(async (req, res, next) => {
  const { chatId } = req.params;

  const messages = await Message.find({ chat: chatId })
    .populate("sender", "firstName _id")
    .sort("-timestamp");

  res.status(200).json({
    success: true,
    messages: messages,
  });
});

exports.deleteMessage = catchAsync(async (req, res, next) => {
  const { messageId } = req.params;
  const message = await Message.findById(messageId);
  if (!message) {
    return next(new AppError("Message not found.", 404));
  }
  await message.remove();
  res.status(204).send();
});

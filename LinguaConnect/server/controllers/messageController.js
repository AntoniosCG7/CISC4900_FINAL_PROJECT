const Message = require("../models/messageModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

exports.createMessage = catchAsync(async (req, res, next) => {
  const { chat, sender, content } = req.body;
  const newMessage = await Message.create({ chat, sender, content });
  res.status(201).json(newMessage);
});

exports.getChatMessages = catchAsync(async (req, res, next) => {
  const { chatId } = req.params;
  const messages = await Message.find({ chat: chatId }).sort("timestamp");
  res.status(200).json(messages);
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

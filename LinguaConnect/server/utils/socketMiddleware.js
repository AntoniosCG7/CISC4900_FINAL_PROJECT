const { ioData, currentlyActiveUsers } = require("./socketSetup");
const Chat = require("../models/chatModel");
const catchAsync = require("./catchAsync");

// ========= Utility Functions =========

// Utility function to get the socket ID of a user
const getSocketIdOfUser = (userId) => {
  // Loop through the currentlyActiveUsers object to find the socket ID of the user
  for (let [socketId, id] of Object.entries(currentlyActiveUsers)) {
    if (id.toString() === userId.toString()) return socketId;
  }
  return null;
};

// ========= Emit Events Functions =========

// Create a new chat event
const handleChatCreation = async (res) => {
  const chat = res.locals.chat;
  const recipientSocketId = getSocketIdOfUser(chat.user2.id);

  if (recipientSocketId) {
    ioData.io.to(recipientSocketId).emit("newChatInitiated", chat);
    ioData.io.emit("user-status-change");
  }

  res.status(201).json({
    status: "success",
    data: {
      chat: res.locals.chat,
    },
  });
};

// Send a new message event
const handleNewMessage = async (res) => {
  const message = res.locals.message;
  const chat = await Chat.findById(message.chat)
    .populate("user1")
    .populate("user2");
  const recipientId =
    message.sender._id.toString() === chat.user1._id.toString()
      ? chat.user2._id
      : chat.user1._id;
  const recipientSocketId = getSocketIdOfUser(recipientId);

  if (recipientSocketId) {
    ioData.io.to(recipientSocketId).emit("new-message", message);
  } else {
    console.error("Couldn't find a socket ID for recipient:", recipientId);
  }

  res.status(201).json({
    status: "success",
    data: {
      message: res.locals.message,
    },
  });
};

// ========= Main Event Emitter Function =========

const emitChatEvents = catchAsync(async (req, res, next) => {
  if (
    res.locals.success &&
    res.locals.chat &&
    res.locals.action === "created"
  ) {
    await handleChatCreation(res);
  } else if (
    res.locals.success &&
    res.locals.message &&
    res.locals.action === "messageSent"
  ) {
    await handleNewMessage(res);
  } else {
    next();
  }
});

module.exports = emitChatEvents;

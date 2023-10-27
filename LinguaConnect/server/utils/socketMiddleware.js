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
  // Get the chat from the response
  const chat = res.locals.chat;

  // Get the socket ID of the recipient
  const recipientSocketId = getSocketIdOfUser(chat.user2.id);

  // Emit the new chat event to the recipient
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
  // Get the message from the response
  const message = res.locals.message;

  // Find the chat that the message belongs to
  const chat = await Chat.findById(message.chat)
    .populate("user1")
    .populate("user2");

  // Update the lastMessageTimestamp of the chat
  const updatedChat = await Chat.findByIdAndUpdate(
    message.chat,
    { lastMessageTimestamp: message.timestamp },
    { new: true }
  );

  // Get the ID of the recipient
  const recipientId =
    message.sender._id.toString() === chat.user1._id.toString()
      ? chat.user2._id
      : chat.user1._id;

  // Get the socket ID of the recipient
  const recipientSocketId = getSocketIdOfUser(recipientId);

  // Emit the new message event to the recipient
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

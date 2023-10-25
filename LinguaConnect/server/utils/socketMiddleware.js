const { ioData, currentlyActiveUsers } = require("./socketSetup");

// Utility function to get the socket ID of a user
const getSocketIdOfUser = (userId) => {
  // Loop through the currentlyActiveUsers object to find the socket ID of the user
  for (let [socketId, id] of Object.entries(currentlyActiveUsers)) {
    if (id.toString() === userId.toString()) return socketId;
  }
  return null;
};

// Middleware to emit chat events
const emitChatEvents = (req, res, next) => {
  // Check if the operation was successful and if there's any chat data to process
  if (res.locals.success && res.locals.chat) {
    const chat = res.locals.chat;

    // Emit event for chat creation
    if (res.locals.action === "created") {
      const recipientSocketId = getSocketIdOfUser(chat.user2.id); // 'user2' is always the recipient
      if (recipientSocketId) {
        ioData.io.to(recipientSocketId).emit("newChatInitiated", chat); // Emit event to recipient
        ioData.io.emit("user-status-change"); // Update the list of active users for all clients
      }
      res.status(201).json({
        status: "success",
        data: {
          chat: res.locals.chat,
        },
      });
    } else {
      next();
    }
  } else {
    next();
  }
};

module.exports = emitChatEvents;

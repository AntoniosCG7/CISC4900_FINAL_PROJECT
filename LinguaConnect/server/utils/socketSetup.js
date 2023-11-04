const User = require("./../models/userModel");
const Message = require("./../models/messageModel");
const { Server } = require("socket.io");

// Maintain a list of active users
const currentlyActiveUsers = {};

// Maintain a reference to the socket.io instance
let ioData = { io: null };

const initializeSocket = (server) => {
  ioData.io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  // Listen for incoming connections
  ioData.io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // Handle when user provides their details after connecting
    socket.on("user-details", async (data) => {
      const { userId } = data;
      currentlyActiveUsers[socket.id] = userId;
      try {
        await User.findByIdAndUpdate(userId, { currentlyActive: true });
        ioData.io.emit("user-status-change");
      } catch (error) {
        console.error("Error updating user active status:", error);
      }
    });

    // Handle manual disconnect from the client side
    socket.on("manual-disconnect", async (data) => {
      const { userId } = data;
      try {
        await User.findByIdAndUpdate(userId, { currentlyActive: false }); // Set the user's currentlyActive status to false
        delete currentlyActiveUsers[socket.id];
        ioData.io.emit("user-status-change");
      } catch (error) {
        console.error(
          "Error updating user active status on manual disconnect:",
          error
        );
      }
    });

    // Mark a message as read
    socket.on("message-read", async (data) => {
      const { chat, sender } = data.message;
      const chatId = chat._id;
      const senderId = sender._id;

      // Update the messages in the chat as read.
      try {
        // Get the current date
        const currentDate = new Date();

        // Update unread messages using the current date
        await Message.updateMany(
          {
            chat: chatId,
            sender: senderId,
            read: null,
          },
          { read: currentDate }
        );

        // Fetch the updated messages
        const fetchedUpdatedMessages = await Message.find({
          chat: chatId,
          sender: senderId,
          read: currentDate,
        });

        // Retrieve the socket ID of the sender directly
        let senderSocketId = null;
        for (let [socketId, id] of Object.entries(currentlyActiveUsers)) {
          if (id.toString() === senderId.toString()) {
            senderSocketId = socketId;
            break;
          }
        }

        // Emit the read confirmation to the sender
        if (senderSocketId) {
          ioData.io
            .to(senderSocketId)
            .emit("message-read-confirmation", fetchedUpdatedMessages);
        } else {
          console.error("Couldn't find a socket ID for sender:", senderId);
        }
      } catch (error) {
        console.error("Error updating messages as read:", error);
      }
    });

    // Mark multiple messages as read
    socket.on("messages-read", async (data) => {
      const { chat, userId } = data;

      try {
        // Get the current date
        const currentDate = new Date();

        // Update all unread messages in the specified chat (that were NOT sent by the current user) using the current date
        await Message.updateMany(
          {
            chat: chat._id,
            sender: { $ne: userId.toString() }, // Messages that were not sent by the current user
            read: null,
          },
          { read: currentDate }
        );

        // Fetch the updated messages
        const fetchedUpdatedMessages = await Message.find({
          chat: chat._id,
          sender: { $ne: userId.toString() },
          read: currentDate,
        });

        // Retrieve the id of the current user
        const currentUserId = userId;

        // Retrieve the socket id of the other user (sender)
        let senderSocketId = null;
        for (let [socketId, id] of Object.entries(currentlyActiveUsers)) {
          if (id.toString() !== currentUserId.toString()) {
            senderSocketId = socketId;
            break;
          }
        }

        // Emit the read confirmation to the sender
        if (senderSocketId) {
          ioData.io
            .to(senderSocketId)
            .emit("message-read-confirmation", fetchedUpdatedMessages);
        } else {
          console.error("Couldn't find a socket ID for sender:", userId);
        }
      } catch (error) {
        console.error("Error marking multiple messages as read:", error);
      }
    });

    // Listen for the "error" event
    socket.on("error", async (error) => {
      // 1. Update the user's status to inactive:
      const userId = currentlyActiveUsers[socket.id];
      if (userId) {
        try {
          await User.findByIdAndUpdate(userId, { currentlyActive: false });
        } catch (error) {
          console.error(
            "Error updating user inactive status on error event:",
            error
          );
        }

        // 2. Emit the "user-status-change" event to the client side to update the UI:
        ioData.io.emit("user-status-change");

        // 3. Log the error to the console:
        console.error("Socket Error:", error);

        // 4. Remove user from currentlyActiveUsers:
        delete currentlyActiveUsers[socket.id];
      }
    });

    // Listen for the "disconnect" event
    socket.on("disconnect", async () => {
      const userId = currentlyActiveUsers[socket.id];
      console.log("User disconnected:", socket.id);
      try {
        await User.findByIdAndUpdate(userId, { currentlyActive: false }); // Set the user's currentlyActive status to false upon disconnection
        ioData.io.emit("user-status-change");
      } catch (error) {
        console.error("Error updating user inactive status:", error);
      }
      delete currentlyActiveUsers[socket.id];
    });
  });
};

module.exports = { initializeSocket, currentlyActiveUsers, ioData };

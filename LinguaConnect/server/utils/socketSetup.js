const User = require("./../models/userModel");
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

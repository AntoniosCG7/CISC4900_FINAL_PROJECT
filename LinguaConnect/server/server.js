// Import the Mongoose library for connecting to MongoDB
const mongoose = require("mongoose");

// Import the dotenv library for loading environment variables
const dotenv = require("dotenv");

// Load environment variables from the .env file
dotenv.config({ path: "./config/.env" });

// Set the port number to listen on
const port = process.env.PORT || 3000;

// Import the Express application from the app.js file
const app = require("./app");

// Start the server and listen for incoming requests
const server = app.listen(port, () => {
  console.log(`App running on port ${port}`);
});

// Integrate Socket.io with the Express application and start listening for incoming connections
const { Server } = require("socket.io");
const User = require("./models/userModel");
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Maintain a list of active users
const currentlyActiveUsers = {};

// Listen for incoming connections
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Handle manual disconnect from the client side
  socket.on("manual-disconnect", async (data) => {
    const { userId } = data;
    try {
      await User.findByIdAndUpdate(userId, { currentlyActive: false }); // Set the user's currentlyActive status to false
      delete currentlyActiveUsers[socket.id];
      io.emit("user-status-change");
    } catch (error) {
      console.error(
        "Error updating user active status on manual disconnect:",
        error
      );
    }
  });

  // Handle when user provides their details after connecting
  socket.on("user-details", async (data) => {
    const { userId } = data;
    currentlyActiveUsers[socket.id] = userId;
    try {
      await User.findByIdAndUpdate(userId, { currentlyActive: true }); // Set the user's currentlyActive status to true upon connection
      io.emit("user-status-change");
    } catch (error) {
      console.error("Error updating user active status:", error);
    }
  });

  // Listen for the "send_message" event
  socket.on("send_message", (data) => {
    socket.broadcast.emit("receive_message", data);
  });

  // Listen for the "disconnect" event
  socket.on("disconnect", async () => {
    const userId = currentlyActiveUsers[socket.id];
    console.log("User disconnected:", socket.id);

    try {
      const updatedUser = await User.findByIdAndUpdate(userId, {
        currentlyActive: false,
      }); // Set the user's currentlyActive status to false upon disconnection
      io.emit("user-status-change");
    } catch (error) {
      console.error("Error updating user inactive status:", error);
    }

    delete currentlyActiveUsers[socket.id];
  });
});

// Endpoint to fetch active users
app.get("/activeChatUsers", (req, res) => {
  // Return the list of active user IDs
  res.json(Object.values(currentlyActiveUsers));
});

// Listen for uncaught exception events
process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION! 💥 Shutting down...");
  console.error(err.name, err.message);

  server.close(() => {
    process.exit(1); // exit with a non-zero status code to indicate an error
  });
});

// Construct the MongoDB connection string using environment variables
const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);

// Connect to the MongoDB database using Mongoose
const connectDB = async () => {
  try {
    // Use Mongoose to connect to the MongoDB database
    const connection = await mongoose.connect(DB, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("DB connection successful!");
    await resetUserActiveStatuses(); // Reset the active status of all users upon server start
  } catch (error) {
    console.error("DB connection failed:", error);
    // Close the server and exit the process if the database connection fails
    server.close(() => {
      process.exit(1);
    });
  }
};

// Call the connectDB function to connect to the database
connectDB();

// Listen for unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  server.close(() => {
    process.exit(1); // exit with a non-zero status code to indicate an error
  });
});

// Handle the SIGINT signal (Ctrl+C) by closing the MongoDB connection and exiting the process
process.on("SIGINT", async () => {
  // Close the Mongoose connection to MongoDB
  await mongoose.connection.close();
  // Exit the process with a status code of 0 (indicating success)
  process.exit(0);
});

// Handle the SIGTERM signal by closing the MongoDB connection and exiting the process
process.on("SIGTERM", async () => {
  await mongoose.connection.close();
  process.exit(0);
});

// Reset user active statuses function
async function resetUserActiveStatuses() {
  await User.updateMany({}, { active: false });
}

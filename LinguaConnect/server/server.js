// Import the Mongoose library for connecting to MongoDB
const mongoose = require("mongoose");

// Import the dotenv library for loading environment variables
const dotenv = require("dotenv");

// Load environment variables from the .env file
dotenv.config({ path: "./config/.env" });

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
  } catch (error) {
    console.error("DB connection failed:", error);
  }
};

// Call the connectDB function to connect to the database
connectDB();

// Set the port number to listen on
const port = process.env.PORT || 3000;

// Import the Express application from the app.js file
const app = require("./app");

// Start the server and listen for incoming requests
app.listen(port, () => {
  console.log(`App running on port ${port}`);
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

// Import the Express and CORS modules
const express = require("express");
const cors = require("cors");

// Import the language router module
const languageRouter = require("./routes/languageRoutes");

// Create a new Express application
const app = express();

// Enable CORS for requests from http://localhost:5173
app.use(
  cors({
    origin: "http://localhost:5173",
  })
);

// Parse incoming JSON data
app.use(express.json());

// Mount the language router at the /api/v1/languages endpoint
app.use("/api/v1/languages", languageRouter);

// Export the Express application
module.exports = app;

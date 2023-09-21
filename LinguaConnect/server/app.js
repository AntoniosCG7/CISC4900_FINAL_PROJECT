const express = require("express");
const cors = require("cors");

const globalErrorHandler = require("./controllers/errorController");
const AppError = require("./utils/appError");
const catchAsync = require("./utils/catchAsync");
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

// ROUTES
// Mount the language router at the /api/v1/languages endpoint
app.use("/api/v1/languages", languageRouter);

// Handle errors when API route is not found
app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`));
});

// Handle errors during development mode (show full details for debugging)
app.use(globalErrorHandler);

// Export the Express application
module.exports = app;

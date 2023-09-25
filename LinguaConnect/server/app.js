const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const globalErrorHandler = require("./controllers/errorController");
const AppError = require("./utils/appError");
const userRouter = require("./routes/userRoutes");
const languageRouter = require("./routes/languageRoutes");

// Create a new Express application
const app = express();

// MIDDLEWARES
// Enable CORS for requests from http://localhost:5173
app.use(
  cors({
    origin: "http://localhost:5173",
  })
);

// Parse incoming JSON data
app.use(express.json());

// Parse cookies
app.use(cookieParser());

// Middleware function to add a request timestamp to the request object. It is for middleware testing purposes only.
app.use((req, res, next) => {
  // Add a new property to the request object with the current date and time in ISO format
  req.requestTime = new Date().toISOString();
  next();
});

// ROUTES
// Mount routers at their corresponding endpoint
app.use("/api/v1/users", userRouter);
app.use("/api/v1/languages", languageRouter);

// Handle errors when API route is not found
app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`));
});

// Handle errors during development mode (show full details for debugging)
app.use(globalErrorHandler);

// Export the Express application
module.exports = app;

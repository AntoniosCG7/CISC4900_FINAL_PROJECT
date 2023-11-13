const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const morgan = require("morgan");

const globalErrorHandler = require("./controllers/errorController");
const AppError = require("./utils/appError");
const userRouter = require("./routes/userRoutes");
const chatRouter = require("./routes/chatRoutes");
const messageRouter = require("./routes/messageRoutes");
const eventRouter = require("./routes/eventRoutes");
const languageRouter = require("./routes/languageRoutes");

// Create a new Express application
const app = express();

// MIDDLEWARES

// Set security HTTP headers with helmet
app.use(helmet());

// Development logging middleware (only used in development mode) to log requests to the console
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Limit the number of requests from an IP address to 1000 per hour
const limiter = rateLimit({
  max: 1000,
  windowMs: 60 * 60 * 1000, // 1 hour
  message: "Too many requests from this IP. Please try again in an hour.",
});

// Apply the rate limiter to all requests to the /api endpoint
app.use("/api", limiter);

// Enable CORS for requests from http://localhost:5173
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true, // this allows the server to accept cookies from the client
  })
);

// Parse request body data from JSON into a JavaScript object (req.body) and limit the size of the request body to 10kb
app.use(express.json({ limit: "10kb" }));
// Parse request body data from URL-encoded form into a JavaScript object (req.body) and limit the size of the request body to 10kb
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
// Parse cookies
app.use(cookieParser());

// Data sanitization against NoSQL query injection (e.g. { $gt: "" })
app.use(mongoSanitize());

// Data sanitization against XSS (e.g. <script>alert("XSS")</script>)
app.use(xss());

// Middleware function to add a request timestamp to the request object. It is for middleware testing purposes only.
app.use((req, res, next) => {
  // Add a new property to the request object with the current date and time in ISO format
  req.requestTime = new Date().toISOString();
  next();
});

// ROUTES
// Mount routers at their corresponding endpoint
app.use("/api/v1/users", userRouter);
app.use("/api/v1/chats", chatRouter);
app.use("/api/v1/messages", messageRouter);
app.use("/api/v1/events", eventRouter);
app.use("/api/v1/languages", languageRouter);

// Handle errors when API route is not found
app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`));
});

// Handle errors during development mode (show full details for debugging)
app.use(globalErrorHandler);

// Export the Express application
module.exports = app;

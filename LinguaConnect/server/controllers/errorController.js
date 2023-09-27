const AppError = require("../utils/appError");

// Handle cast errors from MongoDB (e.g. invalid object ID)
const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

// Handle duplicate field errors in MongoDB
const handleDuplicateFieldsDB = (err) => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  const message = `Duplicate field value: ${value}. Please use another value.`;
  return new AppError(message, 400);
};

// Handle validation errors from Mongoose
const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data. ${errors.join(". ")}`;
  return new AppError(message, 400);
};

// Handle errors related to invalid JWT tokens
const handleJWTError = () =>
  new AppError("Invalid token. Please log in again!", 401);

// Handle errors related to expired JWT tokens
const handleJWTExpiredError = () =>
  new AppError("Your token has expired! Please log in again.", 401);

// Handle errors during development mode (show full details for debugging)
const handleDevError = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    stack: err.stack,
    error: err,
  });
};

// Handle errors during production mode (hide error details from users)
const handleProdError = (err, res) => {
  // Operational, known errors: send a friendly message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }
  // Unknown, unexpected errors: don't leak error details to client
  else {
    console.error("ERROR 💥", err);
    res.status(500).json({
      status: "error",
      message: "Something went wrong!",
    });
  }
};

// Handle errors when API route is not found
const handleAPINotFoundError = () =>
  new AppError("This route is not found on the server", 404);

// Handle errors related to unauthorized access
const handleAuthorizationError = () =>
  new AppError("You are not authorized to perform this action", 403);

// Main error handling middleware
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  // Determine error handling based on environment
  if (process.env.NODE_ENV === "development") {
    handleDevError(err, res);
  } else if (process.env.NODE_ENV === "production") {
    let error = { ...err };

    // Map specific error types to their handlers
    if (error.name === "CastError") error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === "ValidationError")
      error = handleValidationErrorDB(error);
    if (error.name === "JsonWebTokenError") error = handleJWTError();
    if (error.name === "TokenExpiredError") error = handleJWTExpiredError();
    if (error.name === "APINotFoundError") error = handleAPINotFoundError();
    if (error.name === "AuthorizationError") error = handleAuthorizationError();

    handleProdError(error, res);
  }
};

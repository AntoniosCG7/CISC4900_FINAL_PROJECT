const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const jwt = require("jsonwebtoken");
const { promisify } = require("util");

// Function to sign a JWT token
const signToken = (id) => {
  // Sign a new JWT token with the user's ID and the JWT_SECRET
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_COOKIE_EXPIRES_IN,
  });
};

// Function to create and send a token to the client
const createSendToken = (user, statusCode, req, res) => {
  // Sign a JWT token for the user
  const token = signToken(user._id);

  // Calculate cookie expiration date
  const cookieExpiration =
    process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000;

  // Set JWT as a cookie on the client side
  res.cookie("jwt", token, {
    expires: new Date(Date.now() + cookieExpiration),
    httpOnly: true, // Ensures the cookie is sent only over HTTP(S), not client JavaScript
    secure:
      process.env.NODE_ENV === "production" &&
      (req.secure || req.headers["x-forwarded-proto"] === "https"), // Use secure cookies in production
    sameSite: "strict", // Prevents the cookie from being sent in cross-site requests
  });

  // Remove the password from the output for security
  user.password = undefined;

  // Send the token and user data as a response
  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

exports.register = catchAsync(async (req, res, next) => {
  // Check if the provided password and password confirmation match
  if (req.body.password !== req.body.passwordConfirm) {
    return next(new AppError("Passwords do not match", 400)); // Return an error if they don't match
  }

  // Create a new user in the database, only taking specific fields to avoid potential security risks
  const newUser = await User.create({
    username: req.body.username,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  res.status(201).json({
    status: "success",
    message: "User created successfully.",
    data: {
      user: newUser,
    },
  });

  // Log the user in by sending them a JWT token
  createSendToken(newUser, 201, req, res);
});

exports.login = catchAsync(async (req, res, next) => {
  // Check if the email and password were provided
  if (!req.body.email || !req.body.password) {
    return next(
      new AppError("Please provide an email and password to log in.", 400)
    );
  }

  // Find the user with the provided email and select the password field
  const user = await User.findOne({ email: req.body.email }).select(
    "+password"
  );

  // Check if the user exists and the password is correct
  if (
    !user ||
    !(await user.comparePassword(req.body.password, user.password))
  ) {
    return next(new AppError("Incorrect email or password.", 401));
  }

  // Generate a JWT token for the user
  const token = signToken(user._id);

  // Send a success response with the JWT token
  res.status(200).json({
    status: "success",
    message: "User logged in successfully.",
    token,
  });
});

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1. Get user based on the provided email
  const user = await User.findOne({ email: req.body.email });

  // 2. Check if the user exists
  if (!user) {
    return next(new AppError("There is no user with that email address.", 404));
  }

  // 3. Generate a password reset token
  const resetToken = user.createPasswordResetToken();

  // 4. Save the user's updated data
  await user.save({ validateBeforeSave: false });
});

exports.protect = catchAsync(async (req, res, next) => {
  let token;

  // 1. Check if the request contains the token in its headers or cookies.
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  // 2. If no token is found, send back an error response.
  if (!token) {
    return next(
      new AppError(
        "You are not logged in. Please log in to access this route.",
        401
      )
    );
  }

  // 3. Verify the token to ensure it's valid.
  const decodedPayload = await promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET
  );

  // 4. Check if the user for which the token was issued still exists.
  const currentUser = await User.findById(decodedPayload.id);
  if (!currentUser) {
    return next(
      new AppError("The user associated with this token no longer exists.", 401)
    );
  }

  // 5. Check if user changed password after the token was issued.
  if (currentUser.changedPasswordAfter(decodedPayload.iat)) {
    return next(
      new AppError("User recently changed password. Please log in again.", 401)
    );
  }

  // 6. If all checks pass, grant access to the protected route.
  req.user = currentUser; // Saving user data to the request object to use later.
  next();
});

// Middleware to restrict access to certain routes based on user role
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // Check if the user's role is included in the provided roles.
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You do not have permission to perform this action.", 403)
      );
    }

    // If the user's role is included, grant access to the protected route.
    next();
  };
};

// Import the Express module and create a new router instance
const express = require("express");
const router = express.Router();

// Import the authentication and user controllers
const authenticationController = require("./../controllers/authenticationController");
const userController = require("./../controllers/userController");

// Define routes for handling user authentication
router.post("/register", authenticationController.register);
router.post("/login", authenticationController.login);
// router.get("/logout", authenticationController.logout);

// Define routes for handling password reset
// router.post("/forgotPassword", authenticationController.forgotPassword);
// router.patch("/resetPassword/:token", authenticationController.resetPassword);

// Define routes for handling user resources
router
  .route("/")
  .get(authenticationController.protect, userController.getAllUsers);

module.exports = router;

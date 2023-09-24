// Import the Express module and create a new router instance
const express = require("express");
const router = express.Router();

// Import the authentication and user controllers
const authController = require("../controllers/authController");
const userController = require("./../controllers/userController");

// Define routes for handling user authentication
router.post("/register", authController.register);
router.post("/login", authController.login);
// router.get("/logout", authController.logout);
// Define routes for handling password reset
// router.post("/forgotPassword", authController.forgotPassword);
// router.patch("/resetPassword/:token", authController.resetPassword);

// From here on, all routes require authentication
router.use(authController.protect);

// Define routes for handling user resources
router.route("/").get(userController.getAllUsers);

module.exports = router;

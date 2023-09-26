// Import the Express module and create a new router instance
const express = require("express");
const router = express.Router();

// Import the authentication and user controllers
const authController = require("../controllers/authController");
const userController = require("./../controllers/userController");

// PUBLIC ROUTES
router.post("/register", authController.register);
router.post("/login", authController.login);
// router.get("/logout", authController.logout);
router.post("/forgotPassword", authController.forgotPassword);
router.patch("/resetPassword/:token", authController.resetPassword);

// From here on, all routes require authentication
router.use(authController.protect);

// PROTECTED ROUTES (Only logged-in users can access these routes)
router.get("/me", userController.getMe); // Get current user
router.patch("/updateMe", userController.updateMe); // Update current user
router.patch("/updatePassword", authController.updatePassword); // Update user password
router.delete("/deleteMe", userController.deleteMe); // Delete current user
// router.get("/me/events", userController.myEvents); // Get events user has joined or created

// From here on, all routes require admin authorization
router.use(authController.restrictTo("admin"));

// ADMIN ROUTES (Only admins can access these routes)
router.route("/").get(userController.getAllUsers); // Get all users

router
  .route("/:id")
  .get(userController.getSingleUser) // Get a single user by ID
  .patch(userController.updateUser) // Update a user by ID
  .delete(userController.deleteUser); // Delete a user by ID

module.exports = router;

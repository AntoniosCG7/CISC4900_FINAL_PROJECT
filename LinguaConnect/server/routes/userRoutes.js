// Import the Express module and create a new router instance
const express = require("express");
const router = express.Router();
const multer = require("multer");
const { storage } = require("./../cloudinary");
const upload = multer({ storage });

// Import the authentication and user controllers
const authController = require("./../controllers/authController");
const userController = require("./../controllers/userController");

// PUBLIC ROUTES
router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/forgotPassword", authController.forgotPassword);
router.patch("/resetPassword/:token", authController.resetPassword);

// From here on, all routes require authentication
router.use(authController.protect);

// PROTECTED ROUTES (Only logged-in users can access these routes)
router.get("/logout", authController.logout);
router.post(
  "/createProfile",
  upload.single("profilePicture"),
  userController.createProfile
); // Create a user profile
router.get("/", userController.getAllUsers); // Get all users
router.get("/me", userController.getMe); // Get current user
router.get("/activeChatUsers", userController.getActiveChatUsers); // Get active users a user has chatted with
router.get("/:id", userController.getSingleUser); // Get a single user by ID
router.patch(
  "/updateMe",
  upload.fields([{ name: "profilePicture", maxCount: 1 }]),
  userController.updateMe
); // Update current user
router.post(
  "/uploadPhotos",
  upload.fields([{ name: "photos", maxCount: 10 }]),
  userController.uploadUserPhotos
); // Upload photos to current user
router.post("/deletePhoto", userController.deleteUserPhoto); // Delete photo from current user
router.patch("/updatePassword", authController.updatePassword); // Update user password
router.delete("/deleteMe", userController.deleteMe); // Delete current user
// router.get("/me/events", userController.myEvents); // Get events user has joined or created

// From here on, all routes require admin authorization
router.use(authController.restrictTo("admin"));

// ADMIN ROUTES (Only admins can access these routes)
router
  .route("/:id")
  .patch(userController.updateUser) // Update a user by ID
  .delete(userController.deleteUser); // Delete a user by ID

module.exports = router;

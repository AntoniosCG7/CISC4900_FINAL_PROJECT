const express = require("express");
const router = express.Router();
const eventController = require("../controllers/eventController");
const authController = require("../controllers/authController");
const multer = require("multer");
const upload = multer();
const socketMiddleware = require("./../utils/socketMiddleware");

router.use(authController.protect); // Protect all routes after this middleware

router.post("/", upload.none(), eventController.createEvent, socketMiddleware); // Create a new event
router.get("/user/:userId", eventController.getUserEvents); // Get all events related to a specific user
router.get("/", eventController.getAllEvents); // Get all events
router.get("/:id", eventController.getEvent); // Get a specific event
router.put(
  "/:id",
  upload.none(),
  eventController.updateEvent,
  socketMiddleware
); // Update an event
router.delete("/:id", eventController.deleteEvent, socketMiddleware); // Delete an event

module.exports = router;

const express = require("express");
const router = express.Router();
const eventController = require("../controllers/eventController");
const authController = require("../controllers/authController");
const multer = require("multer");
const upload = multer();
const socketMiddleware = require("./../utils/socketMiddleware");

router.use(authController.protect); // Protect all routes after this middleware

router.post("/", upload.none(), eventController.createEvent, socketMiddleware); // Create a new event
router.post(
  "/updateUserEventStatus",
  eventController.updateUserEventStatus,
  socketMiddleware
); // Update the status of a user's event
router.get("/user/:userId", eventController.getUserEvents); // Get all events related to a specific user
router.get("/", eventController.getAllEvents); // Get all events
router.get("/:id", eventController.getEvent); // Get a specific event
router.put(
  "/:id",
  upload.none(),
  eventController.updateEvent,
  socketMiddleware
); // Update an event
router.delete(
  "/removeEvent/:id",
  eventController.removeEventFromUserList,
  socketMiddleware
); // Remove an event from the user's list
router.delete("/:id", eventController.deleteEvent, socketMiddleware); // Delete an event

module.exports = router;

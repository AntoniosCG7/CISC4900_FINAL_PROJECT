const express = require("express");
const router = express.Router();
const eventController = require("../controllers/eventController");
const authController = require("../controllers/authController");
const multer = require("multer");
const upload = multer();

router.use(authController.protect); // Protect all routes after this middleware

router.post("/", upload.none(), eventController.createEvent); // Create a new event
router.get("/", eventController.getAllEvents); // Get all events
router.get("/:id", eventController.getEvent); // Get a specific event
router.put("/:id", eventController.updateEvent); // Update an event
router.delete("/:id", eventController.deleteEvent); // Delete an event

module.exports = router;

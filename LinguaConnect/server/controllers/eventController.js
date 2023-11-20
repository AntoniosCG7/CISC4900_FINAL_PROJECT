const Event = require("../models/eventModel");
const User = require("../models/userModel");
const Language = require("../models/languageModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

// Create a new event
exports.createEvent = catchAsync(async (req, res, next) => {
  const { title, description, date, time, location, languages } = req.body;

  // Add the user who created the event
  const createdBy = req.user._id;

  // Add the languages to the event
  const languageNames = req.body.languages;
  const languageDocs = await Language.find({ name: { $in: languageNames } });
  const languageIds = languageDocs.map((doc) => doc._id);

  // Prepare location object
  let locationObj = {};
  if (location) {
    const { coordinates, address } = location;
    locationObj = {
      type: "Point",
      coordinates: coordinates ? coordinates.split(",").map(Number) : [],
      address: address || "",
    };
  }

  const newEvent = await Event.create({
    createdBy,
    title,
    description,
    date,
    time,
    languages: languageIds,
    location: locationObj,
  });

  // Populate the languages and createdBy fields in the new event
  await newEvent.populate("languages createdBy");

  // Add the event to the user's events array
  await User.findByIdAndUpdate(createdBy, {
    $push: { events: { event: newEvent._id, relationship: "created" } },
  });

  // Store the event and action type in res.locals
  res.locals.event = newEvent;
  res.locals.action = "created";
  res.locals.success = true;

  next(); // Pass control to the next middleware
});

// Update an event
exports.updateEvent = catchAsync(async (req, res, next) => {
  const eventId = req.params.id;
  const { title, description, date, time, location, languages } = req.body;

  // Convert language names to ObjectIds
  const languageNames = languages; // Assuming languages is an array of strings
  const languageDocs = await Language.find({ name: { $in: languageNames } });
  const languageIds = languageDocs.map((doc) => doc._id);

  // Prepare location object if needed
  let locationObj = {};
  if (location) {
    const { coordinates, address } = location;
    locationObj = {
      type: "Point",
      coordinates: coordinates ? coordinates.split(",").map(Number) : [],
      address: address || "",
    };
  }

  // Update the event
  const updatedEvent = await Event.findByIdAndUpdate(
    eventId,
    {
      title,
      description,
      date,
      time,
      languages: languageIds,
      location: locationObj,
    },
    { new: true, runValidators: true }
  ).populate("languages createdBy");

  if (!updatedEvent) {
    return next(new AppError("No event found with that ID", 404));
  }

  // Store the updated event and action type in res.locals
  res.locals.event = updatedEvent;
  res.locals.action = "updated";
  res.locals.success = true;

  next(); // Pass control to the next middleware
});

// Delete an event
exports.deleteEvent = catchAsync(async (req, res, next) => {
  const event = await Event.findByIdAndDelete(req.params.id);

  // Delete the event from the user's events array
  await User.findByIdAndUpdate(req.user._id, {
    $pull: { events: { event: event._id } },
  });

  if (!event) {
    return next(new AppError("No event found with that ID", 404));
  }

  // Store the deleted event ID and action type in res.locals
  res.locals.eventId = req.params.id;
  res.locals.action = "deleted";
  res.locals.success = true;

  next(); // Pass control to the next middleware
});

// Get all events related to a specific user
exports.getUserEvents = catchAsync(async (req, res, next) => {
  const userId = req.params.userId;

  // Fetch the user along with the populated events
  const userWithEvents = await User.findById(userId).populate({
    path: "events.event",
    populate: [
      { path: "languages", model: "Language" },
      { path: "createdBy", model: "User" },
    ],
  });

  if (!userWithEvents) {
    return next(new AppError("No user found with that ID", 404));
  }

  // Extract and format the events
  const allUserEvents = userWithEvents.events.map((eventObj) => {
    return {
      ...eventObj.event._doc, // Event details
      relationship: eventObj.relationship, // Relationship with the event
    };
  });

  res.status(200).json({
    status: "success",
    data: {
      events: allUserEvents,
    },
  });
});

// Get all events
exports.getAllEvents = catchAsync(async (req, res, next) => {
  const events = await Event.find().populate("languages createdBy");
  res.status(200).json({
    status: "success",
    data: {
      events,
    },
  });
});

// Get a single event
exports.getEvent = catchAsync(async (req, res, next) => {
  const event = await Event.findById(req.params.id).populate(
    "languages createdBy date time"
  );

  if (!event) {
    return next(new AppError("No event found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      event,
    },
  });
});

module.exports = exports;

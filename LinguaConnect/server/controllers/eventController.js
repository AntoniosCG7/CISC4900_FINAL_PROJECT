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

  res.status(201).json({
    status: "success",
    data: {
      event: newEvent,
    },
  });
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
    "languages createdBy"
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

// Update an event
exports.updateEvent = catchAsync(async (req, res, next) => {
  const updatedEvent = await Event.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!updatedEvent) {
    return next(new AppError("No event found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      event: updatedEvent,
    },
  });
});

// Delete an event
exports.deleteEvent = catchAsync(async (req, res, next) => {
  const event = await Event.findByIdAndDelete(req.params.id);

  if (!event) {
    return next(new AppError("No event found with that ID", 404));
  }

  res.status(204).send();
});

module.exports = exports;

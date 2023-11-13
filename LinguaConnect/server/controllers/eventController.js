const Event = require("../models/eventModel");
const User = require("../models/userModel");
const Language = require("../models/languageModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

// Create a new event
exports.createEvent = catchAsync(async (req, res, next) => {
  const { title, description, date, time, location, languages } = req.body;

  console.log("req.body in createEvent(): ", req.body);

  // Add the user who created the event
  const createdBy = req.user._id;

  // Add the languages to the event
  const languageNames = req.body.languages;
  const languageDocs = await Language.find({ name: { $in: languageNames } });
  const languageIds = languageDocs.map((doc) => doc._id);

  const newEvent = await Event.create({
    createdBy,
    title,
    description,
    date,
    time,
    languages: languageIds,
  });

  // Add the event to the user's events array
  // await User.findByIdAndUpdate(createdBy, {
  //   $push: { events: { event: newEvent._id, relationship: "created" } },
  // });

  res.status(201).json({
    status: "success",
    data: {
      event: newEvent,
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

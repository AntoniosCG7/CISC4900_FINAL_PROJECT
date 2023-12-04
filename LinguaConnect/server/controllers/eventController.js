const Event = require("../models/eventModel");
const User = require("../models/userModel");
const Language = require("../models/languageModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const moment = require("moment");

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
  const languageNames = languages;
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

// Update the status of a user's event
exports.updateUserEventStatus = catchAsync(async (req, res, next) => {
  const { eventId, userId, status } = req.body;

  // Check if the event exists
  const event = await Event.findById(eventId);
  if (!event) {
    return next(new AppError("No event found with that ID", 404));
  }

  // Prevent the creator of the event from changing their status
  if (event.createdBy.toString() === userId) {
    return res.status(403).json({
      status: "info",
      message: "You cannot change your status for an event you have created.",
    });
  }

  // Fetch the user and check their current status for the event
  const user = await User.findById(userId);
  const existingEvent = user.events.find((e) => e.event.toString() === eventId);

  let actionTaken = "";
  if (existingEvent) {
    if (existingEvent.relationship === status) {
      return res.status(200).json({
        status: "info",
        message: `You have already marked yourself as ${status} for this event.`,
      });
    }
    existingEvent.relationship = status;
    actionTaken = "statusUpdated";
  } else {
    user.events.push({ event: eventId, relationship: status });
    actionTaken = "statusAdded";
  }

  // Update the event's 'going' and 'interested' arrays
  if (status === "going") {
    event.interested.pull(userId);
    event.going.addToSet(userId);
  } else if (status === "interested") {
    event.going.pull(userId);
    event.interested.addToSet(userId);
  }

  await user.save({ validateBeforeSave: false });
  await event.save();

  // Store the necessary information in res.locals for the middleware
  res.locals.event = event;
  res.locals.user = user;
  res.locals.action = actionTaken; // 'statusUpdated' or 'statusAdded'
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

// Remove an event from the user's list
exports.removeEventFromUserList = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const eventId = req.params.id;

  // Update the user document by pulling the event from their events array
  await User.findByIdAndUpdate(userId, {
    $pull: { events: { event: eventId } },
  });

  // Update the event document by pulling the user from the 'going' and 'interested' arrays
  const event = await Event.findById(eventId);
  const wasGoing = event.going.includes(userId);
  const wasInterested = event.interested.includes(userId);

  event.going.pull(userId);
  event.interested.pull(userId);
  await event.save();

  // Store the necessary info in res.locals
  res.locals.event = event;
  res.locals.eventId = eventId;
  res.locals.userId = userId;
  res.locals.action = "removed";
  res.locals.success = true;
  res.locals.wasGoing = wasGoing;
  res.locals.wasInterested = wasInterested;

  next(); // Pass control to the next middleware
});

// Get all events related to a specific user
exports.getUserEvents = catchAsync(async (req, res, next) => {
  const userId = req.params.userId;
  const currentDate = moment().startOf("day").toDate();

  const userWithEvents = await User.findById(userId).populate({
    path: "events.event",
    match: { date: { $gte: currentDate } }, // Filter out past events
    populate: [
      { path: "languages", model: "Language" },
      { path: "createdBy", model: "User" },
      { path: "going", model: "User" },
      { path: "interested", model: "User" },
    ],
  });

  if (!userWithEvents) {
    return next(new AppError("No user found with that ID", 404));
  }

  // Filter out null events (in case an event was deleted but still referenced in the user's events)
  const validUserEvents = userWithEvents.events.filter(
    (eventObj) => eventObj.event
  );

  const allUserEvents = validUserEvents.map((eventObj) => ({
    ...eventObj.event._doc,
    relationship: eventObj.relationship,
    goingCount: eventObj.event.going.length,
    interestedCount: eventObj.event.interested.length,
  }));

  res.status(200).json({
    status: "success",
    data: {
      events: allUserEvents,
    },
  });
});

// Get all events happening today or later
exports.getAllEvents = catchAsync(async (req, res, next) => {
  const currentDate = moment().startOf("day").toDate();

  const events = await Event.find({
    date: { $gte: currentDate },
  }).populate("languages createdBy going interested");

  const eventsWithCounts = events.map((event) => ({
    ...event.toObject(),
    goingCount: event.going.length,
    interestedCount: event.interested.length,
  }));

  res.status(200).json({
    status: "success",
    data: {
      events: eventsWithCounts,
    },
  });
});

// Get a single event
exports.getEvent = catchAsync(async (req, res, next) => {
  const event = await Event.findById(req.params.id).populate(
    "languages createdBy going interested"
  );

  if (!event) {
    return next(new AppError("No event found with that ID", 404));
  }

  const eventWithCounts = {
    ...event.toObject(),
    goingCount: event.going.length,
    interestedCount: event.interested.length,
  };

  res.status(200).json({
    status: "success",
    data: {
      event: eventWithCounts,
    },
  });
});

module.exports = exports;

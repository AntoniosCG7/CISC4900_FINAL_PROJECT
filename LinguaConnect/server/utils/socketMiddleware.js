const { ioData, currentlyActiveUsers } = require("./socketSetup");
const Chat = require("../models/chatModel");
const Event = require("../models/eventModel");
const catchAsync = require("./catchAsync");

// ========= Utility Functions =========

// Utility function to get the socket ID of a user
const getSocketIdOfUser = (userId) => {
  // Loop through the currentlyActiveUsers object to find the socket ID of the user
  for (let [socketId, id] of Object.entries(currentlyActiveUsers)) {
    if (id.toString() === userId.toString()) return socketId;
  }
  return null;
};

// ========= Emit Events Functions =========

// Create a new chat event
const handleChatCreation = async (res) => {
  // Get the chat from the response
  const chat = res.locals.chat;

  // Get the socket ID of the recipient
  const recipientSocketId = getSocketIdOfUser(chat.user2.id);

  // Emit the new chat event to the recipient
  if (recipientSocketId) {
    ioData.io.to(recipientSocketId).emit("newChatInitiated", chat);
    ioData.io.emit("user-status-change");
  }

  res.status(201).json({
    status: "success",
    data: {
      chat: res.locals.chat,
    },
  });
};

// Send a new message event
const handleNewMessage = async (res) => {
  // Get the message from the response
  const message = res.locals.message;

  // Find the chat that the message belongs to
  const chat = await Chat.findById(message.chat)
    .populate("user1")
    .populate("user2");

  // Update the lastMessageTimestamp of the chat
  const updatedChat = await Chat.findByIdAndUpdate(
    message.chat,
    { lastMessageTimestamp: message.timestamp },
    { new: true }
  );

  // Get the ID of the recipient
  const recipientId =
    message.sender._id.toString() === chat.user1._id.toString()
      ? chat.user2._id
      : chat.user1._id;

  // Get the socket ID of the recipient
  const recipientSocketId = getSocketIdOfUser(recipientId);

  // Emit the new message event to the recipient
  if (recipientSocketId) {
    ioData.io.to(recipientSocketId).emit("new-message", message);
  } else {
    console.error("Couldn't find a socket ID for recipient:", recipientId);
  }

  res.status(201).json({
    status: "success",
    data: {
      message: res.locals.message,
    },
  });
};

// Emit new event to all connected users
const handleEventCreation = async (res) => {
  const event = res.locals.event;

  // Emit the new event to all connected users
  ioData.io.emit("new-event-created", event);

  res.status(201).json({
    status: "success",
    data: {
      event: event,
    },
  });
};

// Emit updated event to all connected users
const handleEventUpdate = async (res) => {
  const event = res.locals.event;

  // Check if event update was successful
  if (res.locals.success && event) {
    ioData.io.emit("event-updated", event);
  }

  res.status(200).json({
    status: "success",
    data: {
      event: event,
    },
  });
};

// Emit updated user event status to all connected users
const handleUserEventStatusUpdate = async (res) => {
  if (
    res.locals.success &&
    (res.locals.action === "statusUpdated" ||
      res.locals.action === "statusAdded")
  ) {
    const event = res.locals.event;
    const user = res.locals.user;

    // Fetch the updated event with full population
    const updatedEvent = await Event.findById(event._id)
      .populate({
        path: "going",
        model: "User",
        select: "_id",
      })
      .populate({
        path: "interested",
        model: "User",
        select: "_id",
      })
      .populate({
        path: "createdBy",
        model: "User",
        select: "profilePicture",
      })
      .populate("languages");

    const emitData = {
      event: {
        ...updatedEvent.toObject(),
        goingCount: updatedEvent.going.length,
        interestedCount: updatedEvent.interested.length,
      },
      user,
      status: user.events.find(
        (e) => e.event.toString() === event._id.toString()
      ).relationship,
    };

    // Emit the updated data to all connected users
    ioData.io.emit("user-event-status-changed", emitData);

    res.status(200).json({
      status: "success",
      message: "Event status updated successfully",
      data: {
        event: updatedEvent,
      },
    });
  }
};

// Emit event removal to all connected users
const handleEventRemoval = async (res) => {
  const { eventId, event } = res.locals;

  // Fetch the updated event to get the latest 'going' and 'interested' counts
  const updatedEvent = await Event.findById(eventId);

  if (res.locals.success && updatedEvent) {
    ioData.io.emit("event-removed", {
      event: event,
      eventId: eventId,
      goingCount: updatedEvent.going.length,
      interestedCount: updatedEvent.interested.length,
    });
  }

  res.status(200).send();
};

// Emit event deletion to all connected users
const handleEventDeletion = async (res) => {
  const eventId = res.locals.eventId;
  const eventTitle = res.locals.eventTitle;
  const eventCreatorId = res.locals.eventCreatorId;

  // Check if event deletion was successful
  if (res.locals.success && eventId) {
    ioData.io.emit("event-deleted", { eventId, eventCreatorId, eventTitle });
  }

  res.status(204).send();
};

// ========= Main Event Emitter Function =========

const emitEvents = catchAsync(async (req, res, next) => {
  if (
    res.locals.success &&
    res.locals.event &&
    res.locals.action === "created"
  ) {
    await handleEventCreation(res);
  } else if (
    res.locals.success &&
    res.locals.event &&
    res.locals.action === "updated"
  ) {
    await handleEventUpdate(res);
  } else if (
    res.locals.success &&
    res.locals.user &&
    (res.locals.action === "statusUpdated" ||
      res.locals.action === "statusAdded")
  ) {
    await handleUserEventStatusUpdate(res);
  } else if (
    res.locals.success &&
    res.locals.eventId &&
    res.locals.action === "removed"
  ) {
    await handleEventRemoval(res);
  } else if (
    res.locals.success &&
    res.locals.eventId &&
    res.locals.action === "deleted"
  ) {
    await handleEventDeletion(res);
  } else if (
    res.locals.success &&
    res.locals.chat &&
    res.locals.action === "created"
  ) {
    await handleChatCreation(res);
  } else if (
    res.locals.success &&
    res.locals.message &&
    res.locals.action === "messageSent"
  ) {
    await handleNewMessage(res);
  } else {
    next();
  }
});

module.exports = emitEvents;

const User = require("../models/userModel");
const Chat = require("../models/chatModel");
const Message = require("../models/messageModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

// Create a new chat
exports.createChat = catchAsync(async (req, res, next) => {
  // Extract the sender and receiver IDs from the request body
  const { senderId: user1, receiverId: user2 } = req.body;

  // Ensure users are not the same
  if (user1 === user2) {
    return next(
      new AppError("A user cannot initiate a chat with themselves.", 400)
    );
  }

  // Fetch complete user details for user1 and user2
  const [user1Details, user2Details] = await Promise.all([
    User.findById(user1),
    User.findById(user2),
  ]);

  // Ensure both users exist
  if (!user1Details || !user2Details) {
    return next(new AppError("One or both users do not exist.", 400));
  }

  // Check if chat already exists between the two users
  const chat = await Chat.findOne({
    $or: [
      { user1: user1Details._id, user2: user2Details._id },
      { user1: user2Details._id, user2: user1Details._id },
    ],
  });

  // If chat already exists, return an error
  if (chat) {
    return next(new AppError("Chat already exists.", 400));
  }

  // Create a new chat using the user IDs
  const newChat = await Chat.create({
    user1: user1Details._id,
    user2: user2Details._id,
  });

  // Fetch the newly created chat with populated user details
  const populatedChat = await Chat.findById(newChat._id)
    .populate("user1")
    .populate("user2");

  // Store the populated chat and the action type in res.locals
  res.locals.chat = populatedChat;
  res.locals.action = "created";
  res.locals.success = true;

  next(); // Pass control to the next middleware
});

// Get all chats for a user
exports.listChatsForUser = catchAsync(async (req, res, next) => {
  const { userId } = req.params;

  const chats = await Chat.find({
    $or: [{ user1: userId }, { user2: userId }],
  })
    .sort({ lastMessageTimestamp: -1 }) // Sorting by lastMessageTimestamp in descending order
    .populate({
      path: "user1",
      select:
        "firstName lastName profilePicture languages.native languages.fluent languages.learning",
      populate: [
        {
          path: "languages.native",
          model: "Language",
          select: "name",
        },
        {
          path: "languages.fluent",
          model: "Language",
          select: "name",
        },
        {
          path: "languages.learning",
          model: "Language",
          select: "name",
        },
      ],
    })
    .populate({
      path: "user2",
      select:
        "firstName lastName profilePicture languages.native languages.fluent languages.learning",
      populate: [
        {
          path: "languages.native",
          model: "Language",
          select: "name",
        },
        {
          path: "languages.fluent",
          model: "Language",
          select: "name",
        },
        {
          path: "languages.learning",
          model: "Language",
          select: "name",
        },
      ],
    });

  // Loop through each chat and fetch the most recent message
  for (let chat of chats) {
    const recentMessage = await Message.findOne({ chat: chat._id })
      .sort({ timestamp: -1 })
      .limit(1);

    chat._doc.recentMessage = recentMessage; // Add the recentMessage to the chat object
  }

  res.status(200).json(chats);
});

// Get chat between two users
exports.getChat = catchAsync(async (req, res, next) => {
  const { user1Id, user2Id } = req.params;

  const chat = await Chat.findOne({
    $or: [
      { user1: user1Id, user2: user2Id },
      { user1: user2Id, user2: user1Id },
    ],
  });

  if (!chat) {
    return next(new AppError("Chat not found.", 404));
  }

  res.status(200).json(chat);
});

// Delete a chat
exports.deleteChat = catchAsync(async (req, res, next) => {
  const { chatId } = req.params;

  const chat = await Chat.findById(chatId);

  if (!chat) {
    return next(new AppError("Chat not found.", 404));
  }

  await chat.remove();
  res.status(204).send();
});

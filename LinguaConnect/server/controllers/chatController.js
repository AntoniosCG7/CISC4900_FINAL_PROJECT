const Chat = require("../models/chatModel");
const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

// Create a new chat
exports.createChat = catchAsync(async (req, res, next) => {
  const { senderId: user1, receiverId: user2 } = req.body;

  // Ensure users are not the same
  if (user1 === user2) {
    return next(
      new AppError("A user cannot initiate a chat with themselves.", 400)
    );
  }

  // Check if both users exist in the database
  const usersExist = await Promise.all([
    User.exists({ _id: user1 }),
    User.exists({ _id: user2 }),
  ]);

  if (!usersExist[0] || !usersExist[1]) {
    return next(new AppError("One or both users do not exist.", 400));
  }

  // Check if chat already exists
  const chat = await Chat.findOne({
    $or: [
      { user1, user2 },
      { user1: user2, user2: user1 },
    ],
  });

  if (chat) {
    return next(new AppError("Chat already exists.", 400));
  }

  const newChat = await Chat.create({ user1, user2 });
  res.status(201).json({
    status: "success",
    data: {
      chat: newChat,
    },
  });
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

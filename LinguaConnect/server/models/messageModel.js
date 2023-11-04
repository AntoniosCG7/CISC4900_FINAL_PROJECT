const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  chat: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Chat",
    required: true,
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  imageUrl: {
    type: String,
    default: null,
  },
  content: {
    type: String,
    required: function () {
      return !this.imageUrl; // Content is required if imageUrl is not provided
    },
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  delivered: {
    type: Date,
    default: null,
  },
  read: {
    type: Date,
    default: null,
  },
});

const Message = mongoose.model("Message", messageSchema);

module.exports = Message;

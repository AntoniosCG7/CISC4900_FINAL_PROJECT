const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema({
  participants: [
    {
      user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    },
  ],
  messages: [
    {
      sender_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      content: String,
      timestamp: Date,
    },
  ],
});

const Chat = mongoose.model("Chat", chatSchema);

module.exports = Chat;

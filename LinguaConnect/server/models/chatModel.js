const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const chatSchema = new Schema(
  {
    user1: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    user2: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    lastMessageTimestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Middleware to update 'lastMessageTimestamp' on save
chatSchema.pre("save", function (next) {
  this.lastMessageTimestamp = Date.now();
  next();
});

const Chat = mongoose.model("Chat", chatSchema);
module.exports = Chat;

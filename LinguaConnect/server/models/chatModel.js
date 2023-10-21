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
  },
  { timestamps: true }
);

// Middleware to update 'updated_at' on save
chatSchema.pre("save", function (next) {
  this.updated_at = Date.now();
  next();
});

const Chat = mongoose.model("Chat", chatSchema);
module.exports = Chat;

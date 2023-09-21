const mongoose = require("mongoose");

const userEventCategorySchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  event_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event",
    required: true,
  },
  category_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "EventCategory",
    required: true,
  },
});

const UserEventCategory = mongoose.model(
  "UserEventCategory",
  userEventCategorySchema
);

module.exports = UserEventCategory;

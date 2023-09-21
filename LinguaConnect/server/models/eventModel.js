const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  organizer_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  title: String,
  description: String,
  date: Date,
  languages: [String],
  attendees: [
    {
      user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      status: String, // 'attending' or 'interested'
    },
  ],
});

const Event = mongoose.model("Event", eventSchema);

module.exports = Event;

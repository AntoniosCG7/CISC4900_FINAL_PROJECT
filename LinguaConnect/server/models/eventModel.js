const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  title: { type: String, required: [true, "An event must have a title"] },

  description: {
    type: String,
    required: [true, "An event must have a description"],
  },

  date: { type: Date, required: [true, "An event must have a date"] },

  languages: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Language",
    },
  ],

  attendees: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      status: String, // 'attending' or 'interested'
    },
  ],

  location: {
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
      index: "2dsphere", // to support geospatial queries
    },
    city: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: true,
    },
    address: String,
  },
});

const Event = mongoose.model("Event", eventSchema);

module.exports = Event;

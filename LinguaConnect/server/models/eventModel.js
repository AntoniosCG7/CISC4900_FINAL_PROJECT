const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "An event must have a creator"],
    },

    title: {
      type: String,
      required: [true, "An event must have a title"],
      trim: true,
    },

    description: {
      type: String,
      required: [true, "An event must have a description"],
    },

    date: {
      type: Date,
      required: [true, "An event must have a date"],
    },

    time: {
      type: String,
      required: [true, "An event must have a time"],
    },

    languages: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Language",
        required: [true, "An event must have at least one language"],
      },
    ],

    attendees: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    interested: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    location: {
      type: {
        type: String,
        default: "Point",
      },
      coordinates: {
        type: [Number],
        required: true,
        index: "2dsphere",
      },
      address: String,
    },
  },
  {
    timestamps: true,
  }
);

const Event = mongoose.model("Event", eventSchema);

module.exports = Event;

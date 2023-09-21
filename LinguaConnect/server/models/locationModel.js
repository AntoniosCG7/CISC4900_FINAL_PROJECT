const mongoose = require("mongoose");

const locationSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  coordinates: {
    type: {
      type: String,
      default: "Point",
    },
    coordinates: [Number],
  },
});

const Location = mongoose.model("Location", locationSchema);

module.exports = Location;

const mongoose = require("mongoose");

const photoSchema = new mongoose.Schema({
  url: String,
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
});

module.exports = mongoose.model("Photo", photoSchema);

const mongoose = require("mongoose");

const eventCategorySchema = new mongoose.Schema({
  name: String, // 'Created by User', 'Attending', 'Interested'
});

const EventCategory = mongoose.model("EventCategory", eventCategorySchema);

module.exports = EventCategory;

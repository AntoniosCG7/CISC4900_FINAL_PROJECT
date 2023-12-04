const cron = require("node-cron");
const moment = require("moment");
const Event = require("../models/eventModel");

const deletePastEvents = () => {
  cron.schedule("0 0 * * *", async () => {
    const currentDate = moment().startOf("day").toDate();
    console.log("Current Date for Deletion:", currentDate);

    try {
      const result = await Event.deleteMany({
        date: { $lt: currentDate },
      });
      console.log("Deleted past events, count:", result.deletedCount);
    } catch (err) {
      console.error("Error deleting past events:", err);
    }
  });
};

module.exports = deletePastEvents;

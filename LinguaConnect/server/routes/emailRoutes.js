const express = require("express");
const router = express.Router();
const Email = require("../utils/email");

router.post("/contact", async (req, res) => {
  try {
    const { name, email, message } = req.body;
    const emailInstance = new Email({ email: process.env.EMAIL_FROM });

    await emailInstance.sendContactForm(name, email, message);

    res.status(200).json({ message: "Message sent successfully" });
  } catch (error) {
    console.error("Error in sending email: ", error);
    res
      .status(500)
      .json({ message: "Error sending message", error: error.message });
  }
});

module.exports = router;

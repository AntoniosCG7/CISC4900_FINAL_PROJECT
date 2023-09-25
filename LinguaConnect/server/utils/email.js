const nodemailer = require("nodemailer");
const catchAsync = require("./catchAsync");

// Define a function for sending emails
const sendEmail = catchAsync(async (options) => {
  // Create a new nodemailer transporter with the provided email settings
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  // Define the email options
  const mailOptions = {
    from: "LinguaConnect <linguaconnect@gmail.com>",
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  // Send the email using the transporter and the mail options
  await transporter.sendMail(mailOptions);
});

module.exports = sendEmail;

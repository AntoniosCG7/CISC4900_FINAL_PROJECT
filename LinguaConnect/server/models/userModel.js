const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
    lowercase: true,
    validate: [validator.isEmail, "Please provide a valid email"],
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
  },
  profilePicture: {
    type: String,
    required: true,
  },
  // Languages Section
  languages: {
    native: [
      {
        type: Schema.Types.ObjectId,
        ref: "Language",
      },
    ],
    fluent: [
      {
        type: Schema.Types.ObjectId,
        ref: "Language",
      },
    ],
    learning: [
      {
        type: Schema.Types.ObjectId,
        ref: "Language",
      },
    ],
  },
  // About Section
  about: {
    talkAbout: {
      type: String,
      maxlength: [250, "Your answer must be less or equal to 250 characters"],
    },
    perfectPartner: {
      type: String,
      maxlength: [250, "Your answer must be less or equal to 250 characters"],
    },
    learningGoals: {
      type: String,
      maxlength: [250, "Your answer must be less or equal to 250 characters"],
    },
  },
  // Photos Section
  photos: [
    {
      type: Schema.Types.ObjectId,
      ref: "Photo",
    },
  ],
  location: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Location",
  },
});

// Encrypt the password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare hashed passwords for login
userSchema.methods.comparePassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

const User = mongoose.model("User", userSchema);

module.exports = User;

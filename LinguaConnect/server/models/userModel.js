const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
    required: [true, "Please provide a username"],
  },
  email: {
    type: String,
    unique: true,
    required: [true, "Please provide your email address"],
    lowercase: true,
    validate: [validator.isEmail, "Please provide a valid email"],
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
    select: false, // Exclude the password field by default
  },
  passwordConfirm: {
    type: String,
    required: [true, "Please confirm your password"],
    validate: {
      // This only works on CREATE and SAVE
      validator: function (el) {
        return el === this.password;
      },
      message: "Passwords are not the same",
    },
  },
  profilePicture: {
    type: String,
    default: "default.jpg",
  },
  // Languages Section
  languages: {
    native: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Language",
        },
      ],
      validate: [
        (arr) => arr.length > 0,
        "Specify at least one native language",
      ],
      required: [true, "Native language field is required"],
    },
    fluent: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Language",
        },
      ],
      validate: [
        (arr) => arr.length > 0,
        "Specify at least one fluent language",
      ],
      required: [true, "Fluent language field is required"],
    },
    learning: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Language",
        },
      ],
      validate: [
        (arr) => arr.length > 0,
        "Specify at least one learning language",
      ],
      required: [true, "Learning language field is required"],
    },
  },
  // About Section
  about: {
    talkAbout: {
      type: String,
      required: [true, "Please specify what you like to talk about"],
      maxlength: [250, "Your answer must be less or equal to 250 characters"],
    },
    perfectPartner: {
      type: String,
      required: [true, "Please specify your ideal LinguaConnect partner"],
      maxlength: [250, "Your answer must be less or equal to 250 characters"],
    },
    learningGoals: {
      type: String,
      required: [true, "Please specify your language learning goals"],
      maxlength: [250, "Your answer must be less or equal to 250 characters"],
    },
  },

  // Photos Section
  photos: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Photo",
    },
  ],
  location: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Location",
  },
});

// Hash the password before saving the user to the database
userSchema.pre("save", async function (next) {
  // Only hash the password if it has been modified or is new
  if (!this.isModified("password")) return next();

  try {
    // Generate a salt for the password hash
    const salt = await bcrypt.genSalt(10);

    // Hash the password using the salt
    this.password = await bcrypt.hash(this.password, salt);

    // Delete passwordConfirm field
    this.passwordConfirm = undefined;

    next();
  } catch (error) {
    next(error);
  }
});

// Compare hashed passwords for login
userSchema.methods.comparePassword = async function (
  candidatePassword,
  userPassword
) {
  return userPassword
    ? await bcrypt.compare(candidatePassword, userPassword)
    : false;
};

const User = mongoose.model("User", userSchema);

module.exports = User;

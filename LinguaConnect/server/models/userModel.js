const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const userSchema = new mongoose.Schema(
  {
    // Basic User Details
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

    // Personal Information
    firstName: {
      type: String,
      maxlength: [30, "Your first name must be less or equal to 30 characters"],
    },
    lastName: {
      type: String,
      maxlength: [50, "Your last name must be less or equal to 50 characters"],
    },
    dateOfBirth: {
      type: Date,
    },
    profilePicture: {
      type: String,
      default: "default.jpg",
    },

    // Language Proficiency
    languages: {
      native: {
        type: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Language",
          },
        ],
      },
      fluent: {
        type: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Language",
          },
        ],
      },
      learning: {
        type: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Language",
          },
        ],
      },
    },

    // About User
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

    // Additional Photos
    photos: [
      {
        type: String,
        validate: [arrayLimit, "You can only upload up to 10 photos"],
      },
    ],

    // User's Location
    location: {
      coordinates: {
        type: [Number], // [longitude, latitude]
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
    },

    events: [
      {
        event: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Event",
        },
        relationship: {
          type: String,
          enum: ["created", "attending", "interested"],
        },
      },
    ],

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    // Password management fields
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
      type: Boolean,
      default: false, // User must verify email address before account is active
      select: false, // Exclude the active field by default
    },
  },
  {
    timestamps: true, // This will add createdAt and updatedAt fields
  }
);

// Function to limit the number of photos uploaded
function arrayLimit(val) {
  return val.length <= 10;
}

// Middleware to hash password before saving
userSchema.pre("save", async function (next) {
  // Only hash the password if it has been modified or is new
  if (!this.isModified("password")) return next();

  // Generate a salt for the password hash
  this.password = await bcrypt.hash(this.password, 10);

  // Delete passwordConfirm field
  this.passwordConfirm = undefined;

  next();
});

// Method to compare passwords for login
userSchema.methods.comparePassword = async function (
  candidatePassword,
  userPassword
) {
  // Use bcrypt to compare the candidate password to the hashed user password
  return userPassword
    ? await bcrypt.compare(candidatePassword, userPassword)
    : false;
};

// Method to check if password was changed after a token was issued
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  // If the passwordChangedAt property exists, compare it to the JWT issue time
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp;
  }

  // False means NOT changed
  return false;
};

// Method to create a hashed password reset token
userSchema.methods.createPasswordResetToken = function () {
  // Generate a random token using crypto
  const resetToken = crypto.randomBytes(32).toString("hex");

  // Hash the token using sha256 and save it to the user document
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // Set the password reset token expiration time to 10 minutes from now
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  // Return the unhashed token to send in the password reset email
  return resetToken;
};

// Middleware to update `passwordChangedAt` timestamp when password changes
userSchema.pre("save", function (next) {
  // Only update the timestamp if the password has been modified and the document is not new
  if (!this.isModified("password") || this.isNew) return next();

  // Subtract 1 second from the current time to ensure the timestamp is earlier than the JWT issue time
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

const User = mongoose.model("User", userSchema);

module.exports = User;

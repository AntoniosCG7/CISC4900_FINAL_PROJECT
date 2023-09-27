const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

// Get all users
exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();

  res.status(200).json({
    status: "success",
    results: users.length,
    data: {
      users,
    },
  });
});

// Get a user
exports.getSingleUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new AppError("No user found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      user,
    },
  });
});

// Function to filter an object and only keep specified fields
function filterObj(obj, ...allowedFields) {
  const newObj = {};

  // A helper function to set a value at a given path within an object.
  // If any part of the path doesn't exist, it will be created.
  function setValue(targetObj, path, value) {
    const keys = path.split(".");
    let current = targetObj;

    // Navigate to the second last key in the path,
    // creating any missing objects along the way.
    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) {
        current[keys[i]] = {};
      }
      current = current[keys[i]];
    }

    // Set the value on the last key in the path.
    current[keys[keys.length - 1]] = value;
  }

  // Iterate over each allowed field to process it.
  allowedFields.forEach((field) => {
    if (field.includes(".")) {
      // This is a nested field.
      const keys = field.split(".");
      let current = obj;
      // Attempt to navigate to the depth specified by the field in the source object.
      for (let key of keys) {
        if (!current[key]) {
          // Part of the specified path doesn't exist in the source object.
          break;
        }
        current = current[key];
      }

      // If we navigated to the end of the keys array, the nested field exists.
      // So, we set its value in the result object.
      if (current !== obj) {
        setValue(newObj, field, current);
      }
    } else if (obj.hasOwnProperty(field)) {
      // This is a top-level field.
      newObj[field] = obj[field];
    }
  });

  return newObj;
}

// Update user profile details
exports.updateUser = catchAsync(async (req, res, next) => {
  // Create a filtered object containing only the fields that are allowed to be updated
  const filteredBody = filterObj(
    req.body,
    "username",
    "email",
    "firstName",
    "lastName",
    "dateOfBirth",
    "profilePicture",
    "languages.native",
    "languages.fluent",
    "languages.learning",
    "about.talkAbout",
    "about.perfectPartner",
    "about.learningGoals",
    "photos",
    "location.coordinates",
    "location.city",
    "location.country",
    "role",
    "active",
    "events"
  );

  const updatedUser = await User.findByIdAndUpdate(
    req.params.id,
    filteredBody,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!updatedUser) {
    return next(new AppError("No user found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      user: updatedUser,
    },
  });
});

// Delete a user
exports.deleteUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id);

  if (!user) {
    return next(new AppError("No user found with that ID", 404));
  }

  res.status(204).json({
    status: "success",
    data: null,
  });
});

// Get current user's data
exports.getMe = catchAsync(async (req, res, next) => {
  // Since the user is authenticated (protected route), req.user should contain the user's data.
  const user = await User.findById(req.user.id);

  // Respond with the user's data
  res.status(200).json({
    status: "success",
    data: {
      user,
    },
  });
});

// Update the current user's data
exports.updateMe = catchAsync(async (req, res, next) => {
  // 1. Check if user is trying to update their password
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        "This route is not for password updates. Please use the updatePassword route.",
        400
      )
    );
  }

  // 2. Create a filtered object containing only the fields that are allowed to be updated
  const filteredBody = filterObj(
    req.body,
    "username",
    "email",
    "firstName",
    "lastName",
    "dateOfBirth",
    "profilePicture",
    "languages.native",
    "languages.fluent",
    "languages.learning",
    "about.talkAbout",
    "about.perfectPartner",
    "about.learningGoals",
    "photos",
    "location.coordinates",
    "location.city",
    "location.country"
  );

  // 3. Update user document
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true, // This returns the modified document
    runValidators: true, // Validates the updated document before saving
  });

  // 4. Send the updated user data as a response
  res.status(200).json({
    status: "success",
    data: {
      user: updatedUser,
    },
  });
});

// Perform a "soft delete" on the current user
exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  // 204 status code means "No Content"
  res.status(204).json({
    status: "success",
    data: null,
  });
});

// Create a user profile
exports.createProfile = catchAsync(async (req, res, next) => {
  // Extract profile data from req.body
  const {
    firstName,
    lastName,
    dateOfBirth,
    profilePicture,
    languages,
    about,
    location,
    photos,
  } = req.body;

  // Update the user document
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      firstName,
      lastName,
      dateOfBirth,
      profilePicture,
      languages,
      about,
      location,
      photos,
      profileCompleted: true,
    },
    {
      new: true, // This returns the modified document
      runValidators: true, // Validates the updated document before saving
    }
  );

  // Send a response
  res.status(200).json({
    status: "success",
    data: {
      user: updatedUser,
    },
  });
});

const LanguageModel = require("../models/languageModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

// Fetch all languages
exports.getAllLanguages = catchAsync(async (req, res, next) => {
  const languages = await LanguageModel.find();
  res.json(languages);
});

// Fetch a specific language
exports.getLanguage = catchAsync(async (req, res, next) => {
  const language = await LanguageModel.findOne({ name: req.params.name });

  if (!language) {
    return next(new AppError("Language not found", 404));
  }

  res.json(language);
});

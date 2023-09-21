const LanguageModel = require("../models/languageModel");

// Fetch all languages
exports.getAllLanguages = async (req, res) => {
  try {
    const languages = await LanguageModel.find();
    res.json(languages);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};

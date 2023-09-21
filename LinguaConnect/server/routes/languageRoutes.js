const express = require("express");
const router = express.Router();
const languageController = require("../controllers/languageController");

router.get("/", languageController.getAllLanguages);
router.get("/:name", languageController.getLanguage);

module.exports = router;

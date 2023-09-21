const express = require("express");
const authorizationController = require("./../controllers/authorizationController");
const userController = require("./../controllers/userController");

const router = express.Router();

router.post("/register", authorizationController.register);
router.post("/login", authorizationController.login);
router.get("/logout", authorizationController.logout);
router.post("/forgotPassword", authorizationController.forgotPassword);
router.patch("/resetPassword/:token", authorizationController.resetPassword);

module.exports = router;

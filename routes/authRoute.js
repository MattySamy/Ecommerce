const express = require("express");
const authValidator = require("../utils/validators/auth.validator");
const {
  signUp,
  login,
  refresh,
  forgotPassword,
  verifyPasswordResetCode,
  resetPassword,
  authProtect,
  logout,
} = require("../services/authService");

const router = express.Router();

router.route("/signup").post(...authValidator.signUpValidator, signUp);

router.route("/login").post(...authValidator.logInValidator, login);

router.route("/refresh").get(refresh);

router.route("/forgotPassword").post(forgotPassword);

router.route("/verifyPasswordResetCode").post(verifyPasswordResetCode);

router.route("/resetPassword").put(resetPassword);

router.route("/logout").get(authProtect, logout);
module.exports = { router };

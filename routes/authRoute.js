const express = require("express");

const {
  loginLimiter,
  registerLimiter,
  forgotPasswordLimiter,
  resetPasswordLimiter,
  verifyEmailLimiter,
} = require("../config/requestLimiter");
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
  verifyEmail,
} = require("../services/authService");

const router = express.Router();

router
  .route("/signup")
  .post(registerLimiter, ...authValidator.signUpValidator, signUp);

router.route("/verify/:id/:token").get(verifyEmailLimiter, verifyEmail);

router
  .route("/login")
  .post(loginLimiter, ...authValidator.logInValidator, login);

router.route("/refresh").get(refresh);

router.route("/forgotPassword").post(forgotPasswordLimiter, forgotPassword);

router.route("/verifyPasswordResetCode").post(verifyPasswordResetCode);

router.route("/resetPassword").put(resetPasswordLimiter, resetPassword);

router.route("/logout").get(authProtect, logout);

module.exports = { router };

/* eslint-disable import/no-extraneous-dependencies */
const slugify = require("slugify");
const bcrypt = require("bcrypt");

const { check, body } = require("express-validator");

const validatorMiddleware = require("../../middlewares/validator.middleware");
const UserModel = require("../../models/user.model");

exports.createUserValidator = [
  check("name")
    .notEmpty()
    .withMessage("User name is required !!")
    .isLength({ min: 3 })
    .withMessage("Too short User name !!")
    .custom((value, { req }) => {
      if (value) req.body.slug = slugify(value);
      return true;
    }),
  check("email")
    .notEmpty()
    .withMessage("User email is required !!")
    .isEmail({
      host_whitelist: ["gmail.com", "yahoo.com", "outlook.com", "hotmail.com"],
    })
    .withMessage(
      "Invalid email format, Only Gmail, Yahoo, Outlook and Hotmail emails are allowed !!"
    )
    .custom((value) =>
      UserModel.findOne({ email: value }).then((user) => {
        if (user) {
          return Promise.reject(new Error("Email already exists !!"));
        }
      })
    ),
  check("password")
    .notEmpty()
    .withMessage("User password is required !!")
    .isStrongPassword({
      minLength: 6,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 3,
      minSymbols: 1,
    })
    .withMessage(
      "Password is too week and should be at least 6 characters consists of uppercase, lowercase, numbers and symbols !!"
    )
    .isLength({ min: 6 })
    .withMessage("Too short User password !!"),
  check("passwordConfirm")
    .notEmpty()
    .withMessage("Confirm password is required !!")
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords do not match !!");
      }
      return true;
    }),
  check("phone")
    .optional()
    .isMobilePhone(["ar-EG", "ar-SA"])
    .withMessage(
      `Invalid phone number format, Only Egyptian and Saudi phone numbers are allowed !!`
    ),
  check("profileImg").optional(),
  check("role")
    .optional()
    .isIn(["user", "admin"])
    .withMessage("Invalid role !!"),
  check("active")
    .optional()
    .isBoolean()
    .withMessage("Invalid active format !!"),

  validatorMiddleware,
];

exports.getUserValidator = [
  // 1. Rules
  check("id").isMongoId().withMessage("Invalid User id format !!"),
  // 2. Validation (Check)
  validatorMiddleware,
]; // Array of rules.

exports.updateLoggedUserValidator = [
  body("name")
    .optional()
    .custom((value, { req }) => {
      if (value) req.body.slug = slugify(value);
      return true;
    }),
  check("email")
    .optional()
    // .withMessage("User email is required !!")
    .isEmail({
      host_whitelist: ["gmail.com", "yahoo.com", "outlook.com", "hotmail.com"],
    })
    .withMessage(
      "Invalid email format, Only Gmail, Yahoo, Outlook and Hotmail emails are allowed !!"
    ),
  check("phone")
    .optional()
    .isMobilePhone(["ar-EG", "ar-SA"])
    .withMessage(
      `Invalid phone number format, Only Egyptian and Saudi phone numbers are allowed !!`
    ),
  check("profileImg").optional(),
  validatorMiddleware,
];

exports.updateUserValidator = [
  check("id").isMongoId().withMessage("Invalid User id format !!"),
  body("name")
    .optional()
    .custom((value, { req }) => {
      if (value) req.body.slug = slugify(value);
      return true;
    }),
  check("email")
    .optional()
    // .withMessage("User email is required !!")
    .isEmail({
      host_whitelist: ["gmail.com", "yahoo.com", "outlook.com", "hotmail.com"],
    })
    .withMessage(
      "Invalid email format, Only Gmail, Yahoo, Outlook and Hotmail emails are allowed !!"
    ),
  check("phone")
    .optional()
    .isMobilePhone(["ar-EG", "ar-SA"])
    .withMessage(
      `Invalid phone number format, Only Egyptian and Saudi phone numbers are allowed !!`
    ),
  check("profileImg").optional(),
  validatorMiddleware,
];

exports.deleteUserValidator = [
  check("id").isMongoId().withMessage("Invalid User id format !!"),
  validatorMiddleware,
];

exports.changeUserPasswordValidator = [
  check("id").isMongoId().withMessage("Invalid User id format !!"),
  body("currentPassword")
    .notEmpty()
    .withMessage("Current password is required !!"),
  body("passwordConfirm")
    .notEmpty()
    .withMessage("Confirm password is required !!"),
  check("password")
    .notEmpty()
    .withMessage("New password is required !!")
    .custom(async (value, { req }) => {
      // 1) Verify current password
      const user = await UserModel.findById(req.params.id);
      if (!user) {
        throw new Error(`User not found for id: ${req.params.id} !!`);
      }
      const correctPassword = await bcrypt.compare(
        req.body.currentPassword,
        user.password
      );
      if (!correctPassword) {
        throw new Error(
          "Current password is incorrect and not match with password in db !!"
        );
      }
      // 2) Verify password confirmation
      if (value !== req.body.passwordConfirm) {
        throw new Error("Passwords do not match !!");
      }
      return true;
    }),
  validatorMiddleware,
];

exports.changeLoggedUserPasswordValidator = [
  body("currentPassword")
    .notEmpty()
    .withMessage("Current password is required !!"),
  body("passwordConfirm")
    .notEmpty()
    .withMessage("Confirm password is required !!"),
  check("password")
    .notEmpty()
    .withMessage("New password is required !!")
    .custom(async (value, { req }) => {
      // 1) Verify current password
      const user = await UserModel.findById(req.user._id);
      if (!user) {
        throw new Error(`User not found for id: ${req.user._id} !!`);
      }
      const correctPassword = await bcrypt.compare(
        req.body.currentPassword,
        user.password
      );
      if (!correctPassword) {
        throw new Error(
          "Current password is incorrect and not match with password in db !!"
        );
      }
      // 2) Verify password confirmation
      if (value !== req.body.passwordConfirm) {
        throw new Error("Passwords do not match !!");
      }
      return true;
    }),
  validatorMiddleware,
];

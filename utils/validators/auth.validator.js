/* eslint-disable import/no-extraneous-dependencies */
const slugify = require("slugify");
// const bcrypt = require("bcrypt");

const { check } = require("express-validator");

const validatorMiddleware = require("../../middlewares/validator.middleware");
const UserModel = require("../../models/user.model");

exports.signUpValidator = [
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

  validatorMiddleware,
];

exports.logInValidator = [
  check("email")
    .notEmpty()
    .withMessage("User email is required !!")
    .isEmail({
      host_whitelist: ["gmail.com", "yahoo.com", "outlook.com", "hotmail.com"],
    })
    .withMessage(
      "Invalid email format, Only Gmail, Yahoo, Outlook and Hotmail emails are allowed !!"
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

  validatorMiddleware,
];

const { check, body } = require("express-validator");
const slugify = require("slugify");
const validatorMiddleware = require("../../middlewares/validator.middleware");

exports.getBrandValidator = [
  // 1. Rules
  check("id").isMongoId().withMessage("Invalid Brand id format !!"),
  // 2. Validation (Check)
  validatorMiddleware,
]; // Array of rules.

exports.createBrandValidator = [
  check("name")
    .notEmpty()
    .withMessage("Brand name is required !!")
    .isLength({ min: 3 })
    .withMessage("Too short Brand name !!")
    .isLength({ max: 32 })
    .withMessage("Too long Brand name !!")
    .custom((value, { req }) => {
      if (value) req.body.slug = slugify(value);
      return true;
    }),
  validatorMiddleware,
];

exports.updateBrandValidator = [
  // check("name")
  //   .isLength({ min: 3 })
  //   .withMessage("Too short Brand name !!")
  //   .isLength({ max: 32 })
  //   .withMessage("Too long Brand name !!"),
  check("id").isMongoId().withMessage("Invalid Brand id format !!"),
  body("name")
    .optional()
    .custom((value, { req }) => {
      if (value) req.body.slug = slugify(value);
      return true;
    }),
  validatorMiddleware,
];

exports.deleteBrandValidator = [
  check("id").isMongoId().withMessage("Invalid Brand id format !!"),
  validatorMiddleware,
];

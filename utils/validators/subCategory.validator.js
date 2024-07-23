const { check, body } = require("express-validator");
const slugify = require("slugify");
const validatorMiddleware = require("../../middlewares/validator.middleware");

exports.getSubCategoryValidator = [
  // 1. Rules
  check("id").isMongoId().withMessage("Invalid SubCategory id format !!"),
  // 2. Validation (Check)
  validatorMiddleware,
]; // Array of rules.

exports.createSubCategoryValidator = [
  check("name")
    .notEmpty()
    .withMessage("SubCategory name is required !!")
    .isLength({ min: 3 })
    .withMessage("Too short SubCategory name !!")
    .isLength({ max: 32 })
    .withMessage("Too long SubCategory name !!")
    .custom((value, { req }) => {
      if (value) req.body.slug = slugify(value);
      return true;
    }),
  check("category")
    .notEmpty()
    .withMessage("SubCategory must be related to a specific category !!")
    .isMongoId()
    .withMessage("Invalid Category id format !!"),
  validatorMiddleware,
];

exports.updateSubCategoryValidator = [
  check("id").isMongoId().withMessage("Invalid SubCategory id format !!"),
  body("name")
    .optional()
    .custom((value, { req }) => {
      if (value) req.body.slug = slugify(value);
      return true;
    }),
  validatorMiddleware,
];

exports.deleteSubCategoryValidator = [
  check("id").isMongoId().withMessage("Invalid SubCategory id format !!"),
  validatorMiddleware,
];

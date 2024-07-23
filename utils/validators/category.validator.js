const { check, body } = require("express-validator");
const slugify = require("slugify");
const validatorMiddleware = require("../../middlewares/validator.middleware");

exports.getCategoryValidator = [
  // 1. Rules
  check("id").isMongoId().withMessage("Invalid category id format !!"),
  // 2. Validation (Check)
  validatorMiddleware,
]; // Array of rules.

exports.createCategoryValidator = [
  check("name")
    .notEmpty()
    .withMessage("Category name is required !!")
    .isLength({ min: 3 })
    .withMessage("Too short category name !!")
    .isLength({ max: 32 })
    .withMessage("Too long category name !!")
    .custom((value, { req }) => {
      if (value) req.body.slug = slugify(value);
      return true;
    }),
  validatorMiddleware,
];

exports.updateCategoryValidator = [
  check("id").isMongoId().withMessage("Invalid category id format !!"),
  body("name").optional().custom((value, { req }) => {
    if (value) req.body.slug = slugify(value);
    return true;
  }),
  validatorMiddleware,
];

exports.deleteCategoryValidator = [
  check("id").isMongoId().withMessage("Invalid category id format !!"),
  validatorMiddleware,
];

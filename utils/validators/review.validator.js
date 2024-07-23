const { check } = require("express-validator");

const validatorMiddleware = require("../../middlewares/validator.middleware");
const Review = require("../../models/review.model");

exports.createReviewValidator = [
  check("title").optional(),
  check("ratings")
    .notEmpty()
    .withMessage("ratings value required")
    .isFloat({ min: 1, max: 5 })
    .withMessage("Ratings value must be between 1 to 5"),
  check("user").isMongoId().withMessage("Invalid Review id format"),
  check("product")
    .isMongoId()
    .withMessage("Invalid Review id format")
    .custom(async (_, { req }) => {
      // Check if logged user create review before
      const review = await Review.findOne({
        user: req.user._id,
        product: req.body.product,
      });
      if (review) {
        throw new Error("You already created a review before !!");
      }

      return true;
    }),
  validatorMiddleware,
];

exports.getReviewValidator = [
  check("id").isMongoId().withMessage("Invalid Review id format"),
  validatorMiddleware,
];

exports.updateReviewValidator = [
  check("id")
    .isMongoId()
    .withMessage("Invalid Review id format")
    .custom(async (val, { req }) => {
      // Check review ownership before update
      const review = await Review.findById(val);
      if (!review) {
        throw new Error(`There is no review with id ${val}`);
      }
      if (review.user._id.toString() !== req.user._id.toString()) {
        throw new Error(`Your are not allowed to perform this action`);
      }
      return true;
    }),
  validatorMiddleware,
];

exports.deleteReviewValidator = [
  check("id")
    .isMongoId()
    .withMessage("Invalid Review id format")
    .custom(async (val, { req }) => {
      // Check review ownership before update
      if (req.user.role === "user") {
        const review = await Review.findById(val);
        if (!review) {
          throw new Error(`There is no review with id ${val}`);
        }

        if (review.user._id.toString() !== req.user._id.toString()) {
          throw new Error(`Your are not allowed to perform this action`);
        }
      }
      return true;
    }),
  validatorMiddleware,
];

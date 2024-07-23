const express = require("express");

const reviewValidator = require("../utils/validators/review.validator");
const {
  getReviews,
  getReview,
  createReview,
  updateReview,
  deleteReview,
} = require("../services/reviewService");

const AuthorizedService = require("../services/authService");

const router = express.Router();

router
  .route("/")
  .post(
    AuthorizedService.authProtect,
    AuthorizedService.allowedTo("user"),
    ...reviewValidator.createReviewValidator,
    createReview
  )
  .get(getReviews);

router
  .route("/:id")
  .get(...reviewValidator.getReviewValidator, getReview)
  .put(
    AuthorizedService.authProtect,
    AuthorizedService.allowedTo("user"),
    ...reviewValidator.updateReviewValidator,
    updateReview
  )
  .delete(
    AuthorizedService.authProtect,
    AuthorizedService.allowedTo("admin", "manager", "user"),
    ...reviewValidator.deleteReviewValidator,
    deleteReview
  );

module.exports = { router };

const express = require("express");

const reviewValidator = require("../utils/validators/review.validator");
const {
  getReviews,
  getReview,
  createReview,
  updateReview,
  deleteReview,
  setProductIdParamAndAuthenticatedUserIdToBody,
  createFilterObject,
} = require("../services/reviewService");

const AuthorizedService = require("../services/authService");

const router = express.Router({ mergeParams: true });

router
  .route("/")
  .post(
    AuthorizedService.authProtect,
    AuthorizedService.allowedTo("user"),
    setProductIdParamAndAuthenticatedUserIdToBody,
    ...reviewValidator.createReviewValidator,
    createReview
  )
  .get(createFilterObject, getReviews);

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

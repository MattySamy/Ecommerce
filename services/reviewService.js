/* eslint-disable import/no-extraneous-dependencies */
// const asyncHandler = require("express-async-handler");

const ReviewModel = require("../models/review.model");
const factory = require("./handlers.factory");

// Middleware to set category id to body => make it before enters validation layer of express-validator
exports.setProductIdParamAndAuthenticatedUserIdToBody = (req, res, next) => {
  if (!req.body.product) req.body.product = req.params.productId;
  if (!req.body.user) req.body.user = req.user._id;
  next();
};

// Imporatnt: Nested route
// @desc Get all Reviews from a specific product
// @route GET /api/v1/products/:id/reviews
// @access Public
//---------------------------------------------------------------------------

exports.createFilterObject = (req, res, next) => {
  let filterObject = {};
  if (req.params.productId) {
    filterObject = { product: req.params.productId };
  }
  req.filterObj = filterObject;
  next();
};

// @desc Get all reviews
// @route GET /api/v1/reviews
// @access Public
exports.getReviews = factory.getAll(ReviewModel);

// @desc Get single Review by id
// @route GET /api/v1/reviews/:id
// @access Public

exports.getReview = factory.getOne(ReviewModel);

// @desc Update specific Review
// @route PUT /api/v1/reviews/:id
// @access Private/Protect/User

exports.updateReview = factory.updateOne(ReviewModel);

// @desc Delete specific Review
// @route DELETE /api/v1/reviews/:id
// @access Private/Protect/User-Admin-Manager

exports.deleteReview = factory.deleteOne(ReviewModel);

// @desc Create new review
// @route POST /api/v1/reviews
// @access Private/Protect/User

exports.createReview = factory.createOne(ReviewModel);

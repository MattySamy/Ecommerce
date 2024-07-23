/* eslint-disable import/no-extraneous-dependencies */
// const asyncHandler = require("express-async-handler");

const ReviewModel = require("../models/review.model");
const factory = require("./handlers.factory");

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

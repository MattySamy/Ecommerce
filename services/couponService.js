/* eslint-disable import/no-extraneous-dependencies */
const CouponModel = require("../models/coupon.model");
const factory = require("./handlers.factory");

// @desc Get all coupons
// @route GET /api/v1/coupons
// @access Private (Admin-Manager)
exports.getCoupons = factory.getAll(CouponModel);

// @desc Get single coupon by id
// @route GET /api/v1/coupons/:id
// @access Private (Admin-Manager)

exports.getCoupon = factory.getOne(CouponModel);

// @desc Update specific coupon
// @route PUT /api/v1/coupons/:id
// @access Private (Admin-Manager)

exports.updateCoupon = factory.updateOne(CouponModel);

// @desc Delete specific coupon
// @route DELETE /api/v1/coupons/:id
// @access Private (Admin-Manager)

exports.deleteCoupon = factory.deleteOne(CouponModel);

// @desc Create new coupon
// @route POST /api/v1/coupons
// @access Private (Admin-Manager)

exports.createCoupon = factory.createOne(CouponModel);

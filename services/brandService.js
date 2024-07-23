/* eslint-disable import/no-extraneous-dependencies */
const { v4: uuidv4 } = require("uuid");
const sharp = require("sharp");
const asyncHandler = require("express-async-handler");

const BrandModel = require("../models/brand.model");
const factory = require("./handlers.factory");
const { uploadSingleImage } = require("../middlewares/uploadImage.middleware");

exports.uploadBrandImage = uploadSingleImage("Image");

// Not needed to refactor :D
exports.resizeImage = asyncHandler(async (req, res, next) => {
  const filename = `brand-${uuidv4().split("-").join("")}-${Date.now()}.jpeg`;

  // Image Processing using sharp library
  if (req.file) {
    await sharp(req.file.buffer)
      .resize(500, 500)
      .toFormat("jpeg")
      .jpeg({ quality: 90 })
      .toFile(`uploads/brands/${filename}`);
  }

  // Saving processed image into our db
  req.body.Image = filename;
  next();
});

// @desc Get all brands
// @route GET /api/v1/brands
// @access Public
exports.getBrands = factory.getAll(BrandModel);
// @desc Get single brand by id
// @route GET /api/v1/brands/:id
// @access Public

exports.getBrand = factory.getOne(BrandModel);

// @desc Update specific brand
// @route PUT /api/v1/brands/:id
// @access Private

exports.updateBrand = factory.updateOne(BrandModel, "Image", "brands");

// @desc Delete specific brand
// @route DELETE /api/v1/brands/:id
// @access Private

exports.deleteBrand = factory.deleteOne(BrandModel);

// @desc Create new brand
// @route POST /api/v1/brands
// @access Private

exports.createBrand = factory.createOne(BrandModel);

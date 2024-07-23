/* eslint-disable import/no-extraneous-dependencies */
const { v4: uuidv4 } = require("uuid");
const sharp = require("sharp");
const asyncHandler = require("express-async-handler");

const CategoryModel = require("../models/category.model");
const factory = require("./handlers.factory");
const { uploadSingleImage } = require("../middlewares/uploadImage.middleware");

exports.uploadCategoryImage = uploadSingleImage("Image");

// Not needed to refactor :D
exports.resizeImage = asyncHandler(async (req, res, next) => {
  const filename = `category-${uuidv4().split("-").join("")}-${Date.now()}.png`;

  // Image Processing using sharp library
  if (req.file) {
    await sharp(req.file.buffer)
      .resize(600, 600)
      .toFormat("png")
      .png({ quality: 90 })
      .toFile(`uploads/categories/${filename}`);
  }

  // Saving processed image into our db
  req.body.Image = filename;
  next();
});

// @desc Get all categories
// @route GET /api/v1/categories
// @access Public
exports.getCategories = factory.getAll(CategoryModel);

// @desc Get single category by id
// @route GET /api/v1/categories/:id
// @access Public

exports.getCategory = factory.getOne(CategoryModel);

// @desc Update specific category
// @route PUT /api/v1/categories/:id
// @access Private

exports.updateCategory = factory.updateOne(
  CategoryModel,
  "Image",
  "categories"
);

// @desc Delete specific category
// @route DELETE /api/v1/categories/:id
// @access Private

exports.deleteCategory = factory.deleteOne(CategoryModel);

// @desc Create new category
// @route POST /api/v1/categories
// @access Private

exports.createCategory = factory.createOne(
  CategoryModel,
  "Image",
  "categories"
);

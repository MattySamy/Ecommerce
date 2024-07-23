/* eslint-disable node/no-unsupported-features/es-syntax */
const sharp = require("sharp");
const asyncHandler = require("express-async-handler");
const { v4: uuidv4 } = require("uuid");

const ProductModel = require("../models/product.model");
const factory = require("./handlers.factory");
const { uploadMixOfImages } = require("../middlewares/uploadImage.middleware");

exports.uploadProductImages = uploadMixOfImages([
  { name: "imageCover", maxCount: 1 },
  { name: "images", maxCount: 5 },
]); // adding multiple images => req.files
exports.resizeProductImages = asyncHandler(async (req, res, next) => {
  //   console.log(req.files);

  // 1. Image Processing for imageCover
  if (req.files.imageCover) {
    const imageCoverfilename = `product-${uuidv4().split("-").join("")}-${Date.now()}-cover.webp`;

    // Image Processing using sharp library
    if (req.file) {
      await sharp(req.files.imageCover[0].buffer)
        .resize(2000, 1333)
        .toFormat("webp")
        .webp({ quality: 95 })
        .toFile(`uploads/products/${imageCoverfilename}`);
    }

    // Saving processed image into our db
    req.body.imageCover = imageCoverfilename;
  }

  // 2. Image Processing for images
  if (req.files.images) {
    req.body.images = [];
    await Promise.all(
      req.files.images.map(async (img, index) => {
        const imgFilename = `product-${uuidv4().split("-").join("")}-${Date.now()}-${index + 1}.jpeg`;

        // Image Processing using sharp library
        await sharp(img.buffer)
          .resize(800, 800)
          .toFormat("jpeg")
          .jpeg({ quality: 90 })
          .toFile(`uploads/products/${imgFilename}`);

        // Saving processed image into our db
        req.body.images.push(imgFilename);
      })
    )
      .then(() => {
        console.log(req.body.imageCover);
        console.log(req.body.images);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  next();
});

// @desc Get all products
// @route GET /api/v1/products
// @access Public
exports.getProducts = factory.getAll(ProductModel);

// @desc Get single product by id
// @route GET /api/v1/products/:id
// @access Public

exports.getProduct = factory.getOne(ProductModel, "reviews");

// @desc Update specific product
// @route PUT /api/v1/products/:id
// @access Private

exports.updateProduct = factory.updateOne(
  ProductModel,
  "imageCover",
  "products"
);

// @desc Delete specific product
// @route DELETE /api/v1/products/:id
// @access Private

exports.deleteProduct = factory.deleteOne(ProductModel);

// @desc Create new product
// @route POST /api/v1/products
// @access Private

exports.createProduct = factory.createOne(ProductModel);

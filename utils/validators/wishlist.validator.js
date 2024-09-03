const { body, check } = require("express-validator");
const validatorMiddleware = require("../../middlewares/validator.middleware");
const ProductModel = require("../../models/product.model");

exports.addProductsToWishlistValidator = [
  body("productId")
    .optional()
    .isMongoId()
    .withMessage("Invalid product id format")
    .custom(async (val, { req }) => {
      const product = await ProductModel.findById(val);
      if (!product) {
        throw new Error(`There is no product with id ${val}`);
      }
      if (req.user.wishList.includes(val)) {
        throw new Error(`Product with id ${val} already added to wishlist !!`);
      }
      return true;
    }),
  validatorMiddleware,
];

exports.rmProductsFromWishlistValidator = [
  check("productId")
    .optional()
    .isMongoId()
    .withMessage("Invalid product id format")
    .custom(async (val, { req }) => {
      const product = await ProductModel.findById(val);
      if (!product) {
        throw new Error(`There is no product with id ${val}`);
      }
      if (!req.user.wishList.includes(val)) {
        throw new Error(
          `Product with id ${val} already not found in wishlist !!`
        );
      }
      return true;
    }),
  validatorMiddleware,
];

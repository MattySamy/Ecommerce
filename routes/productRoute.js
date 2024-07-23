const express = require("express");
const productValidator = require("../utils/validators/product.validator");
const {
  getProducts,
  createProduct,
  getProduct,
  updateProduct,
  deleteProduct,
  uploadProductImages,
  resizeProductImages,
} = require("../services/productService");

const AuthorizedService = require("../services/authService");

const router = express.Router();

router
  .route("/")
  .post(
    AuthorizedService.authProtect,
    AuthorizedService.allowedTo("manager", "admin"),
    uploadProductImages,
    resizeProductImages,
    ...productValidator.createProductValidator,
    createProduct
  )
  .get(getProducts);

router
  .route("/:id")
  .get(...productValidator.getProductValidator, getProduct)
  .put(
    AuthorizedService.authProtect,
    AuthorizedService.allowedTo("manager", "admin"),
    uploadProductImages,
    resizeProductImages,
    ...productValidator.updateProductValidator,
    updateProduct
  )
  .delete(
    AuthorizedService.authProtect,
    AuthorizedService.allowedTo("admin"),
    ...productValidator.deleteProductValidator,
    deleteProduct
  );

module.exports = { router };

// then mount this router in server.js

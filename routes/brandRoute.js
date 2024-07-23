const express = require("express");
const brandValidator = require("../utils/validators/brand.validator");
const {
  getBrands,
  createBrand,
  getBrand,
  updateBrand,
  deleteBrand,
  uploadBrandImage,
  resizeImage,
} = require("../services/brandService");

const AuthorizedService = require("../services/authService");

const router = express.Router();

router
  .route("/")
  .post(
    AuthorizedService.authProtect,
    AuthorizedService.allowedTo("manager", "admin"),
    uploadBrandImage,
    resizeImage,
    ...brandValidator.createBrandValidator,
    createBrand
  )
  .get(getBrands);

router
  .route("/:id")
  .get(...brandValidator.getBrandValidator, getBrand)
  .put(
    AuthorizedService.authProtect,
    AuthorizedService.allowedTo("manager", "admin"),
    uploadBrandImage,
    resizeImage,
    ...brandValidator.updateBrandValidator,
    updateBrand
  )
  .delete(
    AuthorizedService.authProtect,
    AuthorizedService.allowedTo("admin"),
    ...brandValidator.deleteBrandValidator,
    deleteBrand
  );

module.exports = { router };

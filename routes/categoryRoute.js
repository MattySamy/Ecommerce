const express = require("express");
const categoryValidator = require("../utils/validators/category.validator");
const {
  getCategories,
  createCategory,
  getCategory,
  updateCategory,
  deleteCategory,
  uploadCategoryImage,
  resizeImage,
} = require("../services/categoryService");

const AuthorizedService = require("../services/authService");

const subCategoryRoute = require("./subCategoryRoute");

const router = express.Router();

router.use("/:categoryId/subcategories", subCategoryRoute.router);

router
  .route("/")
  .post(
    AuthorizedService.authProtect,
    AuthorizedService.allowedTo("admin", "manager"),
    uploadCategoryImage,
    resizeImage,
    ...categoryValidator.createCategoryValidator,
    createCategory
  )
  .get(getCategories);

router
  .route("/:id")
  .get(...categoryValidator.getCategoryValidator, getCategory)
  .put(
    AuthorizedService.authProtect,
    AuthorizedService.allowedTo("admin", "manager"),
    uploadCategoryImage,
    resizeImage,
    ...categoryValidator.updateCategoryValidator,
    updateCategory
  )
  .delete(
    AuthorizedService.authProtect,
    AuthorizedService.allowedTo("admin"),
    ...categoryValidator.deleteCategoryValidator,
    deleteCategory
  );

module.exports = { router };

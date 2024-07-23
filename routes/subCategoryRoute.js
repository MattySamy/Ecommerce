const express = require("express");
const subCategoryValidator = require("../utils/validators/subCategory.validator");
const {
  createSubCategory,
  getSubCategories,
  getSubCategory,
  updateSubCategory,
  deleteSubCategory,
  setCategoryIdToBody,
  createFilterObject,
} = require("../services/subCategoryService");

const AuthorizedService = require("../services/authService");

// mergeParams: allow us to access params on other routers
// ex: we need to access category id in subCategory route from category router
const router = express.Router({ mergeParams: true });

router
  .route("/")
  .get(createFilterObject, getSubCategories)
  .post(
    AuthorizedService.authProtect,
    AuthorizedService.allowedTo("manager", "admin"),
    setCategoryIdToBody,
    ...subCategoryValidator.createSubCategoryValidator,
    createSubCategory
  );

router
  .route("/:id")
  .get(...subCategoryValidator.getSubCategoryValidator, getSubCategory)
  .put(
    AuthorizedService.authProtect,
    AuthorizedService.allowedTo("manager", "admin"),
    ...subCategoryValidator.updateSubCategoryValidator,
    updateSubCategory
  )
  .delete(
    AuthorizedService.authProtect,
    AuthorizedService.allowedTo("admin"),
    ...subCategoryValidator.deleteSubCategoryValidator,
    deleteSubCategory
  );

module.exports = { router };

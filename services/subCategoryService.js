const subCategoryModel = require("../models/subCategory.model");
const factory = require("./handlers.factory");

// Middleware to set category id to body => make it before enters validation layer of express-validator
exports.setCategoryIdToBody = (req, res, next) => {
  if (!req.body.category) req.body.category = req.params.categoryId;
  next();
};
// @desc Craete new Sub Category
// @route POST /api/v1/subcategories
// @access Private

exports.createSubCategory = factory.createOne(subCategoryModel);

// exports.createSubCategory = asyncHandler(async (req, res) => {
//   // Nested route
//   // if (!req.body.category) req.body.category = req.params.categoryId;

//   const { name, category } = req.body;
//   const allSubCategories = await subCategoryModel.find();
//   const categoryExists = allSubCategories.filter(
//     (subCategory) => subCategory.category._id.toString() === category.toString()
//   );
//   if (categoryExists.length > 5) {
//     throw new ApiError(
//       `More than 5 subCategories can be related to a single category`,
//       400
//     );
//   }
//   const subCategory = await subCategoryModel.create({
//     name,
//     slug: slugify(name),
//     category,
//   });
//   res.status(201).json({ data: subCategory });
// });

// Imporatnt: Nested route
// @desc Get all subCategories from a specific category
// @route GET /api/v1/categories/:id/subcategories
// @access Public
//---------------------------------------------------------------------------

exports.createFilterObject = (req, res, next) => {
  let filterObject = {};
  if (req.params.categoryId) {
    filterObject = { category: req.params.categoryId };
  }
  req.filterObj = filterObject;
  next();
};

// @desc Get all subCategories
// @route GET /api/v1/subcategories
// @access Public

exports.getSubCategories = factory.getAll(subCategoryModel);

// @desc Get single subCategory by id
// @route GET /api/v1/subcategories/:id
// @access Public

exports.getSubCategory = factory.getOne(subCategoryModel);

// @desc Update specific subcategory
// @route PUT /api/v1/subcategories/:id
// @access Private

exports.updateSubCategory = factory.updateOne(subCategoryModel);

// @desc Delete specific subcategory
// @route DELETE /api/v1/subcategories/:id
// @access Private

// Refactored
exports.deleteSubCategory = factory.deleteOne(subCategoryModel);

const { check, body } = require("express-validator");
const slugify = require("slugify");
const validatorMiddleware = require("../../middlewares/validator.middleware");
const { checker } = require("../checker");
const CategoryModel = require("../../models/category.model");
const SubCategoryModel = require("../../models/subCategory.model");

exports.createProductValidator = [
  check("title")
    .notEmpty()
    .withMessage("Product name is required !!")
    .isLength({ min: 3 })
    .withMessage("Too short Product name !!")
    .isLength({ max: 100 })
    .withMessage("Too long Product name !!")
    .custom((value, { req }) => {
      if (value) req.body.slug = slugify(value);
      return true;
    }),
  check("description")
    .notEmpty()
    .withMessage("Product description is required !!")
    .isLength({ min: 20 })
    .withMessage("Too short Product description !!")
    .isLength({ max: 2000 })
    .withMessage("Too long Product description !!"),
  check("quantity")
    .notEmpty()
    .withMessage("Product quantity is required !!")
    .isNumeric()
    .withMessage("Product quantity must be a number !!"),
  check("sold")
    .optional()
    .isNumeric()
    .withMessage("Product sold must be a number !!")
    .custom((value, { req }) => {
      if (value > req.body.quantity) {
        throw new Error("Product sold can't be more than product quantity !!");
      }
      return true;
    }),
  check("price")
    .notEmpty()
    .withMessage("Product price is required !!")
    .isNumeric()
    .withMessage("Product price must be a number !!")
    .isLength({ max: 20 })
    .withMessage("Too long Product price !!"),
  check("priceAfterDiscount")
    .optional()
    .toFloat()
    .isNumeric()
    .withMessage("Product priceAfterDiscount must be a number !!")
    .custom((value, { req }) => {
      if (value >= req.body.price) {
        throw new Error(
          "Product priceAfterDiscount can't be less than product price !!"
        );
      }
      return true;
    }),
  check("colors")
    .optional()
    .isArray()
    .withMessage("Product colors must be an array !!"),
  check("imageCover")
    .notEmpty()
    .withMessage("Product imageCover is required !!"),
  check("images")
    .optional()
    .isArray()
    .withMessage("Product images must be an array !!"),
  check("category")
    .notEmpty()
    .withMessage("Product must be related to a specific category !!")
    .isMongoId()
    .withMessage("Invalid Category id format !!")
    .custom(async (categoryId) => {
      const categoryExists = await CategoryModel.findById(categoryId);
      if (!categoryExists) {
        throw new Error(
          `Category with id: ${categoryId} does not exist in mongoDB !!`
        );
      }
      return true;
    }),
  check("subCategories")
    .optional()
    // .isArray()
    // .withMessage("Product subCategories must be an array !!")
    .isMongoId()
    .withMessage("Invalid SubCategory id format !!")
    .custom(async (subCategoryIds, { req }) => {
      // 10 documents =($in operator)=> 5 subCategories
      const subCategoryExists = await SubCategoryModel.find({
        _id: { $exists: true, $in: subCategoryIds },
      });

      if (
        subCategoryIds.length < 1 ||
        subCategoryIds.length !== subCategoryExists.length
      ) {
        throw new Error(
          `SubCategory with id${subCategoryIds.length > 1 ? "s" : ""}: ${subCategoryIds} or all of them does not exist in mongoDB !!`
        );
      }

      return true;
    })
    .custom((subCategoryIds, { req }) =>
      SubCategoryModel.find({ category: req.body.category }).then(
        (subCategories) => {
          const subCategoriesIdsInCategory = [];

          subCategories.forEach((subCategory) => {
            subCategoriesIdsInCategory.push(subCategory._id.toString());
          });

          if (!checker(subCategoryIds, subCategoriesIdsInCategory)) {
            return Promise.reject(
              new Error(
                `Subcategories are some or all of them does not belong to this specific category !!`
              )
            );
          }
        }
      )
    ),
  check("brand")
    .optional()
    .isMongoId()
    .withMessage("Invalid Brand id format !!"),
  check("ratingsAverage")
    .optional()
    .isNumeric()
    .withMessage("Product ratingsAverage must be a number !!")
    .isLength({ min: 1 })
    .withMessage("Product ratingsAverage must be above or equal 1.0 !!")
    .isLength({ max: 5 })
    .withMessage("Product ratingsAverage must be below or equal 5.0 !!"),
  check("ratingsQuantity")
    .optional()
    .isNumeric()
    .withMessage("Product ratingsQuantity must be a number !!"),
  validatorMiddleware,
];

exports.getProductValidator = [
  check("id").isMongoId().withMessage("Invalid Category id format !!"),
  validatorMiddleware,
];

exports.updateProductValidator = [
  check("id").isMongoId().withMessage("Invalid Product id format !!"),
  body("title")
    .optional()
    .custom((value, { req }) => {
      if (value) req.body.slug = slugify(value);
      return true;
    }),
  validatorMiddleware,
];

exports.deleteProductValidator = [
  check("id").isMongoId().withMessage("Invalid Product id format !!"),
  validatorMiddleware,
];

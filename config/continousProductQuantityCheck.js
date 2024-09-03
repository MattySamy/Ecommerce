const asyncHandler = require("express-async-handler");

const ProductModel = require("../models/product.model");

const continousProductQuantityCheck = asyncHandler(async () => {
  const bulkOption = [
    {
      deleteOne: {
        filter: {
          $or: [
            {
              quantity: {
                $lte: 0,
              },
            },
            {
              sold: {
                $lt: 0,
              },
            },
          ],
          removeProductsThatAreOutOfStock: true,
        },
      },
    },
  ];

  try {
    const productsOutOfStockDeleted = await ProductModel.bulkWrite(
      bulkOption,
      {}
    );
    console.log(
      `Bulk write deleted ${productsOutOfStockDeleted.deletedCount} product${productsOutOfStockDeleted.deletedCount > 1 ? "s" : ""} out of stock`
    );
  } catch (err) {
    console.log(err);
  }
});

module.exports = continousProductQuantityCheck;

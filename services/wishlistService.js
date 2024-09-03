const asyncHandler = require("express-async-handler");

const ApiError = require("../utils/errorHandler");
const UserModel = require("../models/user.model");

// @desc Add product to wishlist
// @route POST /api/v1/wishlist
// @access Protected/User

exports.addProductToWishlist = asyncHandler(async (req, res, next) => {
  // $addToSet:=> add productId to wishlist array if it doesn't exist

  const user = await UserModel.findByIdAndUpdate(
    req.user._id,
    {
      $addToSet: {
        wishList: req.body.productId,
      },
    },
    {
      new: true,
    }
  );

  res.status(200).json({
    status: "success",
    msg: `Product added to wishlist successfully :)`,
    data: user.wishList,
  });
});

// @desc Remove product from wishlist
// @route DELETE /api/v1/wishlist/:productId
// @access Protected/User
exports.rmProductFromWishlist = asyncHandler(async (req, res, next) => {
  // $pull:=> remove productId from wishlist array if it exists

  const user = await UserModel.findByIdAndUpdate(
    req.user._id,
    {
      $pull: {
        wishList: req.params.productId,
      },
    },
    {
      new: true,
    }
  );

  res.status(200).json({
    status: "success",
    msg: `Product removed from wishlist :'(`,
    data: user.wishList,
  });
});

// @desc Get logged user wishlist
// @route GET /api/v1/wishlist
// @access Protected/User
exports.getLoggedUserWishlist = asyncHandler(async (req, res, next) => {
  const user = await UserModel.findById(req.user._id).populate("wishList");

  res.status(200).json({
    status: "success",
    "WishList Number of Products": user.wishList.length,
    "Your Wishlist": user.wishList,
  });
});

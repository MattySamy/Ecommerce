const asyncHandler = require("express-async-handler");

const UserModel = require("../models/user.model");

// @desc Add address to user addresses list
// @route POST /api/v1/addresses
// @access Protected/User

exports.addAddressToUser = asyncHandler(async (req, res, next) => {
  // $addToSet:=> add address to user addresses array if it doesn't exist

  const user = await UserModel.findByIdAndUpdate(
    req.user._id,
    {
      $addToSet: {
        addresses: req.body,
      },
    },
    {
      new: true,
    }
  );

  res.status(200).json({
    status: "success",
    msg: `Address added successfully :)`,
    data: user.addresses,
  });
});

// @desc Remove address from user addresses list
// @route DELETE /api/v1/addresses/:addressId
// @access Protected/User
exports.rmAddressFromUserList = asyncHandler(async (req, res, next) => {
  // $pull:=> remove address from user addresses array if it exists

  const user = await UserModel.findByIdAndUpdate(
    req.user._id,
    {
      $pull: {
        addresses: {
          _id: req.params.addressId,
        },
      },
    },
    {
      new: true,
    }
  );

  res.status(200).json({
    status: "success",
    msg: `Address removed successfully :'(`,
    data: user.addresses,
  });
});

// @desc Get logged user addresses list
// @route GET /api/v1/addresses
// @access Protected/User
exports.getLoggedUserAddresses = asyncHandler(async (req, res, next) => {
  const user = await UserModel.findById(req.user._id).populate("addresses");

  res.status(200).json({
    status: "success",
    "Number of Addresses": user.addresses.length,
    "Your Addresses": user.addresses,
  });
});

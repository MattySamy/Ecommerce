/* eslint-disable no-nested-ternary */
/* eslint-disable import/no-extraneous-dependencies */
const { v4: uuidv4 } = require("uuid");
const sharp = require("sharp");
const asyncHandler = require("express-async-handler");
const path = require("path");
const fs = require("fs");
const slugify = require("slugify");
const bcrypt = require("bcrypt");

const { ApiError } = require("../utils/errorHandler");
const UserModel = require("../models/user.model");
const { generateToken } = require("../utils/generateToken");
const factory = require("./handlers.factory");
const { uploadSingleImage } = require("../middlewares/uploadImage.middleware");

exports.uploadUserImage = uploadSingleImage("profileImg");

// Not needed to refactor :D
exports.resizeImage = asyncHandler(async (req, res, next) => {
  const filename = `user-${uuidv4().split("-").join("")}-${Date.now()}-profile.png`;
  if (req.file) {
    // Image Processing using sharp library
    await sharp(req.file.buffer)
      .resize(800, 800)
      .toFormat("png")
      .png({ quality: 90 })
      .toFile(`uploads/users/${filename}`);

    // Saving processed image into our db
    req.body.profileImg = filename;
  }
  next();
});

// @desc Get all users
// @route GET /api/v1/users
// @access Private
exports.getUsers = factory.getAll(UserModel);

// @desc Get single user by id
// @route GET /api/v1/users/:id
// @access Private

exports.getUser = factory.getOne(UserModel);

// @desc Update specific user
// @route PUT /api/v1/users/:id
// @access Private

exports.updateUser = asyncHandler(async (req, res, next) => {
  const modelExists = await UserModel.findById(req.params.id);
  if (req.body.profileImg) {
    // Get path of old image
    const rightPathAfterMongooseMiddleware = [
      ...new Set(
        path
          .join(__dirname, "uploads", "users", modelExists.profileImg)
          .split("\\")
          .filter(
            (el) =>
              !el.includes("http:") &&
              !el.includes(`localhost:${process.env.PORT}`) &&
              !el.includes("services")
          )
      ),
    ].join("\\");

    // Delete old image and create new one
    if (
      modelExists.profileImg &&
      fs.existsSync(rightPathAfterMongooseMiddleware)
    ) {
      await fs.unlink(rightPathAfterMongooseMiddleware, (err) => {
        if (err) console.log(err);
        console.log("File deleted successfully");
      });
    }
  }

  // Update user
  const model = await UserModel.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name ? req.body.name : modelExists.name,
      slug: req.body.name ? slugify(req.body.name) : modelExists.slug,
      phone: req.body.phone ? req.body.phone : modelExists.phone,
      email: req.body.email ? req.body.email : modelExists.email,
      profileImg: req.body.profileImg
        ? req.body.profileImg
        : modelExists.profileImg,
      role: req.body.role ? req.body.role : modelExists.role,
    },
    {
      new: true,
    }
  );
  if (!model) {
    return next(
      new ApiError(
        `${UserModel.modelName} not found for id: ${req.params.id}`,
        404
      )
    );
  }
  res.status(200).json({ data: model });
});

// Change User Password Middleware
// @desc Update specific user password
// @route PUT /api/v1/users/changePassword/:id
// @access Private
exports.changeUserPassword = asyncHandler(async (req, res, next) => {
  const modelExists = await UserModel.findById(req.params.id);
  const model = await UserModel.findByIdAndUpdate(req.params.id, {
    password: req.body.password
      ? await bcrypt.hash(req.body.password, 12)
      : modelExists.password,
    passwordChangedAt: Date.now(),
  });

  if (req.cookies.jwt) {
    // Destructuring refreshToken from cookie
    // const refreshToken = req.cookies.jwt;

    // Deleting refreshToken from cookie
    res.clearCookie("jwt", {
      httpOnly: false,
      sameSite: "none",
      secure: true,
    });
  }

  if (!model) {
    return next(
      new ApiError(
        `${UserModel.modelName} not found for id: ${req.params.id}`,
        404
      )
    );
  }
  res.status(200).json({ data: model });
});

// @desc Delete specific user
// @route DELETE /api/v1/users/:id
// @access Private

exports.deleteUser = factory.deleteOne(UserModel);

// @desc Create new user
// @route POST /api/v1/users
// @access Private

exports.createUser = factory.createOne(UserModel);

// @desc Get Logged User Data
// @route GET /api/v1/users/getMyData
// @access Private/Protect

exports.getLoggedUserData = asyncHandler(async (req, res, next) => {
  req.params.id = req.user._id;
  next();
});

// @desc Update Logged User Password
// @route PUT /api/v1/users/updateMyPassword
// @access Private/Protect
exports.updateLoggedUserPassword = asyncHandler(async (req, res, next) => {
  const modelExists = await UserModel.findById(req.user._id);
  const model = await UserModel.findByIdAndUpdate(req.user._id, {
    password: req.body.password
      ? await bcrypt.hash(req.body.password, 12)
      : modelExists.password,
    passwordChangedAt: Date.now(),
  });
  // Generate JWT
  const token = generateToken(req.user._id);
  res.status(200).json({ data: model, "JWT Token": token });
});

// @desc Update Logged User Password
// @route PUT /api/v1/users/updateMyData
// @access Private/Protect
exports.updateLoggedUserData = asyncHandler(async (req, res, next) => {
  const modelExists = await UserModel.findById(req.user._id);
  if (req.body.profileImg) {
    console.log(req.body.profileImg);
    // Get path of old image
    const rightPathAfterMongooseMiddleware = [
      ...new Set(
        path
          .join(
            __dirname,
            "uploads",
            "users",
            modelExists.profileImg
              ? modelExists.profileImg
              : req.body.profileImg
          )
          .split("\\")
          .filter(
            (el) =>
              !el.includes("http:") &&
              !el.includes(`localhost:${process.env.PORT}`) &&
              !el.includes("services")
          )
      ),
    ].join("\\");

    // Delete old image and create new one
    if (
      modelExists.profileImg &&
      fs.existsSync(rightPathAfterMongooseMiddleware)
    ) {
      await fs.unlink(rightPathAfterMongooseMiddleware, (err) => {
        if (err) console.log(err);
        console.log("File deleted successfully");
      });
    }
  }
  const model = await UserModel.findByIdAndUpdate(
    req.user._id,
    {
      name: req.body.name ? req.body.name : modelExists.name,
      phone: req.body.phone ? req.body.phone : modelExists.phone,
      email: req.body.email ? req.body.email : modelExists.email,
      profileImg: req.body.profileImg
        ? req.body.profileImg
        : modelExists.profileImg,
    },
    { new: true }
  );
  if (!model) {
    return next(
      new ApiError(
        `${UserModel.modelName} not found for id: ${req.user._id}`,
        404
      )
    );
  }
  res.status(200).json({ data: model });
});

// @desc Deactivate Logged User
// @route PUT /api/v1/users/deleteMe
// @access Private/Protect
exports.deactivateLoggedUser = asyncHandler(async (req, res, next) => {
  await UserModel.findByIdAndUpdate(req.user._id, { active: false });
  res.status(204).json({ status: "success" });
});

// @desc Reactivate Logged User
// @route PUT /api/v1/users/activateUser
// @access Private (Admin and Manager)

exports.activateLoggedUser = asyncHandler(async (req, res, next) => {
  const model = await UserModel.findOne({ email: req.body.email });
  if (!model) {
    return next(
      new ApiError(
        `${UserModel.modelName} not found for email: ${req.body.email}`,
        404
      )
    );
  }
  await UserModel.findByIdAndUpdate(model._id, { active: true });
  res.status(201).json({ msg: "User has been reactivated successfully :)" });
});

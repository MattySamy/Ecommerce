/* eslint-disable no-nested-ternary */
/* eslint-disable import/no-extraneous-dependencies */
const crypto = require("crypto");

const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const { ApiError } = require("../utils/errorHandler");
const UserModel = require("../models/user.model");
const { generateToken } = require("../utils/generateToken");
const sendEmail = require("../utils/sendEmail");

// @desc Sign Up
// @route POST /api/v1/auth/signup
// @access Public

exports.signUp = asyncHandler(async (req, res, next) => {
  // 1) Create user
  const user = await UserModel.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
  });
  // 2) Generate token => jwt.sign(payload,secretKey,options:{expiresIn})
  const token = generateToken(user._id);
  // 3) Creating refresh token not that expiry of refresh
  //token is greater than the access token

  const refreshToken = jwt.sign(
    {
      userId: user._id,
    },
    process.env.JWT_REFRESH_SECRET_KEY,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN }
  );

  // 4) Assigning refresh token in http-only cookie
  res.cookie("jwt", refreshToken, {
    httpOnly: true,
    sameSite: "None",
    secure: true,
    maxAge: 24 * 60 * 60 * 1000,
  });

  // 5) Send response
  res.status(201).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
});

// @desc Log In
// @route POST /api/v1/auth/login
// @access Public

exports.login = asyncHandler(async (req, res, next) => {
  // 1) check if password and email in the body (validation)
  // 2) check if user exists & check if password is correct
  const user = await UserModel.findOne({ email: req.body.email });
  if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
    return next(new ApiError("Incorrect Email or Password !!", 401));
  }
  // 3) generate token
  const token = generateToken(user._id);

  // 4) Creating refresh token not that expiry of refresh
  //token is greater than the access token

  const refreshToken = jwt.sign(
    {
      userId: user._id,
    },
    process.env.JWT_REFRESH_SECRET_KEY,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN }
  );

  // 5) Assigning refresh token in http-only cookie
  res.cookie("jwt", refreshToken, {
    httpOnly: true,
    sameSite: "None",
    secure: true,
    maxAge: 24 * 60 * 60 * 1000,
  });

  // 6) send response to client side
  res.status(201).json({
    "Welcome Message": `Welcome back, ${user.name}`,
    "JWT Token": token,
    "Your Data": user,
  });
});

// @desc make sure user is logged in and authorized

exports.authProtect = asyncHandler(async (req, res, next) => {
  // 1) Check if token exists or not, if exist get
  // console.log(req.headers);
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) {
    return next(
      new ApiError(
        `You should login to get authorized resources from this route : ${req.originalUrl} !!`,
        401
      )
    );
  }
  // 2) Verify token (no change happend, not expired)
  const decodedJWT = jwt.verify(token, process.env.JWT_SECRET_KEY);
  // 3) Check if user exists
  const currentUser = await UserModel.findById(decodedJWT.userId);
  if (!currentUser) {
    return next(
      new ApiError("User that belong to that token not existed :'(", 401)
    );
  }

  // 4) Check if user is active
  if (currentUser.active === false) {
    return next(
      new ApiError(
        `User is deactivated, please contact us from <${process.env.EMAIL_USERNAME}> for activation details :'(`,
        401
      )
    );
  }

  // 5) Check if user changed his password after token generated
  if (currentUser.passwordChangedAt) {
    const passChangedTimestamp = parseInt(
      currentUser.passwordChangedAt.getTime() / 1000,
      10
    );

    // password changed after token generated (Error)
    if (passChangedTimestamp > decodedJWT.iat) {
      return next(
        new ApiError(
          "User recently changed password, please login again ...",
          401
        )
      );
    }
  }
  req.token = token;
  req.user = currentUser;
  next();
});

// @desc check if user is allowed to access the route
// @access Private

// roles: ["admin","manager","user"]
exports.allowedTo = (...roles) =>
  asyncHandler((req, res, next) => {
    // 1) access roles
    // 2) access registered user => (req.user.role)
    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError(
          `You're not allowed to access this route, Your Role is: ${req.user.role} !!`,
          403
        )
      );
    }
    next();
  });

// @desc Refresh Token
// @route GET /api/v1/auth/refresh
// @access Private
exports.refresh = asyncHandler(async (req, res, next) => {
  if (req.cookies?.jwt) {
    // Destructuring refreshToken from cookie
    const refreshToken = req.cookies.jwt;

    // Verifying refresh token
    jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET_KEY,
      (err, decoded) => {
        if (err) {
          // Wrong Refesh Token
          return next(
            new ApiError("Unauthorized, Please Login Again to refresh !!", 401)
          );
        } else {
          const user = UserModel.findById(decoded.userId);
          if (!user) {
            return next(
              new ApiError("Unauthorized, Please Login Again !!", 401)
            );
          }
          // Correct token we send a new access token
          const accessToken = jwt.sign(
            {
              userId: decoded.userId,
            },
            process.env.JWT_SECRET_KEY,
            {
              expiresIn: process.env.JWT_EXPIRES_IN,
            }
          );

          return res.status(200).json({
            "New Access Token": accessToken,
          });
        }
      }
    );
  } else {
    return next(new ApiError("Unauthorized, Please Login Again !!", 401));
  }
});

// @desc Forgot Password
// @route POST /api/v1/auth/forgotPassword
// @access Public

exports.forgotPassword = asyncHandler(async (req, res, next) => {
  // 1) Get user based on POSTed email
  const user = await UserModel.findOne({ email: req.body.email });
  if (!user) {
    return next(
      new ApiError(`There is no user with that email ${req.body.email}`, 404)
    );
  }
  // 2) If user exists, generate hashed reset random 6 digit otp and save it in db
  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedResetCode = await crypto
    .createHash("sha256")
    .update(resetCode)
    .digest("hex");

  // Save hashed otp reset code in db
  user.passwordResetCode = hashedResetCode;

  // Add Expiration time for password reset code of 10 minutes
  user.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  user.passwordResetVerifiedMode = false;

  await user.save();

  // 3) Send otp to user's email

  const message = `Hi ${user.name} \n\nWe received a request to reset the password for your account on Shoppily App. \n\nYour password reset code is: ${resetCode} \n\n Please enter this code within 10 minutes.\n\n If you didn't request a password reset, please ignore this message. \n\nThank you 😍.`;

  // Try...Catch for modifying passwordResetCode and passwordResetExpires in case of error
  try {
    await sendEmail({
      email: user.email,
      subject: "Your Password Reset Code (Valid for 10 minutes only)",
      message,
    });
  } catch (err) {
    user.passwordResetCode = undefined;
    user.passwordResetExpires = undefined;
    user.passwordResetVerifiedMode = undefined;
    await user.save();
    return next(
      new ApiError("Email could not be sent. Please try again later :'(", 500)
    );
  }

  res.status(200).json({
    status: "success",
    msg: "Email sent successfully and Reset Code Sent :)",
  });
});

// @desc Verify Password Reset Code
// @route POST /api/v1/auth/verifyPasswordResetCode
// @access Public
exports.verifyPasswordResetCode = asyncHandler(async (req, res, next) => {
  // 1) Get user based on reset code
  const hashedResetCode = await crypto
    .createHash("sha256")
    .update(req.body.resetCode)
    .digest("hex");
  const user = await UserModel.findOne({
    passwordResetCode: hashedResetCode,
    passwordResetExpires: { $gt: Date.now() },
  });
  if (!user) {
    return next(new ApiError(`Reset Code is invalid or has expired :'(`, 404));
  }

  // 2) Reset code valid
  user.passwordResetVerifiedMode = true;
  await user.save();
  res.status(200).json({
    status: "success",
    msg: "Reset Code has been verified successfully :)",
  });
});

// @desc Reset Password
// @route POST /api/v1/auth/resetPassword
// @access Public

exports.resetPassword = asyncHandler(async (req, res, next) => {
  // 1) Get user based on email

  const user = await UserModel.findOne({ email: req.body.email });
  if (!user) {
    return next(
      new ApiError(`There is no user with that email ${req.body.email}`, 404)
    );
  }

  // 2) Check if reset code is verified :D

  if (!user.passwordResetVerifiedMode) {
    return next(new ApiError(`Reset Code is not verified yet :'(`, 400));
  }
  if (!req.body.newPassword) {
    return next(new ApiError(`Please Enter Your New Password :'(`, 404));
  }
  user.password = req.body.newPassword;
  user.passwordResetCode = undefined;
  user.passwordResetExpires = undefined;
  user.passwordResetVerifiedMode = undefined;
  await user.save();

  // 3) if everything is ok, send new token to client
  const token = generateToken(user._id);
  res.status(200).json({
    status: "success",
    msg: "Password has been reset successfully :)",
    "JWT Token": token,
  });
});

// @desc Logout
// @route GET /api/v1/auth/logout
// @access Private

exports.logout = asyncHandler(async (req, res, next) => {
  // Authenticated user ID attached on `req` by authentication middleware
  const userId = req.user._id;
  const user = await UserModel.findById(userId);
  if (!user) {
    return next(
      new ApiError(`${UserModel.modelName} not found for id: ${userId}`, 404)
    );
  }

  if (user.active === false) {
    return res.status(200).json({
      status: `User is deactivated, Please contact admin by <${process.env.EMAIL_USERNAME}> for further details.`,
    });
  }

  // Destroy (logout=>stored in session) JWT Token (Access Token)

  req.token = await jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY, {
    expiresIn: "1s",
  });

  // Destroy Cookie of Refresh Token (Refresh Token)
  const cookies = req.cookies;

  // const authHeader = req.header("Authorization");
  const refreshToken = cookies?.jwt;
  if (!refreshToken) {
    return next(
      new ApiError("Refresh token is not available in cookies :'(", 404)
    );
  }

  // Destroy refresh token cookie
  res.cookie("jwt", "LoggedOut", {
    httpOnly: true,
    expires: new Date(Date.now() + 1 * 1000),
  });

  res.status(201).json({
    status: "You have been logged out successfully :)",
    "New Expired JWT Token": req.token,
  });
});

const { ApiError } = require("../utils/errorHandler");

// Global Error Handling Middleware
const sendErrorForDev = (err, res) =>
  res.status(err.statusCode).json({
    "Error Status": err.status,
    "Error Status Details": err,
    "Error Message": err.message,
    "Error Stack": err.stack,
  });
const sendErrorForProd = (err, res) =>
  res.status(err.statusCode).json({
    "Error Status": err.status,
    "Error Message": err.message,
  });

const handleJWTInvalidSignature = () =>
  new ApiError("Invalid token, please login again ...", 401);

const handleJWTExpired = () =>
  new ApiError("JWT is expired, Try Login again, please !!", 401);
exports.globalErrorHandler = async (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";
  if (process.env.NODE_ENV === "development") sendErrorForDev(err, res);
  else {
    //JsonWebTokenError
    if (err.name === "JsonWebTokenError") err = handleJWTInvalidSignature();
    //TokenExpiredError
    if (err.name === "TokenExpiredError") err = handleJWTExpired();
    sendErrorForProd(err, res);
  }
};

// eslint-disable-next-line import/no-extraneous-dependencies
const rateLimit = require("express-rate-limit");

// this is an example for limiting the number of requests from a single IP

exports.loginLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: function (req) {
    return `Too many login requests from this ${req.headers["x-forwarded-for"] || req.socket.remoteAddress || req.ip} for that route ${`${req.method} ${req.protocol}://${req.get("host")}${req.originalUrl}` || req.path}, please try again after an hour`;
  },
});

exports.registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 15 minutes
  max: 30, // limit each IP to 5 requests per windowMs
  message: function (req) {
    return `Too many register requests from this ${req.headers["x-forwarded-for"] || req.socket.remoteAddress || req.ip} for that route ${`${req.method} ${req.protocol}://${req.get("host")}${req.originalUrl}` || req.path}, please try again after an hour`;
  },
});

exports.verifyEmailLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: function (req) {
    return `Too many verify email requests from this ${req.headers["x-forwarded-for"] || req.socket.remoteAddress || req.ip} for that route ${`${req.method} ${req.protocol}://${req.get("host")}${req.originalUrl}` || req.path}, please try again after an hour`;
  },
});

exports.forgotPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: function (req) {
    return `Too many forgot password requests from this ${req.headers["x-forwarded-for"] || req.socket.remoteAddress || req.ip} for that route ${`${req.method} ${req.protocol}://${req.get("host")}${req.originalUrl}` || req.path}, please try again after an hour`;
  },
});

exports.resetPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: function (req) {
    return `Too many reset password requests from this ${req.headers["x-forwarded-for"] || req.socket.remoteAddress || req.ip} for that route ${`${req.method} ${req.protocol}://${req.get("host")}${req.originalUrl}` || req.path}, please try again after an hour`;
  },
});

exports.changePasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 5 requests per windowMs
  message: function (req) {
    return `Too many change password requests from this ${req.headers["x-forwarded-for"] || req.socket.remoteAddress || req.ip} for that route ${`${req.method} ${req.protocol}://${req.get("host")}${req.originalUrl}` || req.path}, please try again after an hour`;
  },
});

exports.productLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 5 requests per windowMs
  message: function (req) {
    return `Too many product api requests from this ${req.connection.remoteAddress || req.headers["x-forwarded-for"] || req.socket.remoteAddress || req.ip} for that route ${`${req.method} ${req.protocol}://${req.get("host")}${req.originalUrl}` || req.path}, please try again after 10 minutes`;
  },
});

exports.cartLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 15 minutes
  max: 500, // limit each IP to 5 requests per windowMs
  message: function (req) {
    return `Too many cart api requests from this ${req.headers["x-forwarded-for"] || req.socket.remoteAddress || req.ip} for that route ${`${req.method} ${req.protocol}://${req.get("host")}${req.originalUrl}` || req.path}, please try again after 10 minutes`;
  },
});

exports.orderLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 15 minutes
  max: 600, // limit each IP to 5 requests per windowMs
  message: function (req) {
    return `Too many order api requests from this ${req.headers["x-forwarded-for"] || req.socket.remoteAddress || req.ip} for that route ${`${req.method} ${req.protocol}://${req.get("host")}${req.originalUrl}` || req.path}, please try again after 10 minutes`;
  },
});

// TODO: Add more request limiter here what you need

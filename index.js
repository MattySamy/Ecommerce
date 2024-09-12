/* eslint-disable import/no-extraneous-dependencies */
// builtin packages
const path = require("path");

// 3rd party packages
const express = require("express");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const cors = require("cors");
const hpp = require("hpp");
const xss = require("xss-clean");
const mongoSanitize = require("express-mongo-sanitize");
const compression = require("compression");
// CSRF
const Tokens = require("csrf");

const csrfTokens = new Tokens();
const secret = csrfTokens.secretSync();
const csrfToken = csrfTokens.create(secret);

const { ApiError } = require("./utils/errorHandler");
const { globalErrorHandler } = require("./middlewares/error.middleware");
const { mongoConnect } = require("./config/mongo");
const mountRoutes = require("./routes/mountingRoutes");
const { createAdmin } = require("./config/autoAdminCreation");
const continousProductQuantityCheck = require("./config/continousProductQuantityCheck");

const { webhookCheckout } = require("./services/orderService");

// u named the file index.js so, u can just require the directory
dotenv.config({ path: "./config.env" });
const server = express();
const PORT = process.env.PORT || 8000;

// Middlewares
server.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
// Compress all responses
server.use(compression());

server.use((req, res, next) => {
  req.headers["X-CSRF-Token"] = `${csrfToken}#SECRETIS=>${secret}`;
  next();
});

// Checkout Webhook

server.post(
  "/webhook-checkout",
  express.raw({ type: "application/json" }),
  webhookCheckout
);

server.use(
  express.json({
    limit: "20kb",
  })
); // for parsing application/json body becuz it's encoded string

server.use(express.urlencoded({ extended: false }));
server.use(cookieParser());

// Serving static images from uploads directory
// to get amn image => ex: http://localhost:5050/<module_name>/<image_name.extention>
server.use(express.static(path.join(__dirname, "uploads")));

if (process.env.NODE_ENV === "development") {
  server.use(morgan("dev"));
  console.log(`node: ${process.env.NODE_ENV}`);
}

// To apply Data Sanitization to prevent NoSQL Injection
server.use(
  mongoSanitize({
    replaceWith: "_",
  })
);
server.use(xss());

// Global Request Limiter
// const requestLimiter = require("./config/requestLimiter");

// const reqLimiter = requestLimiter({
//   max: 100,
//   windowMs: 60 * 60 * 1000,
//   message: "Too many requests from this IP, please try again in an hour!",
// });

// server.use(reqLimiter);

// Prevent parameter pollution (take last duplicate value of parameter)
// Whitelist is a list of parameters that we want to allows
server.use(
  hpp({
    whitelist: [
      "price",
      "quantity",
      "sold",
      "ratingsAverage",
      "ratingsQuantity",
    ],
  })
);

// Route Handler
mountRoutes(server);

server.all("*", (req, res, next) => {
  // Create Error and send it to error handling middleware
  // const err = new Error(
  //   `Can't find this route ${req.originalUrl} on this server!`
  // );
  // next(err.message);
  next(
    new ApiError(
      `Can't find this route ${req.originalUrl} on this server!`,
      400
    )
  );
});

// Global Error Handling Middleware for express
server.use(globalErrorHandler);
async function startServer() {
  await mongoConnect()
    .then((conn) =>
      console.log(
        `Database is connected to ${conn.connection.name}db and its host is ${conn.connection.host}`
      )
    )
    .catch((err) => {
      console.error("Database connection error: ", err);
      process.exit(1);
    });
  await createAdmin();
  await continousProductQuantityCheck();
  server.listen(PORT, () => {
    console.log(
      `Server started on port ${PORT} on http://localhost:${PORT}/api/v1`
    );
  });
}
module.exports = server;
startServer();
// Handle Rejections outside express
// process.on("unhandledRejection", (err) => {
//   console.log(`Error: ${err.message}`);
//   server.close(() => process.exit(1));
// });

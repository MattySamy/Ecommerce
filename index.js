/* eslint-disable import/no-extraneous-dependencies */
// builtin packages
const path = require("path");

// 3rd party packages
const express = require("express");
const dotenv = require("dotenv");
const cookieparser = require("cookie-parser");
const morgan = require("morgan");
const cors = require("cors");
const compression = require("compression");

const { ApiError } = require("./utils/errorHandler");
const { globalErrorHandler } = require("./middlewares/error.middleware");
const { mongoConnect } = require("./config/mongo");
const { createAdmin } = require("./config/autoAdminCreation");
const continousProductQuantityCheck = require("./config/continousProductQuantityCheck");

const categoryRoute = require("./routes/categoryRoute");
const subCategoryRoute = require("./routes/subCategoryRoute");
const brandRoute = require("./routes/brandRoute");
const productRoute = require("./routes/productRoute");
const userRoute = require("./routes/userRoute");
const authRoute = require("./routes/authRoute");
const reviewRoute = require("./routes/reviewRoute");
const wishlistRoute = require("./routes/wishlistRoute");
const addressRoute = require("./routes/addressRoute");
const couponRoute = require("./routes/couponRoute");
const cartRoute = require("./routes/cartRoute");
const orderRoute = require("./routes/orderRoute");

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

server.use(express.json()); // for parsing application/json body becuz it's encoded string

server.use(express.urlencoded({ extended: false }));
server.use(cookieparser());

// Serving static images from uploads directory
// to get amn image => ex: http://localhost:5050/<module_name>/<image_name.extention>
server.use(express.static(path.join(__dirname, "uploads")));

if (process.env.NODE_ENV === "development") {
  server.use(morgan("dev"));
  console.log(`node: ${process.env.NODE_ENV}`);
}

// Route Handler

server.use("/api/v1/categories", categoryRoute.router);
server.use("/api/v1/subcategories", subCategoryRoute.router);
server.use("/api/v1/brands", brandRoute.router);
server.use("/api/v1/products", productRoute.router);
server.use("/api/v1/users", userRoute.router);
server.use("/api/v1/auth", authRoute.router);
server.use("/api/v1/reviews", reviewRoute.router);
server.use("/api/v1/wishlist", wishlistRoute.router);
server.use("/api/v1/addresses", addressRoute.router);
server.use("/api/v1/coupons", couponRoute.router);
server.use("/api/v1/cart", cartRoute.router);
server.use("/api/v1/orders", orderRoute.router);

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

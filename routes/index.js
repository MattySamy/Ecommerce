const categoryRoute = require("./categoryRoute");
const subCategoryRoute = require("./subCategoryRoute");
const brandRoute = require("./brandRoute");
const productRoute = require("./productRoute");
const userRoute = require("./userRoute");
const authRoute = require("./authRoute");
const reviewRoute = require("./reviewRoute");
const wishlistRoute = require("./wishlistRoute");
const addressRoute = require("./addressRoute");
const couponRoute = require("./couponRoute");
const cartRoute = require("./cartRoute");
const orderRoute = require("./orderRoute");

const mountRoutes = (server) => {
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
};

module.exports = mountRoutes;

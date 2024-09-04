const express = require("express");
const { cartLimiter } = require("../config/requestLimiter");

const {
  addProductToCart,
  getLoggedUserCart,
  removeCartItem,
  clearLoggedUserCart,
  updateCartItemQuantity,
  applyCouponToLoggedUserCart,
} = require("../services/cartService");

const AuthorizedService = require("../services/authService");

const router = express.Router();

router.use(
  cartLimiter,
  AuthorizedService.authProtect,
  AuthorizedService.allowedTo("user")
);

router
  .route("/")
  .post(addProductToCart)
  .get(getLoggedUserCart)
  .delete(clearLoggedUserCart);

router.route("/applyCoupon").put(applyCouponToLoggedUserCart);
router.route("/:itemId").put(updateCartItemQuantity).delete(removeCartItem);

module.exports = { router };

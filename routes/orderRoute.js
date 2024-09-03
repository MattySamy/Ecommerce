const express = require("express");
const {
  createCashOrder,
  getAllOrders,
  filterOrderForUser,
  getOneOrder,
  updateOrderToPaid,
  updateOrderToDelivered,
  checkoutSession,
} = require("../services/orderService");

const AuthorizedService = require("../services/authService");

const router = express.Router();

router.use(AuthorizedService.authProtect);

router
  .route("/:cartId")
  .post(AuthorizedService.allowedTo("user"), createCashOrder);

router
  .route("/checkout-session/:cartId")
  .get(AuthorizedService.allowedTo("user"), checkoutSession);
router
  .route("/")
  .get(
    AuthorizedService.allowedTo("user", "admin", "manager"),
    filterOrderForUser,
    getAllOrders
  );

router
  .route("/:id")
  .get(AuthorizedService.allowedTo("user", "admin", "manager"), getOneOrder);

router.put(
  "/:id/pay",
  AuthorizedService.allowedTo("admin", "manager"),
  updateOrderToPaid
);

router.put(
  "/:id/deliver",
  AuthorizedService.allowedTo("admin", "manager"),
  updateOrderToDelivered
);

module.exports = { router };

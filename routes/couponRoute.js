const express = require("express");
const {
  getCoupons,
  createCoupon,
  getCoupon,
  updateCoupon,
  deleteCoupon,
} = require("../services/couponService");

const AuthorizedService = require("../services/authService");

const router = express.Router();
router.use(
  AuthorizedService.authProtect,
  AuthorizedService.allowedTo("admin", "manager")
);
router.route("/").post(createCoupon).get(getCoupons);

router.route("/:id").get(getCoupon).put(updateCoupon).delete(deleteCoupon);

module.exports = { router };

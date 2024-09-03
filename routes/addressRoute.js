const express = require("express");

const {
  addAddressToUser,
  rmAddressFromUserList,
  getLoggedUserAddresses,
} = require("../services/addressService");

const AuthorizedService = require("../services/authService");

const router = express.Router();

router.use(AuthorizedService.authProtect, AuthorizedService.allowedTo("user"));

router.route("/").post(addAddressToUser).get(getLoggedUserAddresses);

router.delete("/:addressId", rmAddressFromUserList);

module.exports = { router };

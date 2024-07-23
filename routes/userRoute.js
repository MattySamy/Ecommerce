const express = require("express");
const userValidator = require("../utils/validators/user.validator");
const {
  getUsers,
  createUser,
  getUser,
  updateUser,
  deleteUser,
  changeUserPassword,
  uploadUserImage,
  resizeImage,
  getLoggedUserData,
  updateLoggedUserPassword,
  updateLoggedUserData,
  deactivateLoggedUser,
  activateLoggedUser,
} = require("../services/userService");

const AuthorizedService = require("../services/authService");

const router = express.Router();

// Logged User Routes

router.use(AuthorizedService.authProtect);

router.get("/getMyData", getLoggedUserData, getUser);

router.put(
  "/updateMyPassword",
  ...userValidator.changeLoggedUserPasswordValidator,
  updateLoggedUserPassword
);

router.put(
  "/updateMyData",
  uploadUserImage,
  resizeImage,
  ...userValidator.updateLoggedUserValidator,
  updateLoggedUserData
);

router.delete("/deleteMe", deactivateLoggedUser);

// Admin Routes

router.use(AuthorizedService.allowedTo("admin", "manager"));

router.put("/activateUser", activateLoggedUser);

router
  .post(
    "/",
    uploadUserImage,
    resizeImage,
    ...userValidator.createUserValidator,
    createUser
  )
  .get("/", getUsers);

router
  .get("/:id", ...userValidator.getUserValidator, getUser)
  .put(
    "/:id",
    uploadUserImage,
    resizeImage,
    ...userValidator.updateUserValidator,
    updateUser
  )
  .delete("/:id", ...userValidator.deleteUserValidator, deleteUser);

router.put(
  "/changePassword/:id",
  ...userValidator.changeUserPasswordValidator,
  changeUserPassword
);

module.exports = { router };

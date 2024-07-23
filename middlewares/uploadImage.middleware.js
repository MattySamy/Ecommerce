const multer = require("multer");

const { ApiError } = require("../utils/errorHandler");

const multerOptions = () => {
  // 1. Disk Storage Engine

  // const multerStorage = multer.diskStorage({
  //   destination: function (req, file, cb) {
  //     cb(null, "./uploads/categories");
  //   },
  //   filename: function (req, file, cb) {
  //     const ext = file.mimetype.split("/")[1];
  //     cb(null, `category-${uuidv4().split("-").join("")}-${Date.now()}.${ext}`);
  //   },
  // });

  // 2. Memory Sorage Engine (Buffered)

  const imageBufferObj = multer.memoryStorage();

  // File Filter by Type or Extension

  function multerFilter(req, file, cb) {
    const fileType = file.mimetype.split("/")[0];
    if (fileType.startsWith("image")) {
      cb(null, true);
    } else {
      cb(new ApiError("Only Images allowed !!", 400), false);
    }
  }

  const upload = multer({ storage: imageBufferObj, fileFilter: multerFilter });

  return upload;
};

exports.uploadSingleImage = (fieldName) => multerOptions().single(fieldName);

exports.uploadMixOfImages = (arrayFields) =>
  multerOptions().fields(arrayFields);

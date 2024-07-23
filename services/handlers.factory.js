const fs = require("fs");
const path = require("path");

const asyncHandler = require("express-async-handler");
const { ApiError } = require("../utils/errorHandler");
const ApiFeatures = require("../utils/apiFeatures");

exports.deleteOne = (Model) =>
  asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const model = await Model.findByIdAndDelete(id);
    if (!model) {
      return next(
        new ApiError(`${Model.modelName} not found for id: ${id}`, 404)
      );
    }
    res.status(204).json({ msg: "Brand deleted successfully" });
  });

// eslint-disable-next-line default-param-last
exports.updateOne = (Model, imageFieldName = "", saveDirName = "") =>
  asyncHandler(async (req, res, next) => {
    if (Model.modelName === "Category" || Model.modelName === "Brand") {
      if (req.body[imageFieldName]) {
        const model = await Model.findById(req.params.id);

        // Get path of old image
        const rightPathAfterMongooseMiddleware = [
          ...new Set(
            path
              .join(__dirname, "uploads", saveDirName, model[imageFieldName])
              .split("\\")
              .filter(
                (el) =>
                  !el.includes("http:") &&
                  !el.includes(`localhost:${process.env.PORT}`) &&
                  !el.includes("services")
              )
          ),
        ].join("\\");

        // Delete old image and create new one
        if (
          model[imageFieldName] &&
          fs.existsSync(rightPathAfterMongooseMiddleware)
        ) {
          await fs.unlink(rightPathAfterMongooseMiddleware, (err) => {
            if (err) console.log(err);
            console.log("File deleted successfully");
          });
        }
      }
    }

    if (
      Model.modelName === "Product" &&
      (req.body.imageCover || imageFieldName === "imageCover")
    ) {
      const model = await Model.findById(req.params.id);

      // Get path of old image
      const rightPathAfterMongooseMiddleware = [
        ...new Set(
          path
            .join(__dirname, "uploads", saveDirName, model[imageFieldName])
            .split("\\")
            .filter(
              (el) =>
                !el.includes("http:") &&
                !el.includes(`localhost:${process.env.PORT}`) &&
                !el.includes("services")
            )
        ),
      ].join("\\");

      // Delete old image and create new one
      if (
        model[imageFieldName] &&
        fs.existsSync(rightPathAfterMongooseMiddleware)
      ) {
        await fs.unlink(rightPathAfterMongooseMiddleware, (err) => {
          if (err) console.log(err);
          console.log("File deleted successfully");
        });
      }
    }

    // Update model
    const model = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!model) {
      return next(
        new ApiError(
          `${Model.modelName} not found for id: ${req.params.id}`,
          404
        )
      );
    }
    res.status(200).json({ data: model });
  });

exports.createOne = (Model) =>
  asyncHandler(async (req, res) => {
    const model = await Model.create(req.body);
    res.status(201).json({ data: model });
  });

exports.getOne = (Model, populateOptions = null) =>
  asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    // Build Query
    let model = Model.findById(id);
    if (populateOptions) {
      model = model.populate(populateOptions);
    }

    // Execute Query
    model = await model;
    if (!model) {
      return next(
        new ApiError(
          `${Model.modelName} not found for id: ${req.params.id}`,
          404
        )
      );
    }
    // res stops the middleware chain
    res.status(200).json({ data: model });
  });

exports.getAll = (Model) =>
  asyncHandler(async (req, res) => {
    // Build Query
    const countDocuments = await Model.countDocuments();
    const apiFeatures = new ApiFeatures(
      Model.find(req.filterObj || {}),
      req.query
    )
      .paginate(req, countDocuments)
      .filter(req)
      .sort()
      .search(Model.modelName)
      .limitFields();

    // Execute Query
    const { mongooseQuery, paginationResult } = apiFeatures;
    const Docs = await mongooseQuery;
    res.status(200).json({
      results: Docs.length,
      pagination: paginationResult,
      data: Docs,
    });
  });

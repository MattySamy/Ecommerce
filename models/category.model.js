/* eslint-disable prefer-arrow-callback */
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

const categorySchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      unique: [true, "Category name must be unique"],
      minlength: [3, "Too short category name"],
      maxLength: [32, "Too long category name"],
    },
    // A and B => /a-and-b
    slug: {
      type: String,
      lowercase: true,
    },
    Image: String,
  },
  { timestamps: true }
);

const setImageURL = (doc) => {
  // Set image base url + image name
  if (doc.Image) {
    const imageURL = `${process.env.BASE_URL}:${process.env.PORT || 5050}/categories/${doc.Image}`;
    doc.Image = imageURL;
  }
};

const getImageURL = (doc) => {
  // Set image base url + image name
  if (doc.Image) {
    const imageURL = `${process.env.BASE_URL}:${process.env.PORT || 5050}/categories/${doc.Image}`;
    return imageURL;
  }
};

categorySchema.post("save", async function (error, doc, next) {
  if (error.name === "MongoServerError" && error.code === 11000) {
    if (doc.Image) {
      const imageURL = getImageURL(doc);
      const rightPath = [
        ...new Set(
          path
            .join(__dirname, "uploads", "categories", imageURL)
            .split("\\")
            .filter(
              (el) =>
                !el.includes("http:") &&
                !el.includes(`localhost:${process.env.PORT}`) &&
                !el.includes("models")
            )
        ),
      ].join("\\");
      await fs.unlink(rightPath, (err) => {
        if (err) console.log(err);
      });
    }
    next(error);
  } else {
    next();
  }
});

// after get, update or init
categorySchema.post("init", (doc) => setImageURL(doc));

// after create or save
categorySchema.post("save", (doc) => setImageURL(doc));

const CategoryModel = mongoose.model("Category", categorySchema);

module.exports = CategoryModel;

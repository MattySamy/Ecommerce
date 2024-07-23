/* eslint-disable prefer-arrow-callback */
const path = require("path");
const fs = require("fs");

const mongoose = require("mongoose");

const brandSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Brand name is required"],
      unique: [true, "Brand name must be unique"],
      minlength: [3, "Too short Brand name"],
      maxLength: [32, "Too long Brand name"],
    },
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
    const imageURL = `${process.env.BASE_URL}:${process.env.PORT || 5050}/brands/${doc.Image}`;
    doc.Image = imageURL;
  }
};

const getImageURL = (doc) => {
  // Set image base url + image name
  if (doc.Image) {
    const imageURL = `${process.env.BASE_URL}:${process.env.PORT || 5050}/brands/${doc.Image}`;
    return imageURL;
  }
};

brandSchema.post("save", async function (error, doc, next) {
  if (error.name === "MongoServerError" && error.code === 11000) {
    if (doc.Image) {
      const imageURL = getImageURL(doc);
      const rightPath = [
        ...new Set(
          path
            .join(__dirname, "uploads", "brands", imageURL)
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
brandSchema.post("init", (doc) => setImageURL(doc));

// after create or save
brandSchema.post("save", (doc) => setImageURL(doc));

module.exports = mongoose.model("Brand", brandSchema);

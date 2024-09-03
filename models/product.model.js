/* eslint-disable prefer-arrow-callback */
const fs = require("fs");
const path = require("path");

const mongoose = require("mongoose");

const productSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      minLength: [3, "Too short product title"],
      maxLength: [100, "Too long product title"],
    },
    slug: {
      type: String,
      required: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      minLength: [20, "Too short product description"], // with string type
    },
    quantity: {
      type: Number,
      required: [true, "Product Quantity is required"],
    },
    isOutOfStock: {
      type: Boolean,
      default: false,
    },
    removeProductsThatAreOutOfStock: {
      type: Boolean,
      default: true,
      required: true,
    },
    sold: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, "Product price is required"],
      trim: true,
      max: [2000000, "Too long product price"],
    },
    priceAfterDiscount: {
      type: Number,
    },
    colors: [{ type: String, trim: true }],
    images: [{ type: String }],
    imageCover: {
      type: String,
      required: [true, "Product image cover is required"],
    },
    category: {
      type: mongoose.Schema.ObjectId,
      ref: "Category",
      required: [true, "Product must belong to a specific category"],
    },
    subCategories: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "SubCategory",
      },
    ],
    brand: {
      type: mongoose.Schema.ObjectId,
      ref: "Brand",
    },
    ratingsAverage: {
      type: Number,
      default: 1.0,
      min: [1, "Rating must be above or equal 1.0"], // with Number
      max: [5, "Rating must be below or equal 5.0"],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,

    // Another way

    // virtuals: {
    //   reviews: {
    //     ref: "Review",
    //     localField: "_id",
    //     foreignField: "product",
    //   },
    // },

    // To enable virtual populate
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

productSchema.virtual("reviews", {
  ref: "Review",
  localField: "_id",
  foreignField: "product",
});

productSchema.pre("save", function (next) {
  if (this.quantity <= 0 || this.sold < 0) {
    this.isOutOfStock = true;
  }

  next();
});

// Mongoose Query Middleware
productSchema.pre(/^find/, function (next) {
  this.populate({
    path: "category subCategories",
    select: "name category -_id",
  });
  next();
});

const setImageURL = (doc) => {
  // Set image base url + image name
  if (doc.imageCover) {
    const imageURL = `${process.env.BASE_URL}:${process.env.PORT || 5050}/products/${doc.imageCover}`;
    doc.imageCover = imageURL;
  }

  if (doc.images) {
    const imagesList = [];
    doc.images.forEach((image) => {
      const imageURL = `${process.env.BASE_URL}:${process.env.PORT || 5050}/products/${image}`;
      imagesList.push(imageURL);
    });

    doc.images = imagesList;
  }
};

const getImageURL = (doc) => {
  if (doc.imageCover) {
    const imageURL = `${process.env.BASE_URL}:${process.env.PORT || 5050}/products/${doc.imageCover}`;
    return imageURL;
  }
};

productSchema.post("save", async function (error, doc, next) {
  if (error.name === "MongoServerError" && error.code === 11000) {
    if (doc.imageCover) {
      const imageURL = getImageURL(doc);
      const rightPath = [
        ...new Set(
          path
            .join(__dirname, "uploads", "products", imageURL)
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
      next(error);
    }
  } else {
    next();
  }
});

// after get, update or init
productSchema.post("init", (doc) => setImageURL(doc));

// after create or save
productSchema.post("save", (doc) => setImageURL(doc));

module.exports = mongoose.model("Product", productSchema);

const mongoose = require("mongoose");
const ProductModel = require("./product.model");

const reviewSchema = mongoose.Schema(
  {
    title: {
      type: String,
    },
    ratings: {
      type: Number,
      min: [1, "Rating min must be 1.0"],
      max: [5, "Rating max must be 5.0"],
      required: [true, "Rating is required for review !!"],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Review must belong to a user"],
    },

    // parent refrence (one to many)
    product: {
      type: mongoose.Schema.ObjectId,
      ref: "Product",
      required: [true, "Review must belong to a specific product"],
    },
  },
  { timestamps: true }
);

reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: "user",
    select: "name email",
  });
  next();
});

// Important: Static Method
reviewSchema.statics.calcAverageRatingsAndQuantity = async function (
  productId
) {
  const stats = await this.aggregate([
    // Stage 1: Get all reviews of specific product
    {
      $match: {
        product: productId,
      },
    },

    // Stage 2: Group them by product id
    {
      $group: {
        _id: "$product",
        avgRatings: { $avg: "$ratings" },
        ratingsQuantity: { $sum: 1 }, // 1 => counter of ratings
      },
    },
  ]);
  // console.log(stats);
  if (stats.length > 0) {
    await ProductModel.findByIdAndUpdate(productId, {
      ratingsQuantity: stats[0].ratingsQuantity,
      ratingsAverage: stats[0].avgRatings.toFixed(1),
    });
  } else {
    await ProductModel.findByIdAndUpdate(productId, {
      ratingsQuantity: 0,
      ratingsAverage: 0,
    });
  }
};

reviewSchema.post("save", async function () {
  await this.constructor.calcAverageRatingsAndQuantity(this.product);
});

reviewSchema.post("remove", async function () {
  await this.constructor.calcAverageRatingsAndQuantity(this.product);
});

module.exports = mongoose.model("Review", reviewSchema);

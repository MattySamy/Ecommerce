const mongoose = require("mongoose");

const UserModel = require("./user.model");

const orderSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Order must belong to a user"],
    },
    cartItems: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: Number,
        color: String,
        price: Number,
      },
    ],
    taxPrice: { type: Number, default: 0 },
    shippingPrice: { type: Number, default: 0 },
    totalOrderPrice: { type: Number },
    paymentMethodType: {
      type: String,
      enum: ["card", "cash"],
      default: "cash",
    },
    shippingAddress: {
      alias: String,
      details: String,
      phone: String,
      postalCode: String,
      city: String,
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    paidAt: Date,
    isDelivered: {
      type: Boolean,
      default: false,
    },
    deliveredAt: Date,
  },
  {
    timestamps: true,
  }
);

orderSchema.pre("save", async function (next) {
  if (this.shippingAddress.length > 0) {
    return next();
  }
  const user = await UserModel.findById(this.user);
  this.shippingAddress = user.addresses[0];
  next();
});

orderSchema.pre(/^find/, function (next) {
  this.populate({
    path: "user",
    select: "name profileImg email phone",
  }).populate({
    path: "cartItems.product",
    select: "title imageCover price -category -subCategories",
  });

  next();
});
module.exports = mongoose.model("Order", orderSchema);

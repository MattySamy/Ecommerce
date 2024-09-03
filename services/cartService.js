const asyncHandler = require("express-async-handler");

const { ApiError } = require("../utils/errorHandler");

const CartModel = require("../models/cart.model");

const ProductModel = require("../models/product.model");

const CouponModel = require("../models/coupon.model");

const calculateCartTotalPrice = (cart) => {
  let totalPrice = 0;
  cart.cartItems.forEach((item) => {
    totalPrice += item.price * item.quantity;
  });
  cart.totalCartPrice = totalPrice;
  cart.totalPriceAfterDiscount = undefined;
};

// @desc Add product to cart
// @route POST /api/v1/cart
// @access Private (User)

exports.addProductToCart = asyncHandler(async (req, res, next) => {
  const { productId, color } = req.body;

  const product = await ProductModel.findById(productId);

  if (!product) {
    return next(new ApiError(`Product not found for id: ${productId}`, 404));
  }

  if (product.quantity === 0) {
    return next(new ApiError(`this product is out of stock`, 404));
  }
  // TODO: 1) Get Cart for logged user
  let cart = await CartModel.findOne({ user: req.user._id });
  if (!cart) {
    // TODO: 2) If cart not found, create new cart for logged user
    cart = await CartModel.create({
      user: req.user._id,
      // We can use here $addToSet Operator
      cartItems: [
        {
          product: productId,
          color,
          price: product.price,
        },
      ],
    });
  } else {
    // TODO: 3) If cart found, check if product already exists
    const productExist = cart.cartItems.findIndex(
      (item) => item.product.toString() === productId && item.color === color
    );
    if (productExist > -1) {
      // TODO: 4) If product exists, increase quantity
      const cartItem = cart.cartItems[productExist];
      cartItem.quantity += 1;

      cart.cartItems[productExist] = cartItem;
    } else {
      // TODO: 5) Push new product to cart items
      cart.cartItems.push({
        product: productId,
        color,
        price: product.price,
      });
    }
  }

  // // TODO: 6) Increase product sold in stock
  // We can use bulkWrite with $inc operator here because here performance is better because we reduce number of network trips to database server and thus increase performance
  // product.sold += 1;
  // product.quantity -= 1;
  // await product.save();

  // TODO: 7) Calculate total cart price
  calculateCartTotalPrice(cart);

  // TODO: 8) Save cart
  await cart.save();

  res.status(200).json({
    success: true,
    message: "Product added to cart successfully",
    data: cart,
  });
});

// @desc Get logged user cart
// @route GET /api/v1/cart
// @access Private (User)

exports.getLoggedUserCart = asyncHandler(async (req, res, next) => {
  const cart = await CartModel.findOne({ user: req.user._id }).populate({
    path: "cartItems.product",
    model: "Product",
    select: "-__v -price",
  });

  if (!cart) {
    return next(
      new ApiError(`There is no cart for logged user ${req.user.name}`, 404)
    );
  }

  res.status(200).json({
    status: "success",
    numOfCartItems: cart.cartItems.length,
    data: cart,
  });
});

// @desc Remove specific cart item from cart
// @route DELETE /api/v1/cart/:itemId
// @access Private (User)

exports.removeCartItem = asyncHandler(async (req, res, next) => {
  const { itemId } = req.params;

  const cartExists = await CartModel.findOne({
    user: req.user._id,
  });

  const cartItem = cartExists.cartItems.find(
    (item) => item._id.toString() === itemId
  );

  if (!cartItem) {
    return next(new ApiError(`Cart item not found for id: ${itemId}`, 404));
  }

  // // TODO: 1) Decrease product sold in stock
  // We can use bulkWrite with $inc operator here
  // const product = await ProductModel.findById(cartItem.product);
  // product.quantity += cartItem.quantity;
  // product.sold -= cartItem.quantity;
  // await product.save();

  const cart = await CartModel.findOneAndUpdate(
    { user: req.user._id },
    {
      $pull: {
        cartItems: { _id: itemId },
      },
    },
    {
      new: true,
    }
  );

  calculateCartTotalPrice(cart);
  await cart.save();

  res.status(200).json({
    status: "success",
    numOfCartItems: cart.cartItems.length,
    data: cart,
  });
});

// @desc Clear logged user cart
// @route DELETE /api/v1/cart
// @access Private (User)

exports.clearLoggedUserCart = asyncHandler(async (req, res, next) => {
  const cartExists = await CartModel.findOne({ user: req.user._id });

  if (!cartExists) {
    return next(
      new ApiError(`There is no cart for logged user ${req.user.name}`, 404)
    );
  }

  // // TODO: 1) Decrease product sold in stock
  // We can use bulkWrite with $inc operator here

  // const allCartItems = cartExists.cartItems;

  // allCartItems.forEach(async (item) => {
  //   const product = await ProductModel.findById(item.product);
  //   product.quantity += item.quantity;
  //   product.sold -= item.quantity;
  //   await product.save();
  // });

  const cart = await CartModel.findOneAndDelete({
    user: req.user._id,
  });

  if (!cart) {
    return next(
      new ApiError(`There is no cart for logged user ${req.user.name}`, 404)
    );
  }

  res.status(200).json({
    status: "success",
    msg: "Cart cleared successfully",
    numOfCartItems: 0,
    data: null,
  });
});

// @desc Update cart item quantity
// @route PUT /api/v1/cart/:itemId
// @access Private (User)

exports.updateCartItemQuantity = asyncHandler(async (req, res, next) => {
  const { itemId } = req.params;
  const { quantity } = req.body;

  const cartExists = await CartModel.findOne({
    user: req.user._id,
  });

  const cartItem = cartExists.cartItems.find(
    (item) => item._id.toString() === itemId
  );

  if (!cartItem) {
    return next(
      new ApiError(`Cart item not found for user ${req.user.name}`, 404)
    );
  }

  const product = await ProductModel.findById(cartItem.product);
  if (!product) {
    return next(
      new ApiError(`Product not found for id: ${cartItem.product}`, 404)
    );
  }

  if (quantity > product.quantity) {
    return next(
      new ApiError(
        `Quantity must be less than or equal to ${product.quantity} item${
          product.quantity > 1 ? "s" : ""
        }`,
        404
      )
    );
  }

  if (quantity < 1) {
    return next(
      new ApiError(
        `Quantity must be greater than 0 item${quantity > 1 ? "s" : ""}`,
        404
      )
    );
  }

  // // TODO: 1) Decrease product sold in stock
  // We can use bulkWrite with $inc operator here
  // const product = await ProductModel.findById(cartItem.product);
  // product.quantity += cartItem.quantity;
  // product.sold -= cartItem.quantity;
  // await product.save();
  // console.log(product.quantity, product.sold);

  const cart = await CartModel.findOneAndUpdate(
    {
      user: req.user._id,
      cartItems: {
        $elemMatch: {
          _id: itemId,
        },
      },
    },
    {
      $set: {
        "cartItems.$.quantity": quantity,
      },
    },
    {
      new: true,
    }
  );

  // We can use bulkWrite with $inc operator here
  // product.quantity -= quantity;
  // product.sold += quantity;
  // await product.save();

  // console.log(product.quantity, product.sold);

  calculateCartTotalPrice(cart);

  await cart.save();

  res.status(200).json({
    status: "success",
    numOfCartItems: cart.cartItems.length,
    data: cart,
  });
});

// @desc Apply coupon to logged user cart
// @route POST /api/v1/cart/applyCoupon
// @access Private (User)

exports.applyCouponToLoggedUserCart = asyncHandler(async (req, res, next) => {
  // 1) Get coupon based on coupon name
  const coupon = await CouponModel.findOne({
    name: req.body.coupon,
    expiry: {
      $gt: Date.now(),
    },
  });

  if (!coupon) {
    return next(
      new ApiError(`Coupon ${req.body.coupon} is invalid or expired`, 404)
    );
  }

  // 2) Get logged user cart to get total cart price
  const cart = await CartModel.findOne({ user: req.user._id });

  if (!cart) {
    return next(
      new ApiError(`There is no cart for logged user ${req.user.name}`, 404)
    );
  }

  const totalPrice = cart.totalCartPrice;

  // 3) Calculate price after discount

  let totalPriceAfterDiscount = 0;

  if (coupon.type === "fixed") {
    totalPriceAfterDiscount = totalPrice - coupon.discount;
  } else if (coupon.type === "percentage") {
    totalPriceAfterDiscount = (
      totalPrice -
      (totalPrice * coupon.discount) / 100
    ).toFixed(2);
  }

  cart.totalPriceAfterDiscount = totalPriceAfterDiscount;

  cart.coupon = coupon._id;

  await cart.save();

  res.status(200).json({
    status: "success",
    numOfCartItems: cart.cartItems.length,
    data: cart,
  });
});

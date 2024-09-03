const asyncHandler = require("express-async-handler");
// eslint-disable-next-line import/no-extraneous-dependencies
const stripe = require("stripe")(process.env.STRIPE_SECRET);

const { ApiError } = require("../utils/errorHandler");
const factory = require("./handlers.factory");
const OrderModel = require("../models/order.model");
const CartModel = require("../models/cart.model");
const ProductModel = require("../models/product.model");
const CouponModel = require("../models/coupon.model");
const UserModel = require("../models/user.model");

// @desc Create cash order
// @route POST /api/v1/orders/:cartId
// @access Private (User)

exports.createCashOrder = asyncHandler(async (req, res, next) => {
  // App Settings by admin
  const taxPrice = 0;
  const shippingPrice = 0;
  // TODO: 1) Get cart depend on cartId
  const cart = await CartModel.findById(req.params.cartId);

  if (!cart) {
    return next(
      new ApiError(`No cart found with id: ${req.params.cartId}`, 404)
    );
  }
  // TODO: 2) Get order price depend on cart price "Check if coupon is applied or not"
  const cartPrice = cart.totalPriceAfterDiscount
    ? cart.totalPriceAfterDiscount
    : cart.totalCartPrice;
  const totalOrderPrice = cartPrice + taxPrice + shippingPrice;
  // TODO: 3) Create order with default paymentMethodType "cash"
  const order = await OrderModel.create({
    user: req.user._id,
    cartItems: cart.cartItems,
    totalOrderPrice,
    shippingAddress: req.body.shippingAddress,
  });

  // TODO: 4) After creating order, decrement product quantity and increment product sold
  if (order) {
    const bulkOption = cart.cartItems.map((item) => ({
      updateOne: {
        filter: {
          _id: item.product,
        },
        update: {
          $inc: {
            quantity: -item.quantity,
            sold: +item.quantity,
          },
        },
      },
    }));
    await ProductModel.bulkWrite(bulkOption, {
      writeConcern: { w: "majority" },
      ordered: false,
    }); // bulkWrite: Update many documents by various operations

    // TODO: 5) Clear cart
    await CartModel.findByIdAndDelete(req.params.cartId);
  }

  res.status(201).json({
    status: "success",
    data: order || "No order created, try again",
  });
});

exports.filterOrderForUser = asyncHandler(async (req, res, next) => {
  if (req.user.role === "user")
    req.filterObj = {
      user: req.user._id,
    };
  next();
});

// @desc Get all orders
// @route GET /api/v1/orders
// @access Protected (Admin/User/Manager)

exports.getAllOrders = factory.getAll(OrderModel);

// @desc Get single order
// @route GET /api/v1/orders/:id
// @access Protected (Admin/User/Manager)

exports.getOneOrder = factory.getOne(OrderModel);

// @desc Update paid status of order
// @route PUT /api/v1/orders/:id
// @access Protected (Admin/Manager)

exports.updateOrderToPaid = asyncHandler(async (req, res, next) => {
  const order = await OrderModel.findById(req.params.id);

  if (!order) {
    return next(new ApiError(`No order found with id: ${req.params.id}`, 404));
  }

  order.isPaid = true;
  order.paidAt = Date.now();

  const updatedOrder = await order.save();

  res.status(200).json({
    status: "success",
    data: updatedOrder,
  });
});

// @desc Update delivered status of order
// @route PUT /api/v1/orders/:id
// @access Protected (Admin/Manager)

exports.updateOrderToDelivered = asyncHandler(async (req, res, next) => {
  const order = await OrderModel.findById(req.params.id);

  if (!order) {
    return next(new ApiError(`No order found with id: ${req.params.id}`, 404));
  }

  order.isDelivered = true;
  order.deliveredAt = Date.now();

  const updatedOrder = await order.save();

  res.status(200).json({
    status: "success",
    data: updatedOrder,
  });
});

// @desc  Get checkout session from Stripe and send it as response
// @route GET /api/v1/orders/checkout-session/:cartId
// @access Private (User)

exports.checkoutSession = asyncHandler(async (req, res, next) => {
  // app settings
  const taxPrice = 0.5;
  const shippingPrice = 20;

  // 1) Get cart based on cartId
  const cart = await CartModel.findById(req.params.cartId);
  if (!cart) {
    return next(
      new ApiError(`There is no such cart with id ${req.params.cartId}`, 404)
    );
  }

  // 2) Get order price based on cart price and check if a coupon applies
  // const cartPrice = cart.totalPriceAfterDiscount
  //   ? cart.totalPriceAfterDiscount
  //   : cart.totalCartPrice;

  // const minimumAmountEGP = 24.5; // Roughly $0.50 in EGP
  // const totalOrderPrice = Math.max(cart.totalCartPrice, minimumAmountEGP);

  // Assuming coupon discount is applied and stored in the cart model
  // const couponDiscount =
  //   cart.totalPriceAfterDiscount &&
  //   cart.totalPriceAfterDiscount - cart.totalCartPrice < 0
  //     ? cart.totalCartPrice - cart.totalPriceAfterDiscount
  //     : 0;

  // 3) Adjust the total price for tax, shipping, and minimum amount
  // const finalOrderPrice =
  //   cart.totalCartPrice - couponDiscount + taxPrice + shippingPrice;
  const couponDetails = await CouponModel.findById(cart.coupon._id);

  if (!couponDetails) {
    return next(
      new ApiError(`There is no coupon with id ${cart.coupon._id}`, 404)
    );
  }

  console.log(couponDetails);

  let coupon = {};

  if (couponDetails.type === "percentage") {
    coupon = await stripe.coupons.create({
      name: couponDetails.name,
      percent_off: couponDetails.discount,
      duration: "once",
    });
  } else if (couponDetails.type === "fixed") {
    coupon = await stripe.coupons.create({
      name: couponDetails.name,
      amount_off: couponDetails.discount * 100,
      currency: "egp",
      duration: "once",
    });
  }

  // 4) Create Stripe checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      ...cart.cartItems.map((item) => ({
        price_data: {
          currency: "egp",
          product_data: {
            name: item.product.title,
            description: item.product.description,
            images: [
              item.product.imageCover.split(
                `http://localhost:5050/products/`
              )[1],
            ],
          },
          unit_amount: item.product.price * 100,
        },
        quantity: item.quantity,
      })),
      {
        price_data: {
          currency: "egp",
          product_data: {
            name: "Tax",
            description: "Applicable tax for the order",
            images: [
              "https://th.bing.com/th/id/OIP.fX8qQSRfvAYZEmQ8NM3FowHaHa?w=186&h=186&c=7&r=0&o=5&dpr=1.3&pid=1.7",
            ],
          },
          unit_amount: taxPrice * 100, // convert to piasters/cents
        },
        quantity: 1,
      },
      {
        price_data: {
          currency: "egp",
          product_data: {
            name: "Shipping",
            description: "Shipping fee for the order",
            images: [
              "https://th.bing.com/th/id/OIP.UD8F-E066avpNksW9FiAmgHaHa?w=181&h=182&c=7&r=0&o=5&dpr=1.3&pid=1.7",
            ],
          },
          unit_amount: shippingPrice * 100, // convert to piasters/cents
        },
        quantity: 1,
      },
    ],
    discounts: [
      {
        coupon: coupon.id,
      },
    ],
    mode: "payment",
    success_url: `${req.protocol}://${req.get("host")}/api/v1/orders`,
    cancel_url: `${req.protocol}://${req.get("host")}/api/v1/cart`,
    customer_email: req.user.email,
    client_reference_id: req.params.cartId,
    metadata: {
      shippingAddress: JSON.stringify(req.body.shippingAddress),
      shippingAddressDefault: JSON.stringify(req.user.addresses[0]),
    },
  });

  // 5) Send session to response
  res.status(200).json({ status: "success", session, coupon });
});

const createCardOrder = async (session) => {
  const cartId = session.client_reference_id;
  const shippingAddress = session.metadata.shippingAddress
    ? JSON.parse(session.metadata.shippingAddress)
    : JSON.parse(session.metadata.shippingAddressDefault);
  const orderPrice = session.amount_total / 100;
  const cart = await CartModel.findOne({ _id: cartId });
  const user = await UserModel.findOne({ email: session.customer_email });

  // TODO: 3) Create order with default paymentMethodType "cash"
  const order = await OrderModel.create({
    user: user._id,
    cartItems: cart.cartItems,
    shippingAddress,
    totalOrderPrice: orderPrice,
    isPaid: true,
    paymentMethodType: "card",
    paidAt: Date.now(),
  });

  if (order) {
    const bulkOption = cart.cartItems.map((item) => ({
      updateOne: {
        filter: {
          _id: item.product,
        },
        update: {
          $inc: {
            quantity: -item.quantity,
            sold: +item.quantity,
          },
        },
      },
    }));
    await ProductModel.bulkWrite(bulkOption, {
      writeConcern: { w: "majority" },
      ordered: false,
    }); // bulkWrite: Update many documents by various operations

    // TODO: 5) Clear cart
    await CartModel.findByIdAndDelete(cartId);
  }
};

// @desc This webhook will be triggered when a payment succeeds paid
// @route POST /webhook-checkout
// @access Private(User)

exports.webhookCheckout = asyncHandler(async (req, res, next) => {
  const sig = req.headers["stripe-signature"];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    // Create Order
    createCardOrder(event.data.object);
  }

  res.status(200).json({ received: true });
});

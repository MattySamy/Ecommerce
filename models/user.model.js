/* eslint-disable prefer-arrow-callback */
/* eslint-disable import/no-extraneous-dependencies */
const path = require("path");
const fs = require("fs");

const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      minlength: [3, "Too short name"],
      maxlength: [32, "Too long name"],
      trim: true,
    },
    slug: {
      type: String,
      lowercase: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: [true, "Email must be unique"],
      lowercase: true,
    },
    phone: {
      type: String,
    },
    profileImg: String,
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Too short password"],
    },
    passwordChangedAt: {
      type: Date,
    },
    passwordResetVerifiedMode: Boolean,
    passwordResetCode: String,
    passwordResetExpires: Date,
    // Not Required in schema
    // passwordConfirm: {
    //   type: String,
    //   required: [true, "Please confirm your password"],
    //   validate: {
    //     validator: function (el) {
    //       return el === this.password;
    //     },
    //     message: "Passwords are not the same",
    //   },
    // },
    role: {
      type: String,
      enum: ["user", "admin", "manager"],
      default: "user",
    },
    active: {
      type: Boolean,
      default: true,
    },
    // // Embedded documents

    // addresses: [{
    //     title: String,
    //     address: String,
    //     city: String,
    //     state: String,
    //     country: String,
    //     pincode: String
    // }],
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  // Hashing user password on create
  const salt = await bcrypt.hash(this.password, 12);
  this.password = salt;
  next();
});

const setImageURL = (doc) => {
  // Set image base url + image name
  if (doc.profileImg) {
    const imageURL = `${process.env.BASE_URL}:${process.env.PORT || 5050}/users/${doc.profileImg}`;
    doc.profileImg = imageURL;
  }
};

const getImageURL = (doc) => {
  if (doc.profileImg) {
    const imageURL = `${process.env.BASE_URL}:${process.env.PORT || 5050}/users/${doc.profileImg}`;
    return imageURL;
  }
};

userSchema.post("save", async function (error, doc, next) {
  if (error.name === "MongoServerError" && error.code === 11000) {
    if (doc.imageCover) {
      const imageURL = getImageURL(doc);
      const rightPath = [
        ...new Set(
          path
            .join(__dirname, "uploads", "users", imageURL)
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
  }
});

// after get, update or init
userSchema.post("init", (doc) => setImageURL(doc));

// after create or save
userSchema.post("save", (doc) => setImageURL(doc));

module.exports = mongoose.model("User", userSchema);

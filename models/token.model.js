const mongoose = require("mongoose");

const { Schema } = mongoose;

const tokenSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  token: {
    type: String,
    required: true,
  },
});

const Token = mongoose.model("token", tokenSchema);

module.exports = Token;

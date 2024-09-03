const mongoose = require("mongoose");

require("dotenv").config({ path: "./config.env" });

const MONGO_URI = process.env.MONGODB_URI;

mongoose.connection.once("open", () => {
  console.log("Connection is successful !!");
});

mongoose.connection.on("error", (err) => {
  console.error(`There's an error occurred: ${err} !!`);
});

async function mongoConnect(URI = MONGO_URI) {
  return await mongoose.connect(URI);
}

async function mongoDisconnect() {
  await mongoose.disconnect();
}

module.exports = {
  mongoConnect,
  mongoDisconnect,
};

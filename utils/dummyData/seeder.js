const fs = require("fs");
const path = require("path");
// eslint-disable-next-line import/no-extraneous-dependencies

require("colors");
const dotenv = require("dotenv");
const ProductModel = require("../../models/product.model");
const { mongoConnect } = require("../../config/mongo");

dotenv.config({ path: "../../config.env" });

// connect to DB
mongoConnect(process.env.DB_URI);

// Read data
const products = JSON.parse(
  fs.readFileSync(path.join(__dirname, "products.json"))
);

// Insert data into DB
const insertData = async () => {
  try {
    await ProductModel.create(products);
    console.log("Data Inserted".green.inverse);
    process.exit();
  } catch (error) {
    console.log(error);
  }
};

// Delete data from DB
const destroyData = async () => {
  try {
    await ProductModel.deleteMany();
    console.log("Data Destroyed".red.inverse);
    process.exit();
  } catch (error) {
    console.log(error);
  }
};

// node seeder.js -d
if (process.argv[2] === "-i") {
  insertData();
} else if (process.argv[2] === "-d") {
  destroyData();
}

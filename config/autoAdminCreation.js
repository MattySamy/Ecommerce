const UserModel = require("../models/user.model");

exports.createAdmin = async () => {
  // Check if admin exists and create one if not
  const adminExists = await UserModel.findOne({
    name: "admin",
    email: "admin@gmail.com",
    role: "admin",
    slug: "admin",
  });
  if (!adminExists) {
    await UserModel.create({
      name: "admin",
      slug: "admin",
      email: "admin@gmail.com",
      password: "admin@2002",
      phone: "01123456789",
      role: "admin",
      active: true,
    })
      .then(() => console.log("Admin created successfully by default !!"))
      .catch((err) => console.log(err));
  }
};

require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const hashedPassword = await bcrypt.hash("itc12345", 10);

  await User.create({
    username: "itcadmin",
    password: "itc12345",
  });

  console.log("Admin created");
  process.exit();
});
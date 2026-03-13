require("dotenv").config();
const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoStore = require("connect-mongo").default;
const expressLayouts = require("express-ejs-layouts");
const connectDB = require("./config/db");

const app = express();

// ================= DATABASE =================
connectDB();

// ================= VIEW ENGINE =================
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(expressLayouts);
app.set("layout", "layouts/main");

// ================= MIDDLEWARE =================
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
    }),
  })
);

// ================= ROUTES =================
app.use("/", require("./routes/web"));
app.use("/admin", require("./routes/admin"));

// ================= SERVER =================
app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});


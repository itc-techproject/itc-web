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
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

// ==================== REDIRECT ================
app.get('/PPAMEGO', (req, res) => {
  res.redirect('https://drive.google.com/drive/folders/1APCQWMK3L8CpK9KHkIJjusgdWInJIkke?usp=drive_link'); 
});

app.get('/PPAMEGO/Sertifikat', (req, res) => {
  res.redirect('https://drive.google.com/drive/folders/1cJgRE_Pr2HS9ZkJ3XtlHLwmizakRZbD0?usp=sharing'); 
});

app.get('/Tetra/PendaftaranPanitBt2', (req, res) => {
  res.redirect('https://docs.google.com/forms/d/e/1FAIpQLSfkIxHUo4Whyv9kJ-d4FS3WYESWUudET9AiWJTpyXB2dJcfNA/viewform?usp=publish-editor'); 
});

app.get('/Tetra/AnnounPanitBt2', (req, res) => {
  res.redirect('https://docs.google.com/spreadsheets/d/12n458YWIaPQszr3HssNN0abzYpcvR71ufw9TLeWANhA/edit?usp=drivesdk'); 
});

module.exports = app;


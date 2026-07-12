const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true 
  },

  slug: {
    type: String,
    required: true,
    unique: true
  },

  content: { 
    type: String, 
    required: true 
  },

  excerpt: {
    type: String
  },

  image: {
    type: String
  },

  category: {
    type: String,
    enum: [
      "Event",
      "Aktivitas",
      "Teknologi",
      "Informasi",
      "Komunikasi",
      "Pengembangan",
      "Lainnya"
    ],
    default: "Lainnya"
  },

  author: {
    type: String,
    default: "Admin"
  }

}, { 
  timestamps: true   // otomatis createdAt & updatedAt
});

module.exports = mongoose.model("Blog", blogSchema);
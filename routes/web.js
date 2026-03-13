const express = require('express');
const router = express.Router();
const fs = require("fs");
const path = require("path");
const Blog = require("../models/Blog");

/* HOME */
router.get('/', (req, res) => {
    res.render('pages/home');
});

/* HISTORY */
router.get('/history', (req, res) => {
    const dirPath = path.join(__dirname, "../public/images/history");

    let images = [];

    if (fs.existsSync(dirPath)) {
        images = fs.readdirSync(dirPath).filter(file =>
            /\.(jpg|jpeg|png|webp)$/i.test(file)
        );
    }

    res.render('pages/history', { images });
});

/* STATIC PAGE (kecuali blog) */
const pages = ['kabinet', 'divisi'];

pages.forEach(page => {
    router.get(`/${page}`, (req, res) => {
        res.render(`pages/${page}`);
    });
});

/* BLOG LIST (DINAMIS) */
router.get('/blog', async (req, res) => {
    const category = req.query.category;

    let filter = {};

    if (category && category !== 'semua') {
        filter.category = category;
    }

    const blogs = await Blog.find(filter).sort({ createdAt: -1 });

    res.render('pages/blog', { 
        blogs,
        activeCategory: category || 'semua'
    });
});

router.get('/api/blog', async (req, res) => {

  const category = req.query.category;
  const search = req.query.search;

  const page = parseInt(req.query.page) || 1;
  const limit = 6;
  const skip = (page - 1) * limit;

  let filter = {};

  // Filter kategori
  if (category && category !== 'semua') {
    filter.category = category;
  }

  // Filter search
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { excerpt: { $regex: search, $options: 'i' } },
      { content: { $regex: search, $options: 'i' } }
    ];
  }

  const blogs = await Blog.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  res.json(blogs);
});

/* BLOG DETAIL */
router.get('/blog/:slug', async (req, res) => {
    const blog = await Blog.findOne({ slug: req.params.slug });

    if (!blog) return res.redirect('/blog');

    res.render('pages/blog-detail', { blog });
});

module.exports = router;
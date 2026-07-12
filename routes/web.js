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

router.get('/blog', async (req, res) => {
    const category = req.query.category;
    const search = req.query.search;

    let filter = {};

    // FILTER CATEGORY
    if (category && category.toLowerCase() !== 'semua') {
        filter.category = category;
    }

    // SEARCH (title + excerpt)
    if (search) {
        filter.$or = [
            { title: { $regex: search, $options: 'i' } },
            { excerpt: { $regex: search, $options: 'i' } }
        ];
    }

    const blogs = await Blog.find(filter).sort({ createdAt: -1 });

    // kalau request dari fetch (AJAX)
    if (req.headers.accept && req.headers.accept.includes('application/json')) {
        return res.json(blogs);
    }

    res.render('pages/blog', { 
        blogs,
        activeCategory: category || 'Semua'
    });
});

/* BLOG DETAIL */
router.get('/blog/:slug', async (req, res) => {
    const blog = await Blog.findOne({ slug: req.params.slug });

    if (!blog) return res.redirect('/blog');

    res.render('pages/blog-detail', { blog });
});


module.exports = router;
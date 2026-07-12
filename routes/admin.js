const express = require('express');
const router = express.Router();
const bcrypt = require("bcryptjs");
const Blog = require("../models/Blog");
const User = require("../models/User");
const auth = require("../middleware/authMiddleware");
const slugify = require("slugify");
const multer = require("multer");
const path = require("path");
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "public/images/blog");
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, Date.now() + ext);
    }
});
const upload = multer({
    storage,
    limits: {
        fileSize: 1024 * 1024 // 1 MB
    }
});

/* LOGIN PAGE */
router.get('/login', (req, res) => {
    res.render('admin/login', { layout: false });
});

/* LOGIN PROCESS */
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    console.log("INPUT USERNAME:", username);
    console.log("INPUT PASSWORD:", password);

    const user = await User.findOne({ username });
    console.log("USER FROM DB:", user);

    if (!user) {
        console.log("❌ USER TIDAK DITEMUKAN");
        return res.redirect('/admin/login');
    }

    const match = await bcrypt.compare(password, user.password);
    console.log("PASSWORD MATCH:", match);

    if (!match) {
        console.log("❌ PASSWORD SALAH");
        return res.redirect('/admin/login');
    }

    req.session.user = {
        id: user._id,
        username: user.username
    };

    console.log("SESSION SET:", req.session.user);

    res.redirect('/admin/dashboard');
});

/* DASHBOARD */
router.get('/dashboard', auth, async (req, res) => {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    res.render('admin/dashboard', { blogs });
});

/* ADD BLOG PAGE */
router.get('/add', auth, (req, res) => {
    res.render('admin/add-blog');
});

/* ADD BLOG PROCESS */
router.post('/add', auth, upload.single("image"), async (req, res) => {
    const { title, content, category, excerpt } = req.body;

    const image = req.file
        ? "/images/blog/" + req.file.filename
        : "";

    const slug = slugify(title, { lower: true, strict: true });

    await Blog.create({
        title,
        slug,
        content,
        image,
        category,
        excerpt,
        author: req.session.user.username
    });

    res.redirect('/admin/dashboard');
});

/* EDIT BLOG */
router.get('/edit/:id', auth, async (req, res) => {
    const blog = await Blog.findById(req.params.id);
    res.render('admin/edit-blog', { blog });
});

/* UPDATE BLOG */
router.post('/edit/:id', auth, upload.single("image"), async (req, res) => {
    const { title, content, category, excerpt } = req.body;

    const slug = slugify(title, { lower: true, strict: true });

    const updateData = {
        title,
        slug,
        content,
        category,
        excerpt
    };

    if (req.file) {
        updateData.image = "/images/blog/" + req.file.filename;
    }

    await Blog.findByIdAndUpdate(req.params.id, updateData);

    res.redirect('/admin/dashboard');
});

/* DELETE BLOG */
router.post('/delete/:id', auth, async (req, res) => {
    await Blog.findByIdAndDelete(req.params.id);
    res.redirect('/admin/dashboard');
});

/* LOGOUT */
router.get('/logout', (req, res) => {
    req.session.destroy(err => {
    if (err) return res.redirect('/admin/dashboard');
    res.redirect('/admin/login');
    });
});

module.exports = router;
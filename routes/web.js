const express = require('express');
const router = express.Router();
const fs = require("fs");
const path = require("path");
const Blog = require("../models/Blog");
const prokers = require("../models/proker");

/* HOME */
router.get("/", async (req, res) => {
    try {
        const blogs = await Blog.find()
            .sort({ createdAt: -1 })
            .limit(5);

        res.render("pages/home", { blogs });

    } catch (error) {
        console.error(error);
        res.status(500).send("Terjadi kesalahan pada server");
    }
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
const pages = ['kabinet'];

pages.forEach(page => {
    router.get(`/${page}`, (req, res) => {
        res.render(`pages/${page}`);
    });
});


/* DIVISI */
// Helper untuk mengekstrak Thumbnail dari URL/Embed YouTube
function getYouTubeThumbnail(url) {
    if (!url || typeof url !== 'string') return null;

    // Regex untuk mengambil 11 karakter ID video YouTube (mendukung format youtu.be, embed, watch?v=)
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);

    if (match && match[2].length === 11) {
        const videoId = match[2];
        // Menggunakan hqdefault.jpg yang dijamin selalu tersedia di YouTube
        return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    }
    return null;
}

// Helper untuk mengekstrak URL/path foto dari berbagai nama properti & YouTube
function extractPhoto(item) {
    // 1. Cek nama-nama properti gambar (ditambahkan coverImage & cover_image)
    const photoSources = [
        item.photos, item.foto, item.images, 
        item.coverImage, item.cover_image, item.cover, 
        item.gambar, item.image
    ];

    for (const src of photoSources) {
        if (Array.isArray(src) && src.length > 0 && src[0]) return src[0];
        if (typeof src === 'string' && src.trim() !== '') return src;
    }

    // 2. Fallback: Jika gambar tidak ada, cek URL / Embed YouTube
    const videoUrlSources = [item.embed, item.url, item.link];
    for (const videoUrl of videoUrlSources) {
        const ytThumbnail = getYouTubeThumbnail(videoUrl);
        if (ytThumbnail) return ytThumbnail;
    }

    return null;
}

// Helper untuk mengekstrak tanggal
function extractDate(item) {
    const rawDate = item.date || item.tanggal || item.created_at || item.year || item.tahun;
    if (!rawDate) return null;

    const parsedDate = new Date(rawDate);
    return isNaN(parsedDate.getTime()) ? null : parsedDate;
}

router.get('/divisi', (req, res) => {
    const prokerCovers = {};

    if (!prokers || typeof prokers !== 'object') {
        return res.render('pages/divisi', { prokerCovers });
    }

    Object.entries(prokers).forEach(([slug, proker]) => {
        if (!proker?.items?.length) {
            prokerCovers[slug] = null;
            return;
        }

        // 1. Petakan item yang memiliki foto/thumbnail valid
        const validItems = proker.items
            .map(item => ({
                photo: extractPhoto(item),
                date: extractDate(item),
                originalItem: item
            }))
            .filter(entry => entry.photo !== null);

        if (validItems.length === 0) {
            prokerCovers[slug] = null;
            return;
        }

        // 2. Urutkan berdasarkan tanggal terbaru
        validItems.sort((a, b) => {
            if (!a.date && !b.date) return 0;
            if (!a.date) return 1;
            if (!b.date) return -1;
            return b.date - a.date;
        });

        // 3. Ambil foto/thumbnail dari item teratas
        prokerCovers[slug] = validItems[0].photo;
    });

    res.render('pages/divisi', { prokerCovers });
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

/* PROKER */
/* PROKER */
router.get("/proker/:slug", (req, res) => {

    const proker = prokers[req.params.slug];

    if (!proker) {
        return res.status(404).send("Proker tidak ditemukan");
    }

    res.render("pages/proker/detail", {
        page: proker.page,
        items: proker.items
    });

});

/* BLOG DETAIL */
router.get('/blog/:slug', async (req, res) => {
    const blog = await Blog.findOne({ slug: req.params.slug });

    if (!blog) return res.redirect('/blog');

    res.render('pages/blog-detail', { blog });
});


module.exports = router;
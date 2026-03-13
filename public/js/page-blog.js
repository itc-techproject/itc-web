const buttons = document.querySelectorAll('.filter-btn');
const blogGrid = document.querySelector('.blog-grid');
const toggleBtn = document.querySelector('.mobile-filter-toggle');
const filterGroup = document.querySelector('.filter-group');
const searchInput = document.querySelector('.search-input');
const searchBtn = document.querySelector('.search-btn');

let currentPage = 1;
let isLoading = false;
let hasMore = true;

let currentCategory = 'semua';

if (window.innerWidth > 768 && toggleBtn) {
  toggleBtn.disabled = true;
}

/* =========================
   MOBILE TOGGLE
========================= */
if (toggleBtn) {
  toggleBtn.addEventListener('click', () => {
    filterGroup.classList.toggle('active');
  });
}

/* =========================
   AJAX FILTER
========================= */
buttons.forEach(button => {
  button.addEventListener('click', () => {

    buttons.forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');

    currentCategory = button.dataset.category;

    fetchBlogs();
  });
});

if (searchBtn) {
  searchBtn.addEventListener('click', () => {
    fetchBlogs();
  });
}

if (searchInput) {
  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      fetchBlogs();
    }
  });
}

async function fetchBlogs() {

  const searchValue = searchInput ? searchInput.value.trim() : '';

  let url = '/api/blog?';

  if (currentCategory !== 'semua') {
    url += `category=${currentCategory}&`;
  }

  if (searchValue) {
    url += `search=${encodeURIComponent(searchValue)}`;
  }

  const response = await fetch(url);
  const blogs = await response.json();

  renderBlogs(blogs);

  if (window.innerWidth <= 768) {
    filterGroup.classList.remove('active');
  }
}

function renderBlogs(blogs) {

  if (blogs.length === 0) {
    blogGrid.innerHTML = "<p>Tidak ada artikel.</p>";
    return;
  }

  blogGrid.innerHTML = blogs.map(blog => `
    <a href="/blog/${blog.slug}" class="blog-link">
      <article class="blog-card">
        <div class="blog-image">
          <img src="${blog.image}" alt="">
          <span class="category-badge">${blog.category}</span>
        </div>
        <div class="blog-content">
          <div class="blog-meta">
            <span>${new Date(blog.createdAt).toDateString()}</span>
            <span>•</span>
            <span>${blog.author}</span>
          </div>
          <h3 class="blog-title-card">${blog.title}</h3>
          <p>${blog.excerpt || ''}</p>
        </div>
      </article>
    </a>
  `).join('');
}

async function loadMoreBlogs() {

  if (isLoading || !hasMore) return;

  isLoading = true;
  currentPage++;

  const response = await fetch(`/api/blog?page=${currentPage}`);
  const blogs = await response.json();

  if (blogs.length === 0) {
    hasMore = false;
    document.querySelector('.scroll-loader').innerHTML = "Tidak ada artikel lagi.";
    return;
  }

  appendBlogs(blogs);
  isLoading = false;
}

function appendBlogs(blogs) {

  blogGrid.innerHTML += blogs.map(blog => `
    <a href="/blog/${blog.slug}" class="blog-link">
      <article class="blog-card">
        <div class="blog-image">
          <img src="${blog.image}" alt="">
          <span class="category-badge">${blog.category}</span>
        </div>
        <div class="blog-content">
          <div class="blog-meta">
            <span>${new Date(blog.createdAt).toDateString()}</span>
            <span>•</span>
            <span>${blog.author}</span>
          </div>
          <h3 class="blog-title-card">${blog.title}</h3>
          <p>${blog.excerpt || ''}</p>
        </div>
      </article>
    </a>
  `).join('');
}

const observer = new IntersectionObserver(entries => {
  if (entries[0].isIntersecting) {
    loadMoreBlogs();
  }
});

observer.observe(document.querySelector('.scroll-loader'));
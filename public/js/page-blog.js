const buttons = document.querySelectorAll('.filter-btn');
const blogGrid = document.querySelector('.blog-grid');
const toggleBtn = document.querySelector('.mobile-filter-toggle');
const filterGroup = document.querySelector('.filter-group');
const searchInput = document.querySelector('.search-input');
const searchBtn = document.querySelector('.search-btn');

let currentCategory = 'Semua';

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
   FILTER
========================= */
buttons.forEach(button => {
  button.addEventListener('click', () => {

    buttons.forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');

    currentCategory = button.dataset.category;

    fetchBlogs();
  });
});

/* =========================
   SEARCH
========================= */
if (searchBtn) {
  searchBtn.addEventListener('click', fetchBlogs);
}

if (searchInput) {
  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') fetchBlogs();
  });
}


/* =========================
   RENDER
========================= */
function renderBlogs(blogs) {

  if (!blogs || blogs.length === 0) {
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

/* =========================
   FETCH DATA
========================= */
function fetchBlogs() {

  const search = searchInput.value;

  const params = new URLSearchParams();

  if (currentCategory && currentCategory !== 'Semua') {
    params.append('category', currentCategory);
  }

  if (search) {
    params.append('search', search);
  }

  fetch(`/blog?${params.toString()}`, {
    headers: {
      'Accept': 'application/json'
    }
  })
    .then(res => res.json())
    .then(data => {
      renderBlogs(data);
    })
    .catch(err => console.error(err));
}

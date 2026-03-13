document.addEventListener("DOMContentLoaded", function () {

  const track = document.querySelector(".carousel-track");
  const nextBtn = document.querySelector(".next");
  const prevBtn = document.querySelector(".prev");

  let slides = Array.from(document.querySelectorAll(".carousel-item"));
  const visibleSlides = 3;

  let autoSlide;
  let index = visibleSlides;
  let slideWidth;

  const firstClones = slides.slice(0, visibleSlides).map(slide => slide.cloneNode(true));
  const lastClones = slides.slice(-visibleSlides).map(slide => slide.cloneNode(true));

  lastClones.reverse().forEach(clone => {
    track.insertBefore(clone, track.firstChild);
  });

  firstClones.forEach(clone => {
    track.appendChild(clone);
  });

  slides = Array.from(document.querySelectorAll(".carousel-item"));

  function updateWidth() {
    slideWidth = slides[0].getBoundingClientRect().width;
    track.style.transition = "none";
    track.style.transform = `translateX(-${slideWidth * index}px)`;
  }

  updateWidth();
  window.addEventListener("resize", updateWidth);

  function moveSlide() {
    track.style.transition = "transform 0.6s ease";
    track.style.transform = `translateX(-${slideWidth * index}px)`;
  }

  function nextSlide() {
    index++;
    moveSlide();
  }

  function prevSlide() {
    index--;
    moveSlide();
  }

  track.addEventListener("transitionend", () => {

    if (index >= slides.length - visibleSlides) {
      track.style.transition = "none";
      index = visibleSlides;
      track.style.transform = `translateX(-${slideWidth * index}px)`;
    }

    if (index < visibleSlides) {
      track.style.transition = "none";
      index = slides.length - (visibleSlides * 2);
      track.style.transform = `translateX(-${slideWidth * index}px)`;
    }
  });

  nextBtn.addEventListener("click", () => {
    nextSlide();
    resetAuto();
  });

  prevBtn.addEventListener("click", () => {
    prevSlide();
    resetAuto();
  });

  function startAuto() {
    autoSlide = setInterval(nextSlide, 3000);
  }

  function resetAuto() {
    clearInterval(autoSlide);
    startAuto();
  }

  startAuto();
});

/* =========================
   DRAG / SWIPE SUPPORT (FIXED)
========================= */

let isDragging = false;
let startX = 0;
let currentX = 0;
let movedBy = 0;

function getX(e) {
  return e.type.includes("mouse") ? e.pageX : e.touches[0].clientX;
}

function dragStart(e) {
  isDragging = true;
  startX = getX(e);
  movedBy = 0;

  track.style.transition = "none";
  clearInterval(autoSlide);
}

function dragMove(e) {
  if (!isDragging) return;

  currentX = getX(e);
  movedBy = currentX - startX;

  track.style.transform =
    `translateX(${(-slideWidth * index) + movedBy}px)`;
}

function dragEnd() {
  if (!isDragging) return;

  isDragging = false;

  if (movedBy < -100) {
    index++;
  } else if (movedBy > 100) {
    index--;
  }

  moveSlide();
  startAuto();
}

/* ===== Mouse ===== */
track.addEventListener("mousedown", dragStart);
window.addEventListener("mousemove", dragMove);
window.addEventListener("mouseup", dragEnd);

/* ===== Touch ===== */
track.addEventListener("touchstart", dragStart);
track.addEventListener("touchmove", dragMove);
track.addEventListener("touchend", dragEnd);
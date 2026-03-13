document.addEventListener("DOMContentLoaded", function () {

  const hamburger = document.getElementById("hamburger");
  const mobileMenu = document.getElementById("mobileMenu");

  const desktopDropdownToggle = document.querySelector(".dropdown-toggle");
  const desktopDropdownMenu = document.querySelector(".dropdown-menu");
  const dropdownArrow = document.querySelector(".dropdown-arrow");

  const mobileDropdownToggle = document.querySelector(".mobile-dropdown-toggle");
  const mobileDropdownMenu = document.querySelector(".mobile-dropdown-menu");

  // HAMBURGER
  hamburger.addEventListener("click", () => {
    hamburger.classList.toggle("active");
    mobileMenu.classList.toggle("open");
  });

  // DESKTOP DROPDOWN
  desktopDropdownToggle.addEventListener("click", () => {
    desktopDropdownMenu.classList.toggle("show");
    dropdownArrow.classList.toggle("rotate");
  });

  // MOBILE DROPDOWN
  mobileDropdownToggle.addEventListener("click", function () {
    this.classList.toggle("active");
    mobileDropdownMenu.classList.toggle("show");
  });

});
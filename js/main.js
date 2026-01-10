const toggle = document.getElementById("menu-toggle");
const navLinks = document.getElementById("nav-links");

if (toggle) {
  toggle.addEventListener("click", () => {
    navLinks.classList.toggle("show");
  });
}

const toggle = document.getElementById("menu-toggle");
const navLinks = document.getElementById("nav-links");

if (toggle && navLinks) {
  toggle.setAttribute("role", "button");
  if (!toggle.hasAttribute("tabindex")) {
    toggle.setAttribute("tabindex", "0");
  }

  const setExpanded = (isExpanded) => {
    toggle.setAttribute("aria-expanded", String(isExpanded));
  };

  const openMenu = () => {
    navLinks.classList.add("show");
    setExpanded(true);
  };

  const closeMenu = () => {
    navLinks.classList.remove("show");
    setExpanded(false);
  };

  const toggleMenu = () => {
    if (navLinks.classList.contains("show")) {
      closeMenu();
    } else {
      openMenu();
    }
  };

  setExpanded(navLinks.classList.contains("show"));

  toggle.addEventListener("click", (event) => {
    event.preventDefault();
    toggleMenu();
  });

  toggle.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      toggleMenu();
    }
  });

  navLinks.addEventListener("click", (event) => {
    const link = event.target.closest("a");
    if (link) {
      closeMenu();
    }
  });

  document.addEventListener("click", (event) => {
    if (!navLinks.classList.contains("show")) {
      return;
    }

    const clickedInsideNav = navLinks.contains(event.target);
    const clickedToggle = toggle.contains(event.target);
    if (!clickedInsideNav && !clickedToggle) {
      closeMenu();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMenu();
    }
  });
}

// Minimal JS bundle for content pages (performance-focused)
(() => {
  const maybeLoadDeferredAnalytics = () => {
    const meta = document.querySelector('meta[name="kmb-ga-id"]');
    const id = meta?.getAttribute("content")?.trim();
    if (!id) return;

    const dnt =
      navigator.doNotTrack === "1" ||
      window.doNotTrack === "1" ||
      navigator.msDoNotTrack === "1";
    if (dnt) return;

    const load = () => {
      if (
        window.gtag ||
        document.querySelector(
          `script[src*="googletagmanager.com/gtag/js?id=${CSS.escape(id)}"]`
        )
      ) {
        return;
      }

      window.dataLayer = window.dataLayer || [];
      window.gtag = function gtag() {
        window.dataLayer.push(arguments);
      };

      window.gtag("js", new Date());
      window.gtag("config", id);

      const s = document.createElement("script");
      s.async = true;
      s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
      document.head.appendChild(s);
    };

    if (typeof window.requestIdleCallback === "function") {
      window.requestIdleCallback(load, { timeout: 3000 });
    } else {
      window.setTimeout(load, 1800);
    }
  };

  // Theme toggle
  const storageKey = "theme";
  const root = document.documentElement;
  const mediaQuery = "(prefers-color-scheme: light)";

  const getCurrentTheme = () =>
    root.getAttribute("data-theme") === "light" ? "light" : "dark";

  const applyTheme = (theme) => {
    if (theme === "light") {
      root.setAttribute("data-theme", "light");
    } else {
      root.removeAttribute("data-theme");
    }
  };

  const getStoredTheme = () => {
    try {
      const value = localStorage.getItem(storageKey);
      return value === "light" || value === "dark" ? value : null;
    } catch {
      return null;
    }
  };

  const setStoredTheme = (theme) => {
    try {
      localStorage.setItem(storageKey, theme);
    } catch {}
  };

  const getSystemTheme = () => {
    if (!window.matchMedia) return "dark";
    return window.matchMedia(mediaQuery).matches ? "light" : "dark";
  };

  const updateToggleButton = (button) => {
    const currentTheme = getCurrentTheme();
    const isLight = currentTheme === "light";

    button.setAttribute("aria-pressed", String(isLight));
    button.setAttribute(
      "aria-label",
      isLight ? "Switch to dark theme" : "Switch to light theme"
    );
    button.title = isLight ? "Switch to dark" : "Switch to light";

    button.innerHTML = isLight
      ? '<i class="fa-solid fa-moon" aria-hidden="true"></i>'
      : '<i class="fa-solid fa-sun" aria-hidden="true"></i>';
  };

  const ensureThemeToggle = () => {
    const navLinksEl = document.getElementById("nav-links");
    if (!navLinksEl) return;

    const menuToggleEl = document.getElementById("menu-toggle");
    const navbarEl = navLinksEl.closest(".navbar") || menuToggleEl?.closest(".navbar");

    const toggleTheme = () => {
      const nextTheme = getCurrentTheme() === "light" ? "dark" : "light";
      applyTheme(nextTheme);
      setStoredTheme(nextTheme);

      const buttons = document.querySelectorAll(".theme-toggle");
      buttons.forEach((btn) => updateToggleButton(btn));

      if (navLinksEl.classList.contains("show")) {
        navLinksEl.classList.remove("show");
        if (menuToggleEl) {
          menuToggleEl.setAttribute("aria-expanded", "false");
        }
      }
    };

    // Desktop toggle (in nav list)
    let desktopButton = navLinksEl.querySelector(".nav-theme .theme-toggle");
    if (!desktopButton) {
      const li = document.createElement("li");
      li.className = "nav-theme";

      desktopButton = document.createElement("button");
      desktopButton.type = "button";
      desktopButton.className = "theme-toggle";

      li.appendChild(desktopButton);
      navLinksEl.appendChild(li);
      desktopButton.addEventListener("click", toggleTheme);
    }

    // Mobile toggle (next to hamburger)
    if (navbarEl) {
      let controls = navbarEl.querySelector(".nav-controls");
      if (!controls) {
        controls = document.createElement("div");
        controls.className = "nav-controls";
        navbarEl.insertBefore(controls, navLinksEl);
      }

      if (menuToggleEl && menuToggleEl.parentElement !== controls) {
        controls.appendChild(menuToggleEl);
      }

      let mobileButton = controls.querySelector(".theme-toggle--mobile");
      if (!mobileButton) {
        mobileButton = document.createElement("button");
        mobileButton.type = "button";
        mobileButton.className = "theme-toggle theme-toggle--mobile";
        mobileButton.addEventListener("click", toggleTheme);
        if (menuToggleEl) {
          controls.insertBefore(mobileButton, menuToggleEl);
        } else {
          controls.appendChild(mobileButton);
        }
      }
    }

    const buttons = document.querySelectorAll(".theme-toggle");
    buttons.forEach((btn) => updateToggleButton(btn));
  };

  // Apply theme ASAP (stored > system)
  applyTheme(getStoredTheme() ?? getSystemTheme());

  // Follow system changes only if user hasn't explicitly chosen.
  if (window.matchMedia) {
    const media = window.matchMedia(mediaQuery);
    const onChange = () => {
      if (getStoredTheme()) return;
      applyTheme(getSystemTheme());
      ensureThemeToggle();
    };

    if (typeof media.addEventListener === "function") {
      media.addEventListener("change", onChange);
    } else if (typeof media.addListener === "function") {
      media.addListener(onChange);
    }
  }

  ensureThemeToggle();

  // Mobile menu toggle
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
      if (!navLinks.classList.contains("show")) return;
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

  maybeLoadDeferredAnalytics();

  // Back to top (global UX, lightweight)
  (() => {
    if (document.querySelector(".back-to-top")) return;

    const prefersReducedMotion =
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

    const button = document.createElement("button");
    button.className = "back-to-top";
    button.type = "button";
    button.setAttribute("aria-label", "Back to top");
    button.innerHTML = '<i class="fa-solid fa-arrow-up" aria-hidden="true"></i>';

    document.body.appendChild(button);

    let scheduled = false;
    let lastVisible = false;

    const updateVisibility = () => {
      scheduled = false;
      const y = window.scrollY || document.documentElement.scrollTop || 0;
      const visible = y > 450;
      if (visible === lastVisible) return;
      lastVisible = visible;
      button.classList.toggle("is-visible", visible);
    };

    const requestUpdate = () => {
      if (scheduled) return;
      scheduled = true;
      window.requestAnimationFrame(updateVisibility);
    };

    requestUpdate();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate, { passive: true });

    button.addEventListener("click", () => {
      if (prefersReducedMotion) {
        window.scrollTo(0, 0);
        return;
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  })();
})();

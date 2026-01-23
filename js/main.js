// Theme (dark/light)
(() => {
  // Optional: defer Google Analytics to improve Lighthouse (reduces early 3rd-party and main-thread work).
  const maybeLoadDeferredAnalytics = () => {
    const meta = document.querySelector('meta[name="kmb-ga-id"]');
    const id = meta?.getAttribute("content")?.trim();
    if (!id) return;

    // Respect Do Not Track.
    const dnt =
      navigator.doNotTrack === "1" ||
      window.doNotTrack === "1" ||
      navigator.msDoNotTrack === "1";
    if (dnt) return;

    const load = () => {
      if (window.gtag || document.querySelector(`script[src*="googletagmanager.com/gtag/js?id=${id}"]`)) return;

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
    } catch {
      // Ignore storage failures (private mode, disabled storage, etc.)
    }
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

    // If we're currently in light mode, show a moon to indicate "go dark".
    // If we're currently in dark mode, show a sun to indicate "go light".
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

      // Update any toggle buttons that exist.
      const buttons = document.querySelectorAll(".theme-toggle");
      buttons.forEach((btn) => updateToggleButton(btn));

      // If the mobile menu is open, close it after toggling.
      if (navLinksEl.classList.contains("show")) {
        navLinksEl.classList.remove("show");
        if (menuToggleEl) {
          menuToggleEl.setAttribute("aria-expanded", "false");
        }

        maybeLoadDeferredAnalytics();
      }
    };

    // Desktop / menu toggle (kept in the nav list).
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

    // Mobile toggle (placed next to hamburger).
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

    // Sync icons/labels.
    const buttons = document.querySelectorAll(".theme-toggle");
    buttons.forEach((btn) => updateToggleButton(btn));
  };

  const storedTheme = getStoredTheme();
  applyTheme(storedTheme ?? getSystemTheme());

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
})();

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

// Reading time (blog posts only)
(() => {
  const content = document.querySelector(".post-content");
  if (!content) return;

  const readingTimeEl = document.querySelector(".post-reading-time");
  if (!readingTimeEl) return;

  const text = (content.textContent || "").replace(/\s+/g, " ").trim();
  const words = text ? text.split(" ").length : 0;

  // Typical tech reading speed range is ~180–240 wpm; pick a balanced default.
  const wordsPerMinute = 200;
  const minutes = Math.max(1, Math.ceil(words / wordsPerMinute));

  readingTimeEl.textContent = `${minutes} min read`;
})();

// Last updated (site-wide)
(() => {
  const lastModifiedRaw = document.lastModified;
  if (!lastModifiedRaw) return;

  const parsed = new Date(lastModifiedRaw);
  if (Number.isNaN(parsed.getTime())) return;

  // Consistent, human-friendly format.
  const formatted = parsed.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });

  // If a dedicated placeholder exists (optional), fill it.
  const placeholders = document.querySelectorAll(".site-last-updated");
  if (placeholders.length) {
    placeholders.forEach((el) => {
      el.textContent = formatted;
      el.setAttribute("datetime", parsed.toISOString());
    });
    return;
  }

  // Otherwise, append to the footer bottom if present.
  const footerBottom = document.querySelector(".footer-bottom");
  if (!footerBottom) return;

  // Avoid duplicating if script runs twice.
  if (footerBottom.querySelector(".footer-last-updated")) return;

  const wrap = document.createElement("span");
  wrap.className = "footer-last-updated";
  wrap.innerHTML = `\n    &middot; Last updated: <time class="site-last-updated" datetime="${parsed.toISOString()}">${formatted}</time>`;
  footerBottom.appendChild(wrap);
})();

// Blog search
(() => {
  const searchBlocks = Array.from(document.querySelectorAll(".blog-search"));
  if (!searchBlocks.length) return;

  const escapeHtml = (value) =>
    String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#039;");

  const normalize = (value) => String(value || "").toLowerCase().trim();

  // Cache for post index fetches (per-URL) + fallback for local browsing.
  const getFallbackPostsIndex = () => {
    const fallback = window.__KMB_POSTS_INDEX__;
    return Array.isArray(fallback) ? fallback : [];
  };

  const postsIndexCache = new Map();
  const loadPostsIndex = async (url) => {
    if (!url) return getFallbackPostsIndex();

    if (postsIndexCache.has(url)) {
      return postsIndexCache.get(url);
    }

    const promise = fetch(url, { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : getFallbackPostsIndex()))
      .catch(() => getFallbackPostsIndex());

    postsIndexCache.set(url, promise);
    return promise;
  };

  const filterElementsOnPage = (selector, query) => {
    const q = normalize(query);
    const elements = Array.from(document.querySelectorAll(selector));
    if (!elements.length) return;

    elements.forEach((el) => {
      const text = normalize(el.textContent);
      const match = !q || text.includes(q);
      el.style.display = match ? "" : "none";
    });
  };

  const renderResults = (container, results) => {
    if (!container) return;
    if (!results.length) {
      container.innerHTML = "";
      return;
    }

    const items = results
      .map((r) => {
        const title = escapeHtml(r.title);
        const desc = escapeHtml(r.description || "");
        const category = escapeHtml(r.category || "");
        const date = escapeHtml(r.dateModified || r.datePublished || "");
        const url = escapeHtml(r.url);

        return `
          <li>
            <a href="${url}">
              <div class="result-title">${title}</div>
              ${desc ? `<div>${desc}</div>` : ""}
              <div class="result-meta">${category}${category && date ? " &middot; " : ""}${date}</div>
            </a>
          </li>
        `;
      })
      .join("");

    container.innerHTML = `<ul>${items}</ul>`;
  };

  searchBlocks.forEach((block) => {
    const input = block.querySelector(".blog-search-input");
    if (!input) return;

    const mode = (block.dataset.mode || "local").toLowerCase();
    const postsIndexUrl = block.dataset.postsIndex;
    const resultsEl = block.querySelector(".blog-search-results");
    const filterSelector = block.dataset.filterSelector || ".notes-grid .notes-card";

    const onInput = async () => {
      const q = normalize(input.value);

      // Local mode: filter the visible cards on this page.
      if (mode === "local") {
        filterElementsOnPage(filterSelector, q);
      }

      if (mode !== "posts" || !resultsEl) return;

      if (!q) {
        resultsEl.innerHTML = '<div class="blog-search-hint">Type to search posts…</div>';
        return;
      }

      const index = await loadPostsIndex(postsIndexUrl);
      const matches = (Array.isArray(index) ? index : []).filter((p) => {
        const haystack = normalize(
          [p.title, p.description, p.category, ...(p.tags || [])].join(" ")
        );
        return haystack.includes(q);
      });

      const top = matches.slice(0, 10);
      if (!top.length) {
        resultsEl.innerHTML = `<div class="blog-search-hint">No matches for “${escapeHtml(q)}”.</div>`;
        return;
      }

      renderResults(resultsEl, top);
    };

    input.addEventListener("input", onInput);

    if (mode === "posts" && resultsEl) {
      resultsEl.innerHTML = '<div class="blog-search-hint">Type to search posts…</div>';
    }
  });
})();

// Related notes (post pages)
(() => {
  let host = document.querySelector(".post-related");

  // Future-proof: automatically add the container on any post page.
  const isPostPage = document.body?.classList?.contains("page-post");
  if (!host && !isPostPage) return;

  if (!host) {
    host = document.createElement("section");
    host.className = "post-related";
    host.setAttribute("aria-label", "Related notes");
    host.dataset.postsIndex = "/blog/posts.json";
    host.dataset.max = "3";

    const article = document.querySelector("article.post") || document.querySelector(".post");
    if (article) {
      article.appendChild(host);
    } else {
      const main = document.querySelector("main") || document.body;
      main.appendChild(host);
    }
  }

  const postsIndexUrl = host.dataset.postsIndex || "/blog/posts.json";
  const currentUrl = (host.dataset.currentUrl || window.location.pathname || "").replace(/\/$/, "");
  const max = Math.max(1, Math.min(6, Number.parseInt(host.dataset.max || "3", 10) || 3));

  const normalize = (value) => String(value || "").toLowerCase().trim();

  const escapeHtml = (value) =>
    String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#039;");

  const getFallbackPostsIndex = () => {
    const fallback = window.__KMB_POSTS_INDEX__;
    return Array.isArray(fallback) ? fallback : [];
  };

  const loadPostsIndex = async (url) => {
    if (!url) return getFallbackPostsIndex();

    try {
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) return getFallbackPostsIndex();
      const json = await res.json();
      return Array.isArray(json) ? json : getFallbackPostsIndex();
    } catch {
      return getFallbackPostsIndex();
    }
  };

  const parseDate = (value) => {
    const t = Date.parse(String(value || ""));
    return Number.isFinite(t) ? t : 0;
  };

  const getRelatedSignals = (candidate, current) => {
    const catA = normalize(candidate.category);
    const catB = normalize(current.category);
    const sameCategory = Boolean(catA && catB && catA === catB);

    const tagsA = new Set((candidate.tags || []).map(normalize).filter(Boolean));
    const tagsB = new Set((current.tags || []).map(normalize).filter(Boolean));

    let tagOverlap = 0;
    tagsA.forEach((t) => {
      if (tagsB.has(t)) tagOverlap += 1;
    });

    // Keep a score for basic filtering (any relation at all).
    const score = (sameCategory ? 1 : 0) + tagOverlap;
    return { score, tagOverlap, sameCategory };
  };

  const render = async () => {
    const posts = await loadPostsIndex(postsIndexUrl);
    const index = Array.isArray(posts) ? posts : [];

    if (!index.length || !currentUrl) {
      host.style.display = "none";
      return;
    }

    const current = index.find((p) => {
      const u = String(p.url || "").replace(/\/$/, "");
      return u && u === currentUrl;
    });

    if (!current) {
      host.style.display = "none";
      return;
    }

    const ranked = index
      .filter((p) => p && p.url && String(p.url).replace(/\/$/, "") !== currentUrl)
      .map((p) => {
        const signals = getRelatedSignals(p, current);
        return {
          post: p,
          signals,
          date: parseDate(p.dateModified || p.datePublished),
        };
      })
      .filter((x) => x.signals.score > 0)
      .sort((a, b) => {
        // Prefer posts that share tags first.
        if (b.signals.tagOverlap !== a.signals.tagOverlap) {
          return b.signals.tagOverlap - a.signals.tagOverlap;
        }
        // Then prefer same-category matches.
        if (b.signals.sameCategory !== a.signals.sameCategory) {
          return b.signals.sameCategory ? 1 : -1;
        }
        if (b.date !== a.date) return b.date - a.date;
        return String(a.post.title || "").localeCompare(String(b.post.title || ""), undefined, {
          sensitivity: "base",
        });
      })
      .slice(0, max)
      .map((x) => x.post);

    if (!ranked.length) {
      host.style.display = "none";
      return;
    }

    const cards = ranked
      .map((p) => {
        const title = escapeHtml(p.title || "Untitled");
        const desc = escapeHtml(p.description || "");
        const url = escapeHtml(p.url || "#");
        const meta = escapeHtml(p.category || "");

        return `
          <a class="notes-card" href="${url}">
            <h2>${title}</h2>
            ${desc ? `<p>${desc}</p>` : ""}
            ${meta ? `<span class="notes-meta">${meta}</span>` : ""}
          </a>
        `;
      })
      .join("");

    host.innerHTML = `<h2>Related notes</h2><div class="notes-grid">${cards}</div>`;
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", render);
  } else {
    render();
  }
})();

// Back to top
(() => {
  if (document.querySelector(".back-to-top")) return;

  const prefersReducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

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

// Landing page sky (meteors)
(() => {
  const host = document.querySelector("[data-sky-meteors]");
  if (!host) return;

  const prefersReducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
  if (prefersReducedMotion) return;

  // Keep it lightweight: fewer meteors on small screens.
  const isMobile = window.matchMedia?.("(max-width: 768px)")?.matches;
  const meteorCount = isMobile ? 8 : 12;
  const rand = (min, max) => min + Math.random() * (max - min);

  for (let i = 0; i < meteorCount; i++) {
    const meteor = document.createElement("span");
    meteor.className = "meteor";

    // Use vh for travel distance so the diagonal looks consistent across aspect ratios.
    meteor.style.setProperty("--x", `${rand(0, 110).toFixed(2)}vw`);
    meteor.style.setProperty("--dx", `${rand(isMobile ? 70 : 55, isMobile ? 110 : 90).toFixed(1)}vh`);
    meteor.style.setProperty("--dy", `${rand(110, 145).toFixed(1)}vh`);

    meteor.style.setProperty("--len", `${rand(isMobile ? 140 : 160, isMobile ? 260 : 340).toFixed(0)}px`);
    meteor.style.setProperty("--thickness", `${rand(1, isMobile ? 2.1 : 2.4).toFixed(1)}px`);

    const durSec = rand(isMobile ? 2.4 : 1.9, isMobile ? 4.4 : 3.6);
    meteor.style.setProperty("--dur", `${durSec.toFixed(2)}s`);

    // Negative delay starts meteors mid-flight on initial render (prevents a stuck look).
    // Keep mobile a bit sparser by widening the phase window.
    const phaseWindow = isMobile ? durSec * 2.2 : durSec * 1.6;
    meteor.style.setProperty("--delay", `-${rand(0, phaseWindow).toFixed(2)}s`);

    host.appendChild(meteor);
  }
})();

// Interactive homepage terminal (Q&A)
(() => {
  const card = document.querySelector(".terminal-card[data-interactive-terminal]");
  if (!card) return;

  const input = card.querySelector(".terminal-input");
  const output = card.querySelector(".terminal-output");
  if (!input || !output) return;

  const terminalCard = card;

  const history = [];
  let historyIndex = -1;

  const normalizePath = () => {
    const protocol = String(window.location.protocol || "");
    let p = String(window.location.pathname || "/");
    if (!p) p = "/";

    // If opened via file://, avoid printing the full local path.
    if (protocol === "file:" && /\/[A-Za-z]:\//.test(p)) {
      const base = p.split("/").pop();
      p = base ? `/${base}` : "/";
    }

    if (p.endsWith("/index.html")) return "/";
    return p;
  };

  const getPageLabel = () => {
    const p = normalizePath();
    if (p === "/" || p.endsWith("/index.html")) return "Home";
    if (p.endsWith("/journey.html")) return "Journey";
    if (p.endsWith("/contact.html")) return "Contact";
    if (p.endsWith("/about.html")) return "About";
    if (p.endsWith("/domain-cyber.html")) return "Cybersecurity";
    if (p.endsWith("/domain-networking.html")) return "Networking";
    if (p.endsWith("/domain-programming.html")) return "Programming";
    if (p.startsWith("/blog/")) return "Blog";
    return document.title || "(unknown)";
  };

  const scrollToBottom = () => {
    // Keep the newest lines visible.
    output.scrollTop = output.scrollHeight;
  };

  const printLine = (text, className) => {
    const div = document.createElement("div");
    div.className = className ? `terminal-line ${className}` : "terminal-line";
    div.textContent = text;
    output.appendChild(div);
    scrollToBottom();
  };

  const printBlock = (lines) => {
    (Array.isArray(lines) ? lines : [lines]).forEach((l) => printLine(l));
  };

  const clearOutput = () => {
    output.innerHTML = "";
  };

  const openUrl = (url) => {
    const raw = String(url || "").trim();
    if (!raw) return false;

    // Allow absolute URLs, otherwise treat as site-relative.
    const isAbsolute = /^https?:\/\//i.test(raw);
    const target = isAbsolute ? raw : `/${raw.replace(/^\.?\//, "")}`;

    if (isAbsolute) {
      const opened = window.open(target, "_blank", "noopener,noreferrer");
      if (!opened) {
        // Pop-up blocked: keep the current site tab intact.
        printLine("Pop-up blocked by the browser. Allow pop-ups for this site to open external links.");
      }
      return true;
    }

    window.location.href = target;
    return true;
  };

  const listPaths = () => {
    printBlock([
      "Available paths:",
      "  /                → Home",
      "  /journey.html     → Learning Journey",
      "  /blog/            → Notes",
      "  /about.html       → About",
      "  /contact.html     → Contact",
      "  /domain-cyber.html        → Cybersecurity domain",
      "  /domain-networking.html   → Networking domain",
      "  /domain-programming.html  → Programming domain",
    ]);
  };

  const printLinks = () => {
    printBlock([
      "Links:",
      "  GitHub   → https://github.com/A-man-Sharma-04",
      "  LinkedIn → https://www.linkedin.com/in/a-man-sharma",
      "  Email    → mailto:AmanSharma1@duck.com",
    ]);
  };

  const runCommand = (raw) => {
    const trimmed = String(raw || "").trim();
    if (!trimmed) return;

    printLine(`$ ${trimmed}`, "terminal-cmd");

    const [commandRaw, ...rest] = trimmed.split(/\s+/);
    const command = String(commandRaw || "").toLowerCase();
    const args = rest;

    if (command === "help") {
      printBlock([
        "Available commands:",
        "  help            → shows this help",
        "  clear | cls     → clears the terminal",
        "  whoami          → prints the site owner",
        "  pwd             → prints the current page path",
        "  date            → prints the current date/time",
        "  ls              → lists useful site paths",
        "  links           → prints social/contact links",
        "  open <target>   → opens a page or URL (e.g. open blog, open about, open youtube.com)",
        "  echo <text>     → prints text",
      ]);
      return;
    }

    if (command === "clear" || command === "cls") {
      clearOutput();
      return;
    }

    if (command === "whoami") {
      printLine("Aman Sharma");
      return;
    }

    if (command === "pwd") {
      const p = normalizePath();
      const label = getPageLabel();
      printLine(`${p}  (${label})`);
      return;
    }

    if (command === "date") {
      const now = new Date();
      const formatted = now.toLocaleString(undefined, {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
      printLine(formatted);
      return;
    }

    if (command === "ls") {
      listPaths();
      return;
    }

    if (command === "links") {
      printLinks();
      return;
    }

    if (command === "open") {
      const rawArg = String(args[0] ?? "").trim();
      const target = rawArg.toLowerCase();
      if (!target) {
        printLine("Usage: open <blog|blogs|journey|about|contact|cyber|networking|programming|/path|https://...|youtube.com>");
        return;
      }

      const shortcutMap = {
        home: "/",
        journey: "/journey.html",
        blog: "/blog/",
        blogs: "/blog/",
        notes: "/blog/",
        about: "/about.html",
        contact: "/contact.html",
        cyber: "/domain-cyber.html",
        cybersecurity: "/domain-cyber.html",
        networking: "/domain-networking.html",
        network: "/domain-networking.html",
        programming: "/domain-programming.html",
        code: "/domain-programming.html",
        "domain-cyber": "/domain-cyber.html",
        "domain-networking": "/domain-networking.html",
        "domain-programming": "/domain-programming.html",
      };

      const isAbsoluteUrl = /^https?:\/\//i.test(rawArg);
      const isProtocolRelative = rawArg.startsWith("//");
      const isPath = rawArg.startsWith("/") || rawArg.startsWith("./") || rawArg.startsWith("../");

      const looksLikeDomain = (() => {
        if (isAbsoluteUrl || isProtocolRelative || isPath) return false;
        if (!rawArg.includes(".")) return false;
        if (/\s/.test(rawArg)) return false;
        // Rough domain check: labels separated by dots; optional path/query/fragment.
        return /^[a-z0-9-]+(\.[a-z0-9-]+)+(?:[:\/\?#].*)?$/i.test(rawArg);
      })();

      const resolvedShortcut = shortcutMap[target] || (target.endsWith("s") ? shortcutMap[target.slice(0, -1)] : undefined);
      if (resolvedShortcut) {
        openUrl(resolvedShortcut);
        return;
      }

      if (looksLikeDomain) {
        openUrl(`https://${rawArg}`);
        return;
      }

      if (isProtocolRelative) {
        openUrl(`https:${rawArg}`);
        return;
      }

      if (isAbsoluteUrl) {
        openUrl(rawArg);
        return;
      }

      if (isPath) {
        const protocol = String(window.location.protocol || "");
        if (protocol === "file:") {
          openUrl(rawArg);
          return;
        }

        (async () => {
          try {
            const res = await fetch(rawArg, { method: "GET", cache: "no-store" });
            if (res.ok) {
              openUrl(rawArg);
              return;
            }
          } catch {}

          printLine(`Unknown target: ${rawArg}. Opening 404 page.`);
          openUrl("/404.html");
        })();
        return;
      }

      // Heuristic: try common internal routes for barewords before falling back.
      const protocol = String(window.location.protocol || "");
      const candidates = [`/${target}.html`, `/${target}/`];

      if (protocol !== "file:") {
        (async () => {
          for (const c of candidates) {
            try {
              const res = await fetch(c, { method: "GET", cache: "no-store" });
              if (res.ok) {
                openUrl(c);
                return;
              }
            } catch {}
          }

          printLine(`Unknown target: ${rawArg}. Opening 404 page.`);
          openUrl("/404.html");
        })();
        return;
      }

      // file:// mode: no reliable fetch; fall back to 404 instead of navigating to a broken absolute path.
      printLine(`Unknown target: ${rawArg}. Opening 404 page.`);
      openUrl("/404.html");
      return;
    }

    if (command === "echo") {
      printLine(args.join(" "));
      return;
    }

    printLine(`Command not found: ${command}. Try 'help'.`);
  };

  // Initial greeting
  printBlock([
    "Type 'help' for commands.",
    "", // spacer
  ]);

  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      const value = input.value;
      if (value.trim()) {
        history.unshift(value);
        historyIndex = -1;
      }
      input.value = "";
      runCommand(value);
      return;
    }

    if (event.key === "ArrowUp") {
      if (!history.length) return;
      event.preventDefault();
      historyIndex = Math.min(historyIndex + 1, history.length - 1);
      input.value = history[historyIndex] ?? "";
      // Move cursor to end
      requestAnimationFrame(() => input.setSelectionRange(input.value.length, input.value.length));
      return;
    }

    if (event.key === "ArrowDown") {
      if (!history.length) return;
      event.preventDefault();
      historyIndex = Math.max(historyIndex - 1, -1);
      input.value = historyIndex === -1 ? "" : history[historyIndex] ?? "";
      requestAnimationFrame(() => input.setSelectionRange(input.value.length, input.value.length));
    }
  });

  // Focus behavior: tapping/clicking anywhere inside the terminal focuses the input.
  // Keep it selection-friendly (don't steal focus if user is selecting output text).
  const focusInputFromEvent = (event) => {
    const target = event?.target;
    if (target && target.closest && target.closest("a, button, input, textarea, select")) return;

    const selection = typeof window.getSelection === "function" ? window.getSelection() : null;
    if (selection && String(selection).trim()) return;

    // Prevent page scroll jump on iOS when focusing, while still allowing scroll in output.
    // Use preventScroll if supported.
    try {
      input.focus({ preventScroll: true });
    } catch {
      input.focus();
    }
  };

  if (terminalCard) {
    // Pointer Events (modern)
    terminalCard.addEventListener("pointerdown", focusInputFromEvent);
    terminalCard.addEventListener("click", focusInputFromEvent);

    // Fallbacks (older Safari / odd embedded browsers)
    terminalCard.addEventListener("mousedown", focusInputFromEvent);
    terminalCard.addEventListener("touchstart", focusInputFromEvent, { passive: true });
  }
})();

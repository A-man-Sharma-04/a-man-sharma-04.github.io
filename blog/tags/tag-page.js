(() => {
  const host = document.querySelector("[data-tag-page]");
  if (!host) return;

  const postsIndexUrl = host.getAttribute("data-posts-index") || "../../posts.json";

  const normalize = (value) => String(value || "").trim().toLowerCase();

  const slugify = (value) =>
    normalize(value)
      .replace(/&/g, "and")
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

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

  const loadPostsIndex = async () => {
    try {
      const res = await fetch(postsIndexUrl, { cache: "no-store" });
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

  const getTagFromHostOrQuery = () => {
    const attr = String(host.getAttribute("data-tag") || "").trim();
    if (attr) return { requested: attr, kind: "label" };

    const params = new URLSearchParams(window.location.search || "");
    const fromQuery = String(params.get("tag") || params.get("t") || "").trim();
    if (!fromQuery) return null;

    // We interpret query values as slugs by default.
    return { requested: fromQuery, kind: "slug" };
  };

  const applyTagToPage = (label) => {
    const safe = String(label || "").trim();
    if (!safe) return;

    const slug = slugify(safe);
    const canonicalUrl = `https://thisamansharma.is-a.dev/blog/tags/tag.html?tag=${encodeURIComponent(slug || safe)}`;

    const titleEl = document.getElementById("tag-title");
    if (titleEl) titleEl.textContent = `Tag: ${safe}`;

    const crumbEl = document.getElementById("tag-breadcrumb");
    if (crumbEl) crumbEl.textContent = safe;

    const introEl = document.getElementById("tag-intro");
    if (introEl) introEl.textContent = `Notes grouped under the “${safe}” tag.`;

    document.title = `Tag: ${safe} | Aman Sharma`;

    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute("content", `Notes tagged ${safe} by Aman Sharma.`);

    const canonicalEl = document.querySelector('link[rel="canonical"]');
    if (canonicalEl) canonicalEl.setAttribute("href", canonicalUrl);

    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute("content", `Tag: ${safe} | Aman Sharma`);

    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute("content", `Notes tagged ${safe} by Aman Sharma.`);

    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) ogUrl.setAttribute("content", canonicalUrl);
  };

  const render = async () => {
    const grid = host.querySelector(".notes-grid");
    if (!grid) return;

    const posts = await loadPostsIndex();

    const requested = getTagFromHostOrQuery();
    if (!requested) {
      grid.innerHTML = `
        <div class="blog-search-hint">
          Missing tag. <a href="/blog/tags/">Browse all tags</a>.
        </div>
      `;
      return;
    }

    // Build a slug->label map from the index so tag pages work for any tag.
    const tagSlugToLabel = new Map();
    (Array.isArray(posts) ? posts : []).forEach((p) => {
      const tags = Array.isArray(p.tags) ? p.tags : [];
      tags.forEach((t) => {
        const label = String(t || "").trim();
        if (!label) return;
        const slug = slugify(label);
        if (!slug) return;
        if (!tagSlugToLabel.has(slug)) tagSlugToLabel.set(slug, label);
      });
    });

    const resolvedLabel =
      requested.kind === "label"
        ? requested.requested
        : tagSlugToLabel.get(slugify(requested.requested)) || requested.requested;

    applyTagToPage(resolvedLabel);

    const tagKey = normalize(resolvedLabel);
    const matches = posts.filter((p) => {
      const tags = Array.isArray(p.tags) ? p.tags : [];
      return tags.some((t) => normalize(t) === tagKey);
    });

    matches.sort((a, b) => {
      const ad = parseDate(a.dateModified || a.datePublished);
      const bd = parseDate(b.dateModified || b.datePublished);
      if (bd !== ad) return bd - ad;
      return String(a.title || "").localeCompare(String(b.title || ""), undefined, {
        sensitivity: "base",
      });
    });

    if (!matches.length) {
      grid.innerHTML = `
        <div class="blog-search-hint">
          No notes found for “${escapeHtml(resolvedLabel)}” yet.
          <a href="/blog/">Browse all notes</a>.
        </div>
      `;
      return;
    }

    grid.innerHTML = matches
      .map((p) => {
        const title = escapeHtml(p.title || "Untitled");
        const desc = escapeHtml(p.description || "");
        const category = escapeHtml(p.category || "");
        const url = escapeHtml(p.url || "#");
        const meta = category ? `${category} · Tagged` : "Tagged";

        return `
          <a class="notes-card" href="${url}">
            <h2>${title}</h2>
            ${desc ? `<p>${desc}</p>` : ""}
            <span class="notes-meta">${meta}</span>
          </a>
        `;
      })
      .join("");
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", render);
  } else {
    render();
  }
})();

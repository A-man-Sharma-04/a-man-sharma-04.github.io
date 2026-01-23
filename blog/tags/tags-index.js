(() => {
  const host = document.querySelector("[data-tags-root]");
  if (!host) return;

  const postsIndexUrl = host.getAttribute("data-posts-index") || "../posts.json";

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

  const render = async () => {
    const grid = host.querySelector(".notes-grid");
    if (!grid) return;

    const posts = await loadPostsIndex();

    const tagMap = new Map();
    posts.forEach((post) => {
      const tags = Array.isArray(post.tags) ? post.tags : [];
      tags.forEach((tag) => {
        const key = normalize(tag);
        if (!key) return;

        if (!tagMap.has(key)) {
          tagMap.set(key, { label: String(tag).trim(), slug: slugify(tag), count: 0 });
        }

        tagMap.get(key).count += 1;
      });
    });

    const tags = Array.from(tagMap.values())
      .filter((t) => t.slug)
      .sort((a, b) => a.label.localeCompare(b.label, undefined, { sensitivity: "base" }));

    if (!tags.length) {
      grid.innerHTML =
        '<div class="blog-search-hint">No tags found yet. Add tags to <code>blog/posts.json</code> and they\'ll show up here.</div>';
      return;
    }

    const items = tags
      .map((t) => {
        const label = escapeHtml(t.label);
        const url = `/blog/tags/tag.html?tag=${encodeURIComponent(t.slug)}`;
        const count = t.count;
        const meta = count === 1 ? "1 note" : `${count} notes`;

        return `
          <a class="notes-card" href="${url}">
            <h2>${label}</h2>
            <p>Browse notes tagged “${label}”.</p>
            <span class="notes-meta">${escapeHtml(meta)}</span>
          </a>
        `;
      })
      .join("");

    grid.innerHTML = items;
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", render);
  } else {
    render();
  }
})();

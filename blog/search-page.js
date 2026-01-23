(() => {
  const host = document.querySelector("[data-search-page]");
  if (!host) return;

  const input = host.querySelector("#blog-search");
  if (!input) return;

  const params = new URLSearchParams(window.location.search || "");
  const q = String(params.get("q") || params.get("query") || "").trim();

  if (q) {
    input.value = q;
    // Trigger the existing blog-search handler in js/main.js
    input.dispatchEvent(new Event("input", { bubbles: true }));
  }

  // Keep URL in sync as the user types (shareable searches)
  const updateUrl = () => {
    const value = String(input.value || "").trim();
    const next = new URL(window.location.href);
    if (value) {
      next.searchParams.set("q", value);
    } else {
      next.searchParams.delete("q");
      next.searchParams.delete("query");
    }

    // Avoid spamming history while typing
    window.history.replaceState({}, "", next.toString());
  };

  input.addEventListener("input", () => {
    // Debounce slightly
    window.clearTimeout(updateUrl.__t);
    updateUrl.__t = window.setTimeout(updateUrl, 120);
  });
})();

/**
 * shared.js — behavior common to every page: theme toggle, digital clock,
 * mobile hamburger nav, breaking-news ticker, and the top-bar search dropdown.
 * Expects the shared nav/topbar markup (see partials in each HTML file).
 */

(function initTheme() {
  const saved = localStorage.getItem("bb_theme");
  const theme = saved || "dark";
  document.documentElement.setAttribute("data-theme", theme);
})();

document.addEventListener("DOMContentLoaded", () => {
  initThemeToggle();
  initClock();
  initMobileNav();
  initTicker();
  initSearch();
  initHeaderScrollState();
});

function initThemeToggle() {
  const toggle = document.querySelector("[data-theme-toggle]");
  if (!toggle) return;
  const sync = () => {
    const isDark = document.documentElement.getAttribute("data-theme") === "dark";
    toggle.setAttribute("aria-checked", String(isDark));
  };
  sync();
  toggle.addEventListener("click", () => {
    const current = document.documentElement.getAttribute("data-theme");
    const next = current === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("bb_theme", next);
    sync();
  });
}

function initClock() {
  const clockEl = document.querySelector("[data-clock]");
  if (!clockEl) return;
  const tick = () => {
    const now = new Date();
    const h = String(now.getHours()).padStart(2, "0");
    const m = String(now.getMinutes()).padStart(2, "0");
    const s = String(now.getSeconds()).padStart(2, "0");
    clockEl.textContent = `${h}:${m}:${s}`;
  };
  tick();
  setInterval(tick, 1000);
}

function initMobileNav() {
  const btn = document.querySelector("[data-nav-toggle]");
  const menu = document.querySelector("[data-nav-menu]");
  if (!btn || !menu) return;
  btn.addEventListener("click", () => {
    const isOpen = menu.classList.toggle("is-open");
    btn.setAttribute("aria-expanded", String(isOpen));
  });
}

function initHeaderScrollState() {
  const header = document.querySelector("[data-navbar]");
  if (!header) return;
  const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 8);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
}

async function initTicker() {
  const track = document.querySelector("[data-ticker-track]");
  if (!track) return;
  try {
    const { items } = await NewsAPI.getBreakingNews();
    const html = items
      .map((item) => {
        const cat = getCategory(item.category);
        const dot = cat ? `<span class="ticker-dot" style="background:${cat.color}"></span>` : "";
        return `<span class="ticker-item">${dot}${escapeHtml(item.title)}</span>`;
      })
      .join("");
    // Duplicate content so the marquee loops seamlessly.
    track.innerHTML = html + html;
  } catch (err) {
    track.innerHTML = `<span class="ticker-item">Breaking news is temporarily unavailable.</span>`;
  }
}

let searchDebounce;
function initSearch() {
  const input = document.querySelector("[data-search-input]");
  const results = document.querySelector("[data-search-results]");
  if (!input || !results) return;

  input.addEventListener("input", () => {
    clearTimeout(searchDebounce);
    const query = input.value;
    if (!query.trim()) {
      results.classList.remove("is-open");
      results.innerHTML = "";
      return;
    }
    searchDebounce = setTimeout(async () => {
      const local = await searchLocalArticles(query);
      const live = await NewsAPI.search(query);
      renderSearchResults(results, local, live.items, query);
    }, 220);
  });

  document.addEventListener("click", (e) => {
    if (!e.target.closest("[data-search]")) {
      results.classList.remove("is-open");
    }
  });
}

async function searchLocalArticles(query) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  try {
    const all = await BlogsData.getAllArticles();
    return all.filter((a) => a.title.toLowerCase().includes(q) || (a.excerpt || "").toLowerCase().includes(q)).slice(0, 5);
  } catch (err) {
    return [];
  }
}

function renderSearchResults(container, localResults, liveResults, query) {
  if (!localResults.length && !liveResults.length) {
    container.innerHTML = `<div class="search-empty">No results for "${escapeHtml(query)}"</div>`;
    container.classList.add("is-open");
    return;
  }

  let html = "";
  if (localResults.length) {
    html += `<div class="search-group-label">Articles</div>`;
    html += localResults
      .map(
        (a) =>
          `<a class="search-result" href="post.html?slug=${encodeURIComponent(a.slug)}&cat=${a.category}">
            <span class="search-result-cat" style="color:${getCategory(a.category)?.color || "var(--accent-primary)"}">${getCategory(a.category)?.label || a.category}</span>
            <span class="search-result-title">${escapeHtml(a.title)}</span>
          </a>`
      )
      .join("");
  }
  if (liveResults.length) {
    html += `<div class="search-group-label">Live News</div>`;
    html += liveResults
      .slice(0, 5)
      .map((r) => `<div class="search-result search-result--live"><span class="search-result-title">${escapeHtml(r.title)}</span></div>`)
      .join("");
  }
  container.innerHTML = html;
  container.classList.add("is-open");
}

function renderCard(article, featured) {
  const cat = getCategory(article.category);
  const readTime = article.readTime || BlogsData.estimateReadTime(article.wordCount || 900);
  return `
    <a class="card ${featured ? "card--featured" : ""}" href="post.html?slug=${encodeURIComponent(article.slug)}&cat=${article.category}">
      <div class="card-media" style="background:linear-gradient(135deg, ${cat?.color || "#333"}33, transparent)">
        <span class="card-tag" style="background:${cat?.color || "#7C5CFC"}">${cat?.icon || ""} ${cat?.label || article.category}</span>
      </div>
      <div class="card-body">
        <h3 class="card-title">${escapeHtml(article.title)}</h3>
        <p class="card-excerpt">${escapeHtml(article.excerpt || "")}</p>
        <div class="card-meta">
          <span>${escapeHtml(article.author || "BlogBoard Staff")}</span>
          <span class="dot"></span>
          <span>${timeAgo(article.date)}</span>
          <span class="dot"></span>
          <span>${readTime} min read</span>
        </div>
      </div>
    </a>`;
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function timeAgo(dateStr) {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 60) return `${Math.max(mins, 1)}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" });
}

/**
 * main.js — logic for index.html, the mega-dashboard.
 * Groups articles into themed feed sections and populates the sidebar.
 */

document.addEventListener("DOMContentLoaded", async () => {
  await renderFeed();
  await renderTrendingWidget();
  renderExploreWidget();
});

async function renderFeed() {
  const feedRoot = document.querySelector("[data-feed-root]");
  if (!feedRoot) return;

  let all = [];
  try {
    all = await BlogsData.getAllArticles();
  } catch (err) {
    console.error("[main] failed to load articles", err);
  }

  if (!all.length) {
    feedRoot.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">◈</div>
        <h3>No articles yet</h3>
        <p>Local and CDN article sources are both unavailable right now.</p>
      </div>`;
    return;
  }

  const groups = getCategoriesByGroup();
  const groupOrder = ["Tech & Science", "Markets & Finance", "Politics & World", "Culture & Society"];

  // "Top News" — the most recent article across all categories, featured.
  let html = renderTopNewsSection(all.slice(0, 5));

  groupOrder.forEach((groupName) => {
    const slugsInGroup = (groups[groupName] || []).map((c) => c.slug);
    const articlesInGroup = all.filter((a) => slugsInGroup.includes(a.category)).slice(0, 6);
    if (!articlesInGroup.length) return;
    html += renderSection(groupName, articlesInGroup);
  });

  feedRoot.innerHTML = html;
}

function renderTopNewsSection(articles) {
  if (!articles.length) return "";
  const [featured, ...rest] = articles;
  const cards = [renderCard(featured, true), ...rest.slice(0, 4).map((a) => renderCard(a, false))].join("");
  return `
    <section class="feed-section">
      <div class="feed-section-head">
        <h2 class="feed-section-title"><span class="swatch" style="background:var(--accent-primary)"></span>Top News</h2>
      </div>
      <div class="feed-grid feed-grid--featured">${cards}</div>
    </section>`;
}

function renderSection(groupName, articles) {
  const firstCat = getCategory(articles[0].category);
  const cards = articles.map((a) => renderCard(a, false)).join("");
  return `
    <section class="feed-section">
      <div class="feed-section-head">
        <h2 class="feed-section-title"><span class="swatch" style="background:${firstCat?.color || "var(--accent-primary)"}"></span>${groupName}</h2>
        <a class="feed-section-link" href="category.html#cat=${articles[0].category}">View all →</a>
      </div>
      <div class="feed-grid">${cards}</div>
    </section>`;
}

async function renderTrendingWidget() {
  const root = document.querySelector("[data-trending-root]");
  if (!root) return;
  try {
    const { items } = await NewsAPI.getTrending();
    root.innerHTML = items
      .slice(0, 5)
      .map(
        (item, i) => `
        <div class="trending-item">
          <span class="trending-rank">${String(i + 1).padStart(2, "0")}</span>
          <div class="trending-body">
            <div class="trending-title">${escapeHtml(item.title)}</div>
            <div class="trending-views">${item.views || ""} reads</div>
          </div>
        </div>`
      )
      .join("");
  } catch (err) {
    root.innerHTML = `<div class="search-empty">Trending topics unavailable.</div>`;
  }
}

function renderExploreWidget() {
  const root = document.querySelector("[data-explore-root]");
  if (!root) return;
  root.innerHTML = CATEGORY_REGISTRY.map(
    (cat) => `
    <a class="tag-chip" href="category.html#cat=${cat.slug}" style="border-color:${cat.color}55">
      <span class="swatch" style="background:${cat.color}"></span>${cat.label}
    </a>`
  ).join("");
}

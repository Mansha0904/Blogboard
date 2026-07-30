/**
 * category.js — logic for category.html.
 * Reads the #cat=slug URL hash and renders that category's header + grid.
 */

document.addEventListener("DOMContentLoaded", () => {
  loadCategoryFromHash();
  window.addEventListener("hashchange", loadCategoryFromHash);
});

function getCatSlugFromHash() {
  const hash = window.location.hash.replace("#", "");
  const params = new URLSearchParams(hash);
  return params.get("cat");
}

async function loadCategoryFromHash() {
  const slug = getCatSlugFromHash();
  const cat = getCategory(slug);
  const headerRoot = document.querySelector("[data-category-header]");
  const gridRoot = document.querySelector("[data-category-grid]");

  if (!cat) {
    headerRoot.innerHTML = "";
    gridRoot.innerHTML = `
      <div class="empty-state" style="grid-column:1/-1">
        <div class="empty-state-icon">◈</div>
        <h3>Pick a category</h3>
        <p>Choose a category from the navigation to see its articles.</p>
      </div>`;
    return;
  }

  document.title = `${cat.label} — BlogBoard`;
  headerRoot.innerHTML = `
    <div class="category-icon" style="background:${cat.color}22;color:${cat.color}">${cat.icon}</div>
    <div>
      <div class="eyebrow" style="color:${cat.color}">${cat.group}</div>
      <h1 class="page-title serif" style="font-size:32px">${cat.label}</h1>
      <p class="page-sub">${cat.description}</p>
    </div>`;

  gridRoot.innerHTML = `
    <div class="card skeleton" style="height:280px"></div>
    <div class="card skeleton" style="height:280px"></div>
    <div class="card skeleton" style="height:280px"></div>`;

  try {
    const articles = await BlogsData.getCategoryArticles(slug);
    if (!articles.length) {
      gridRoot.innerHTML = `
        <div class="empty-state" style="grid-column:1/-1">
          <div class="empty-state-icon">${cat.icon}</div>
          <h3>No articles here yet</h3>
          <p>Check back soon — new ${cat.label.toLowerCase()} coverage is published regularly.</p>
        </div>`;
      return;
    }
    gridRoot.innerHTML = articles.map((a) => renderCard(a, false)).join("");
  } catch (err) {
    console.error("[category] failed to load articles", err);
    gridRoot.innerHTML = `
      <div class="empty-state" style="grid-column:1/-1">
        <div class="empty-state-icon">◈</div>
        <h3>Couldn't load this category</h3>
        <p>Both the local and CDN article sources are unavailable right now.</p>
      </div>`;
  }
}

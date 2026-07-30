/**
 * blogs-data.js — central registry for article metadata.
 * Handles fetch-with-fallback: local blogs/{category}/articles.json first,
 * then the Cloudflare R2 CDN mirror if the local copy 404s or errors.
 */

const BlogsData = (() => {
  const cache = new Map();

  async function fetchJSON(url) {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error(`${url} → HTTP ${res.status}`);
    return res.json();
  }

  /**
   * Load every article for a single category, trying local storage first
   * and falling back to the R2 CDN mirror on failure.
   */
  async function getCategoryArticles(slug) {
    if (cache.has(slug)) return cache.get(slug);

    const localUrl = `${SITE_CONFIG.localBase}/${slug}/articles.json`;
    const cdnUrl = `${SITE_CONFIG.cdnFallbackBase}/${slug}/articles.json`;

    let articles = [];
    let source = "local";
    try {
      const data = await fetchJSON(localUrl);
      articles = data.articles || [];
    } catch (localErr) {
      console.warn(`[BlogsData] local fetch failed for "${slug}", falling back to CDN`, localErr.message);
      try {
        const data = await fetchJSON(cdnUrl);
        articles = data.articles || [];
        source = "cdn";
      } catch (cdnErr) {
        console.error(`[BlogsData] CDN fallback also failed for "${slug}"`, cdnErr.message);
        articles = [];
        source = "none";
      }
    }

    articles = articles.map((a) => ({ ...a, category: slug, source }));
    cache.set(slug, articles);
    return articles;
  }

  /**
   * Load articles across every registered category. Individual category
   * failures don't block the rest — the dashboard degrades gracefully.
   */
  async function getAllArticles() {
    const slugs = CATEGORY_REGISTRY.map((c) => c.slug);
    const results = await Promise.all(slugs.map((s) => getCategoryArticles(s).catch(() => [])));
    return results.flat().sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  function estimateReadTime(wordCount) {
    return Math.max(1, Math.round(wordCount / SITE_CONFIG.readingWpm));
  }

  function clearCache() {
    cache.clear();
  }

  return { getCategoryArticles, getAllArticles, estimateReadTime, clearCache };
})();

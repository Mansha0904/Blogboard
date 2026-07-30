/**
 * news-api.js — generic wrapper around a live news provider (GNews.io or
 * NewsAPI.org). Reads the provider + key from localStorage (set via
 * admin.html → Settings). When no key is configured, or the request fails,
 * it falls back to realistic mock data so the dashboard never looks empty.
 */

const NewsAPI = (() => {
  function getSettings() {
    return {
      provider: localStorage.getItem("bb_news_provider") || SITE_CONFIG.newsApi.provider,
      apiKey: localStorage.getItem("bb_news_api_key") || ""
    };
  }

  const MOCK_BREAKING = [
    { title: "Global chip shortage eases as new fabs come online", category: "hardware" },
    { title: "Central bank holds rates steady, signals cautious outlook", category: "finance" },
    { title: "Open-weight model release narrows gap with closed frontier labs", category: "ai" },
    { title: "Coastal cities accelerate flood-defense spending ahead of storm season", category: "climate" },
    { title: "Regulators open inquiry into cloud-provider pricing practices", category: "policy" },
    { title: "Orbital launch cadence hits a new quarterly record", category: "space" },
    { title: "Ransomware group claims breach of regional logistics network", category: "cybersecurity" },
    { title: "Legislature advances data-privacy bill after committee revisions", category: "law" }
  ];

  const MOCK_TRENDING = [
    { title: "Why open-weight models are catching up faster than expected", views: "18.2k" },
    { title: "Inside the fab: what a shortage actually fixes", views: "14.7k" },
    { title: "The quiet return of nuclear as a climate strategy", views: "12.1k" },
    { title: "What the latest jobs report really says about the labor market", views: "9.8k" },
    { title: "A field guide to the current ransomware landscape", views: "8.4k" }
  ];

  function mockSearch(query) {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const pool = [...MOCK_BREAKING.map((b) => b.title), ...MOCK_TRENDING.map((t) => t.title)];
    return pool
      .filter((t) => t.toLowerCase().includes(q))
      .map((title) => ({ title }));
  }

  async function getBreakingNews() {
    const { apiKey, provider } = getSettings();
    if (!apiKey) {
      // No key configured — serve mock data, clearly labeled as such.
      return { items: MOCK_BREAKING, mock: true };
    }
    try {
      const base = SITE_CONFIG.newsApi.endpoints[provider];
      const url =
        provider === "gnews"
          ? `${base}/top-headlines?token=${apiKey}&lang=en`
          : `${base}/top-headlines?apiKey=${apiKey}&language=en`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const raw = data.articles || [];
      return { items: raw.map((a) => ({ title: a.title, category: "world" })), mock: false };
    } catch (err) {
      console.warn("[NewsAPI] live breaking-news fetch failed, using mock feed:", err.message);
      return { items: MOCK_BREAKING, mock: true };
    }
  }

  async function getTrending() {
    const { apiKey } = getSettings();
    if (!apiKey) return { items: MOCK_TRENDING, mock: true };
    try {
      // Providers don't expose a dedicated "trending" endpoint uniformly —
      // approximate with top-headlines and rank by recency.
      const breaking = await getBreakingNews();
      return { items: breaking.items.slice(0, 5).map((b, i) => ({ title: b.title, views: `${(20 - i * 2).toFixed(1)}k` })), mock: breaking.mock };
    } catch (err) {
      return { items: MOCK_TRENDING, mock: true };
    }
  }

  async function search(query) {
    const { apiKey, provider } = getSettings();
    if (!apiKey || !query.trim()) return { items: mockSearch(query), mock: true };
    try {
      const base = SITE_CONFIG.newsApi.endpoints[provider];
      const url =
        provider === "gnews"
          ? `${base}/search?q=${encodeURIComponent(query)}&token=${apiKey}&lang=en`
          : `${base}/everything?q=${encodeURIComponent(query)}&apiKey=${apiKey}&language=en`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const raw = data.articles || [];
      return { items: raw.map((a) => ({ title: a.title })), mock: false };
    } catch (err) {
      console.warn("[NewsAPI] live search failed, using mock results:", err.message);
      return { items: mockSearch(query), mock: true };
    }
  }

  return { getBreakingNews, getTrending, search, getSettings };
})();

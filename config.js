/**
 * config.js — global configuration for BlogBoard
 * Central place for site settings, category registry, and API endpoints.
 */

const SITE_CONFIG = {
  siteName: "BlogBoard",
  tagline: "Signal, not noise.",
  cdnFallbackBase: "https://blogboard-articles.r2.dev/blogs", // Cloudflare R2 fallback bucket
  localBase: "blogs", // local articles root: blogs/{category}/articles.json
  newsApi: {
    provider: "gnews", // 'gnews' | 'newsapi'
    // Keys are intentionally left blank — configure in admin.html → Settings,
    // or the app runs on realistic mock data automatically.
    endpoints: {
      gnews: "https://gnews.io/api/v4",
      newsapi: "https://newsapi.org/v2"
    }
  },
  readingWpm: 220
};

/**
 * CATEGORY_REGISTRY — single source of truth for every category/tag in
 * BlogBoard. Each entry: { slug, label, icon, color, group, description }
 * `group` buckets categories into the dashboard's themed feed sections.
 */
const CATEGORY_REGISTRY = [
  // --- Tech & Science ---
  { slug: "ml", label: "Machine Learning", icon: "◉", color: "#7C5CFC", group: "Tech & Science", description: "Models, training runs, and the math underneath them." },
  { slug: "ai", label: "Artificial Intelligence", icon: "◈", color: "#8B6BFF", group: "Tech & Science", description: "Where the field is heading, and who's steering it." },
  { slug: "cv", label: "Computer Vision", icon: "◎", color: "#6C47E8", group: "Tech & Science", description: "Teaching machines to see, segment, and recognize." },
  { slug: "nlp", label: "NLP", icon: "◐", color: "#9B7BFF", group: "Tech & Science", description: "Language models, tokenizers, and text at scale." },
  { slug: "robotics", label: "Robotics", icon: "◑", color: "#5B3FD9", group: "Tech & Science", description: "Actuators, control loops, and embodied intelligence." },
  { slug: "cybersecurity", label: "Cybersecurity", icon: "◆", color: "#E8455C", group: "Tech & Science", description: "Threats, breaches, and the defenses that hold." },
  { slug: "space", label: "Space", icon: "✦", color: "#4C6FFF", group: "Tech & Science", description: "Launches, orbits, and the hardware that gets there." },
  { slug: "biotech", label: "Biotech", icon: "◒", color: "#2DD4BF", group: "Tech & Science", description: "Genomics, therapeutics, and lab-bench breakthroughs." },
  { slug: "hardware", label: "Hardware", icon: "▣", color: "#7C5CFC", group: "Tech & Science", description: "Chips, silicon, and the machines underneath the models." },
  { slug: "quantum", label: "Quantum Computing", icon: "◍", color: "#8B6BFF", group: "Tech & Science", description: "Qubits, coherence, and the race past classical limits." },
  { slug: "climate", label: "Climate Tech", icon: "◔", color: "#34D399", group: "Tech & Science", description: "Carbon, grids, and the engineering of a cooler planet." },
  { slug: "opensource", label: "Open Source", icon: "◇", color: "#60A5FA", group: "Tech & Science", description: "Repos, licenses, and the commons that runs the internet." },

  // --- Markets & Finance ---
  { slug: "finance", label: "Finance", icon: "◈", color: "#E0B341", group: "Markets & Finance", description: "Markets, monetary policy, and where the money moves." },
  { slug: "markets", label: "Markets", icon: "◉", color: "#D4A72C", group: "Markets & Finance", description: "Equities, indices, and the daily churn of trading floors." },
  { slug: "crypto", label: "Crypto", icon: "◆", color: "#F0A020", group: "Markets & Finance", description: "Chains, protocols, and digital-asset volatility." },
  { slug: "startups", label: "Startups", icon: "▲", color: "#EAB84D", group: "Markets & Finance", description: "Funding rounds, cap tables, and the founders behind them." },
  { slug: "economy", label: "Economy", icon: "◑", color: "#C99A2E", group: "Markets & Finance", description: "Inflation, employment, and the macro picture." },
  { slug: "realestate", label: "Real Estate", icon: "▦", color: "#B8862F", group: "Markets & Finance", description: "Property markets, rates, and where prices are headed." },
  { slug: "vc", label: "Venture Capital", icon: "◈", color: "#DDAA33", group: "Markets & Finance", description: "Term sheets, valuations, and who's writing checks." },
  { slug: "trade", label: "Trade & Tariffs", icon: "⬡", color: "#C2933C", group: "Markets & Finance", description: "Supply chains, tariffs, and cross-border commerce." },

  // --- Politics & World ---
  { slug: "politics", label: "Politics", icon: "◆", color: "#E8455C", group: "Politics & World", description: "Policy, power, and the institutions that hold both." },
  { slug: "elections", label: "Elections", icon: "☆", color: "#F0526B", group: "Politics & World", description: "Campaigns, polling, and results as they land." },
  { slug: "policy", label: "Policy", icon: "▣", color: "#D63A50", group: "Politics & World", description: "Legislation and the regulatory fine print." },
  { slug: "world", label: "World", icon: "◍", color: "#C7304A", group: "Politics & World", description: "Global affairs, diplomacy, and cross-border news." },
  { slug: "law", label: "Law & Courts", icon: "⚖", color: "#DE4560", group: "Politics & World", description: "Rulings, cases, and the legal system in motion." },
  { slug: "defense", label: "Defense", icon: "◭", color: "#B72E44", group: "Politics & World", description: "Military affairs and geopolitical security." },

  // --- Culture & Society ---
  { slug: "culture", label: "Culture", icon: "◐", color: "#2DD4BF", group: "Culture & Society", description: "Ideas, media, and the shifting cultural current." },
  { slug: "health", label: "Health", icon: "✚", color: "#34D399", group: "Culture & Society", description: "Medicine, public health, and wellbeing research." },
  { slug: "education", label: "Education", icon: "◈", color: "#38BDF8", group: "Culture & Society", description: "Schools, universities, and how learning is changing." },
  { slug: "energy", label: "Energy", icon: "◉", color: "#FBBF24", group: "Culture & Society", description: "Grids, generation, and the transition underway." },
  { slug: "labor", label: "Labor", icon: "◑", color: "#22D3EE", group: "Culture & Society", description: "Work, wages, and organized labor movements." },
  { slug: "media", label: "Media", icon: "▤", color: "#5EEAD4", group: "Culture & Society", description: "Publishing, platforms, and the attention economy." }
];

function getCategory(slug) {
  return CATEGORY_REGISTRY.find((c) => c.slug === slug) || null;
}

function getCategoriesByGroup() {
  const groups = {};
  CATEGORY_REGISTRY.forEach((cat) => {
    if (!groups[cat.group]) groups[cat.group] = [];
    groups[cat.group].push(cat);
  });
  return groups;
}

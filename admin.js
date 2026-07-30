/**
 * admin.js — logic for admin.html, the CMS dashboard.
 * Handles the password gate, tab switching, settings persistence to
 * localStorage, and renders mock queue / performance data.
 */

const ADMIN_PASSWORD = "admin123";

const MOCK_QUEUE = [
  { title: "Fusion Startups Report Second Consecutive Funding Record", seo: 92, status: "review" },
  { title: "What the Latest Jobs Report Really Says About the Labor Market", seo: 87, status: "approved" },
  { title: "A Beginner's Map of the Current LLM Landscape", seo: 78, status: "review" },
  { title: "Draft: Regional Grid Operators Brace for Peak Demand", seo: 64, status: "draft" },
  { title: "Draft: Inside a Modern Phishing-as-a-Service Kit", seo: 71, status: "draft" },
  { title: "Central Banks Compare Notes on Digital Currency Pilots", seo: 90, status: "approved" }
];

document.addEventListener("DOMContentLoaded", () => {
  initLogin();
  initTabs();
  initSettingsForm();
  renderQueue();
  renderPerformance();
});

function initLogin() {
  const overlay = document.querySelector("[data-admin-login]");
  const shell = document.querySelector("[data-admin-shell]");
  const form = document.querySelector("[data-login-form]");
  const input = document.querySelector("[data-login-password]");
  const error = document.querySelector("[data-login-error]");

  const alreadyIn = sessionStorage.getItem("bb_admin_authed") === "true";
  if (alreadyIn) {
    overlay.style.display = "none";
    shell.classList.add("is-active");
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (input.value === ADMIN_PASSWORD) {
      sessionStorage.setItem("bb_admin_authed", "true");
      overlay.style.display = "none";
      shell.classList.add("is-active");
      error.textContent = "";
    } else {
      error.textContent = "Incorrect password. Try again.";
      input.value = "";
      input.focus();
    }
  });
}

function initTabs() {
  const tabs = document.querySelectorAll("[data-admin-tab]");
  const panels = document.querySelectorAll("[data-admin-panel]");
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const target = tab.getAttribute("data-admin-tab");
      tabs.forEach((t) => t.classList.remove("is-active"));
      panels.forEach((p) => p.classList.remove("is-active"));
      tab.classList.add("is-active");
      document.querySelector(`[data-admin-panel="${target}"]`).classList.add("is-active");
    });
  });
}

function initSettingsForm() {
  const providerSelect = document.querySelector("[data-settings-provider]");
  const keyInput = document.querySelector("[data-settings-key]");
  const saveBtn = document.querySelector("[data-settings-save]");
  const confirmEl = document.querySelector("[data-settings-confirm]");

  providerSelect.value = localStorage.getItem("bb_news_provider") || SITE_CONFIG.newsApi.provider;
  keyInput.value = localStorage.getItem("bb_news_api_key") || "";

  saveBtn.addEventListener("click", () => {
    localStorage.setItem("bb_news_provider", providerSelect.value);
    localStorage.setItem("bb_news_api_key", keyInput.value.trim());
    confirmEl.textContent = "Settings saved.";
    confirmEl.classList.add("is-visible");
    setTimeout(() => confirmEl.classList.remove("is-visible"), 2200);
  });
}

function renderQueue() {
  const root = document.querySelector("[data-queue-body]");
  if (!root) return;
  root.innerHTML = MOCK_QUEUE.map(
    (item) => `
    <tr>
      <td>${escapeHtml(item.title)}</td>
      <td class="mono">${item.seo}</td>
      <td><span class="status-pill status-pill--${item.status}">${item.status}</span></td>
    </tr>`
  ).join("");
}

function renderPerformance() {
  const root = document.querySelector("[data-performance-grid]");
  if (!root) return;
  const stats = [
    { label: "Total Views (30d)", value: "482.6k", delta: "+12.4% vs prior period" },
    { label: "Avg SEO Score", value: "84", delta: "+3 pts vs prior period" },
    { label: "Published Today", value: "7", delta: "3 pending review" }
  ];
  root.innerHTML = stats
    .map(
      (s) => `
      <div class="stat-card">
        <div class="stat-label">${s.label}</div>
        <div class="stat-value mono">${s.value}</div>
        <div class="stat-delta">${s.delta}</div>
      </div>`
    )
    .join("");
}

/**
 * post.js — logic for post.html, the article reading view.
 * Reads ?slug=&cat= from the URL, loads metadata + raw markdown, renders it
 * with marked.js (+ highlight.js for code blocks), then builds the TOC and
 * scroll progress bar from the rendered headings.
 */

document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const slug = params.get("slug");
  const catSlug = params.get("cat");

  if (!slug || !catSlug) {
    renderNotFound();
    return;
  }

  try {
    const articles = await BlogsData.getCategoryArticles(catSlug);
    const article = articles.find((a) => a.slug === slug);
    if (!article) {
      renderNotFound();
      return;
    }
    await renderArticle(article);
    initReadingProgress();
  } catch (err) {
    console.error("[post] failed to load article", err);
    renderNotFound();
  }
});

async function renderArticle(article) {
  const cat = getCategory(article.category);
  document.title = `${article.title} — BlogBoard`;

  document.querySelector("[data-breadcrumbs]").innerHTML = `
    <a href="index.html">Home</a>
    <span>›</span>
    <a href="category.html#cat=${article.category}">${cat?.label || article.category}</a>
    <span>›</span>
    <span>${escapeHtml(article.title)}</span>`;

  const readTime = article.readTime || BlogsData.estimateReadTime(article.wordCount || 900);
  document.querySelector("[data-article-title]").textContent = article.title;
  document.querySelector("[data-article-meta]").innerHTML = `
    <span>${escapeHtml(article.author || "BlogBoard Staff")}</span>
    <span class="dot"></span>
    <span>${formatDate(article.date)}</span>
    <span class="dot"></span>
    <span>${readTime} min read</span>`;
  document.querySelector("[data-article-tags]").innerHTML = (article.tags || [article.category])
    .map((slug) => {
      const c = getCategory(slug);
      return `<a class="tag-chip" href="category.html#cat=${slug}" style="border-color:${c?.color || "#7C5CFC"}55"><span class="swatch" style="background:${c?.color || "#7C5CFC"}"></span>${c?.label || slug}</a>`;
    })
    .join("");

  const contentEl = document.querySelector("[data-article-content]");
  try {
    const res = await fetch(article.mdPath, { cache: "no-store" });
    if (!res.ok) throw new Error(`markdown fetch failed: HTTP ${res.status}`);
    const raw = await res.text();
    const html = marked.parse(raw);
    contentEl.innerHTML = html;
    if (window.hljs) {
      contentEl.querySelectorAll("pre code").forEach((block) => hljs.highlightElement(block));
    }
    buildTOC(contentEl);
  } catch (err) {
    console.error("[post] markdown render failed", err);
    contentEl.innerHTML = `<p>This article's content couldn't be loaded right now. Please try again shortly.</p>`;
  }
}

function buildTOC(contentEl) {
  const tocList = document.querySelector("[data-toc-list]");
  const tocWrap = document.querySelector("[data-toc]");
  if (!tocList) return;
  const headings = contentEl.querySelectorAll("h2, h3");
  if (!headings.length) {
    if (tocWrap) tocWrap.style.display = "none";
    return;
  }

  const links = [];
  headings.forEach((h, i) => {
    const id = `section-${i}-${slugify(h.textContent)}`;
    h.id = id;
    const isH3 = h.tagName === "H3";
    const a = document.createElement("a");
    a.href = `#${id}`;
    a.className = `toc-link${isH3 ? " is-h3" : ""}`;
    a.textContent = h.textContent;
    tocList.appendChild(a);
    links.push({ id, el: a });
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const link = links.find((l) => l.id === entry.target.id);
        if (!link) return;
        if (entry.isIntersecting) {
          links.forEach((l) => l.el.classList.remove("is-active"));
          link.el.classList.add("is-active");
        }
      });
    },
    { rootMargin: "-100px 0px -70% 0px" }
  );
  headings.forEach((h) => observer.observe(h));
}

function slugify(text) {
  return text.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function initReadingProgress() {
  const bar = document.querySelector("[data-reading-progress]");
  if (!bar) return;
  const onScroll = () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? Math.min(100, (scrollTop / docHeight) * 100) : 0;
    bar.style.width = `${pct}%`;
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
}

function renderNotFound() {
  const main = document.querySelector("[data-article-main]");
  if (main) {
    main.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">◈</div>
        <h3>Article not found</h3>
        <p>This article may have moved or no longer exists.</p>
        <p style="margin-top:16px"><a class="btn btn-primary" href="index.html">Back to dashboard</a></p>
      </div>`;
  }
}

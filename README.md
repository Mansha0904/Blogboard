# BlogBoard (Frontend)
This directory contains the purely static, frontend codebase for **BlogBoard** — a Mega-Dashboard for news and insights. 
It is designed to be blazing fast, requiring zero build steps or bundlers, while offering a rich, app-like experience using vanilla web technologies.
## 🚀 Features
- **Mega-Dashboard Homepage**: Features a real-time breaking news ticker, global search with autocomplete, and live clocks.
- **Dynamic Content Loading**: Reads and parses `markdown` files on the fly for blog posts and pulls structured metadata from JSON registries (`articles.json`).
- **Live News Integration**: Interacts dynamically with external news APIs (like GNews) to populate trending and breaking news.
- **Built-in CMS Admin Panel**: Client-side login overlay (`admin123`) with tabs for AI article queue, API configuration, and mock performance metrics.
- **Glassmorphism & Theming**: Includes a premium aesthetic with animated ambient backgrounds and native Dark/Light mode toggling that saves to `localStorage`.
- **Markdown Reader**: The `post.html` page renders articles using `marked.js` and `highlight.js`, complete with a reading progress bar and auto-generated Table of Contents.
## 🛠 Tech Stack
- **HTML5**: Semantic layout with deep linking support.
- **CSS3**: Vanilla CSS using custom properties (CSS variables) for theming. No frameworks (Tailwind, Bootstrap) are used, keeping the project lightweight.
- **Vanilla JavaScript**: All logic (API fetching, DOM manipulation, routing) is handled via vanilla JS (ES6+).
- **Libraries (CDN)**:
  - [marked.js](https://marked.js.org/) for Markdown parsing.
  - [highlight.js](https://highlightjs.org/) for code syntax highlighting.
## 📁 Directory Structure
```text
web/
├── admin.html          # Admin Panel (Login, Settings, Queue)
├── category.html       # Dynamic list of articles filtered by topic
├── index.html          # Mega-Dashboard homepage
├── post.html           # Article reader (parses markdown)
├── favicon.svg         # SVG Favicon
├── css/
│   ├── main.css        # Global styles and variables
│   ├── dashboard.css   # Mega-Dashboard specific layout
│   ├── category.css    # Category list styles
│   └── post.css        # Typography and layout for articles
├── js/
│   ├── config.js       # App configuration (API URLs)
│   ├── news-api.js     # External News API integration
│   ├── blogs-data.js   # Local JSON/Markdown fetching registry
│   ├── dashboard.js    # Logic for index.html
│   ├── category.js     # Logic for category.html
│   ├── post.js         # Logic for post.html
│   └── admin.js        # Logic for admin.html
└── blogs/              # Content Database
    ├── ml/             # Example Category Folder
    │   ├── articles.json       # Metadata for all ML articles
    │   └── some-article.md     # The actual post content
    └── ...             # 30+ other categories
```
## 🏁 Getting Started
Since the platform relies on JS `fetch()` to load local JSON and Markdown files, you **cannot** simply double-click `index.html` (due to browser CORS restrictions on `file://` protocols). You must serve it over HTTP.
### Option 1: Python HTTP Server (Recommended)
If you have Python installed, open your terminal in this directory and run:
```bash
python -m http.server 8000
```
Then visit `http://localhost:8000` in your browser.
### Option 2: Node.js (npx)
If you have Node installed, you can use:
```bash
npx serve .
# or
npx http-server .
```
### Option 3: VS Code Live Server
If you use VS Code, install the "Live Server" extension, right-click `index.html`, and select "Open with Live Server".
## 📝 Writing New Content
1. Create a new markdown file (`.md`) inside the relevant category folder under `blogs/` (e.g., `blogs/finance/my-article.md`).
2. Open that category's `articles.json` (e.g., `blogs/finance/articles.json`) and append a new JSON object:
```json
{
  "id": "blogs/finance/my-article.md",
  "category": "finance",
  "title": "My Article Title",
  "description": "A short summary for the card.",
  "date": "2026-08-01",
  "readTime": "5 min",
  "file": "blogs/finance/my-article.md"
}
```
3. Refresh the site. Your article will appear automatically!

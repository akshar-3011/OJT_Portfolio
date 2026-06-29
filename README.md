# GlobalWire (Live-NEWZ)

**Real-Time News Intelligence** — a responsive news web application that fetches live headlines from around the world using the [News API](https://newsapi.org). Built with vanilla HTML, CSS, and JavaScript as a college capstone / portfolio project.

**Live demo:** [https://live-newz.vercel.app](https://live-newz.vercel.app)

---

## Table of Contents

- [About the Project](#about-the-project)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [How It Works](#how-it-works)
- [Getting Started (Local)](#getting-started-local)
- [Deploy on Vercel](#deploy-on-vercel)
- [Environment Variables](#environment-variables)
- [API & Security](#api--security)
- [Browser Support](#browser-support)
- [Known Limitations](#known-limitations)
- [Author](#author)

---

## About the Project

**GlobalWire** (also called **Live-NEWZ**) is a client-side news reader that lets users browse breaking headlines, filter by category or country, search topics, save articles as bookmarks, and read full article previews — all in a clean, modern UI with light and dark themes.

The app uses the **News API** as its data source and is designed to run both locally for development and on **Vercel** for production, with a serverless proxy that keeps the API key hidden from the browser.

### Goals

- Display real-time news from trusted global publishers
- Provide fast category-based navigation (Politics, Tech, Sports, etc.)
- Offer a smooth mobile experience with sidebar and bottom navigation
- Persist user preferences (theme, bookmarks) in the browser
- Deploy securely without exposing API keys in client-side code

---

## Features

### News & Content

| Feature | Description |
|--------|-------------|
| **Live breaking ticker** | Scrolling strip of top headlines at the top of the feed |
| **Hero story** | Featured top article with large image and summary |
| **Trending section** | Horizontal scroll of hot stories |
| **Latest news grid** | Card layout with image, source, time, and excerpt |
| **Category sections** | Home page blocks for Business, Technology, Sports, Entertainment |
| **16+ categories** | Politics, Finance, Tech, Sports, Health, Science, Entertainment, World, India, USA, UK, AI, Startups, Climate, Crypto, and more |
| **Search** | Search news by keyword with recent search history |
| **Article detail page** | Dedicated page (`article.html`) for reading a full story |

### User Experience

| Feature | Description |
|--------|-------------|
| **Light / Dark theme** | Toggle with sun/moon icon; preference saved in `localStorage` |
| **Bookmarks** | Save articles locally; view all in the Bookmarks section |
| **Sidebar navigation** | Collapsible menu with categories and explore options |
| **Mobile bottom nav** | Quick access to Home, Trending, Bookmarks, and Settings on small screens |
| **Skeleton loaders** | Loading placeholders while news is fetched |
| **Error handling** | User-friendly messages when the API fails or rate limits |
| **Responsive design** | Works on desktop, tablet, and mobile |

### Performance & API

| Feature | Description |
|--------|-------------|
| **30-minute client cache** | Reduces duplicate API calls in the same session |
| **Sequential loading** | Home sections load one after another to avoid rate limits |
| **Vercel serverless proxy** | `/api/news` hides the API key on production |
| **Asset caching** | Static assets cached via `vercel.json` headers |

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Markup** | HTML5 |
| **Styling** | CSS3 (custom properties, flexbox, grid, animations) |
| **Logic** | Vanilla JavaScript (ES modules) |
| **Data** | [News API](https://newsapi.org) v2 |
| **Storage** | `localStorage` (theme, bookmarks, preferences), `sessionStorage` (article detail) |
| **Hosting** | [Vercel](https://vercel.com) |
| **Serverless** | Vercel Functions (`api/news.js`) |
| **Local server** | `serve` (via `npm run dev`) |

**No frameworks** — no React, Vue, or jQuery. Pure web standards for learning and simplicity.

---

## Project Structure

```
Live-NEWZ/
├── index.html              # Main feed page
├── article.html            # Article detail page
├── README.md               # This file
├── package.json            # Dev script (local server)
├── vercel.json             # Vercel config (cache headers)
├── .env.example            # Example server env (do not commit real keys)
├── .gitignore              # Ignores config.js, .env, node_modules
│
├── api/
│   └── news.js             # Vercel serverless proxy → News API
│
├── css/
│   └── style.css           # All styles (light/dark theme, layout, components)
│
├── js/
│   ├── app.js              # Main app: navigation, loading, events
│   ├── api.js              # Fetches news (direct local / proxy on Vercel)
│   ├── render.js           # Builds DOM: cards, hero, ticker, trending
│   ├── state.js            # App state, theme, bookmarks, localStorage
│   ├── categories.js       # Sidebar menus, categories, trending topics
│   ├── article.js          # Article detail page logic
│   ├── config.example.js   # Template for local API key
│   └── config.js           # Your real API key (local only, gitignored)
│
└── assets/
    ├── logo.svg
    ├── placeholder-news.svg
    ├── icon-menu.svg
    ├── icon-search.svg
    ├── icon-bookmark.svg
    ├── icon-bookmark-filled.svg
    └── icon-verified.svg
```

---

## How It Works

```
┌─────────────┐     localhost      ┌──────────────┐     ┌───────────┐
│  index.html │ ─────────────────► │   js/api.js  │ ──► │ News API  │
│  + app.js   │   (uses config.js) │              │     │ (direct)  │
└─────────────┘                    └──────────────┘     └───────────┘

┌─────────────┐     production     ┌──────────────┐     ┌───────────┐
│  index.html │ ─────────────────► │  /api/news   │ ──► │ News API  │
│  + app.js   │   (no config.js)   │ (serverless) │     │ (proxied) │
└─────────────┘                    └──────────────┘     └───────────┘
                                         ▲
                                         │ NEWS_API_KEY
                                   (Vercel env var)
```

1. User opens the app → `app.js` initializes theme, sidebar, and loads news.
2. `api.js` checks if the host is `localhost`:
   - **Local:** calls News API directly with key from `js/config.js`
   - **Production:** calls `/api/news?endpoint=...` on the same domain
3. `api/news.js` (Vercel function) adds `NEWS_API_KEY` server-side and forwards the request.
4. `render.js` builds article cards, hero, ticker, and trending UI.
5. Bookmarks and theme are saved in the browser — no backend database.

---

## Getting Started (Local)

### Prerequisites

- [Node.js](https://nodejs.org/) (for `npm run dev`)
- A free API key from [newsapi.org/register](https://newsapi.org/register)

### Steps

1. **Clone the repository**

   ```bash
   git clone https://github.com/Code-Smokker/Live-newz.git
   cd Live-newz
   ```

2. **Add your API key (local only)**

   ```bash
   cp js/config.example.js js/config.js
   ```

   Open `js/config.js` and replace the placeholder with your key:

   ```js
   export const API_KEY = 'your_newsapi_key_here';
   ```

3. **Start the dev server**

   ```bash
   npm run dev
   ```

4. **Open in browser**

   ```
   http://localhost:3000
   ```

> **Note:** Do not commit `js/config.js`. It is listed in `.gitignore`.

---

## Deploy on Vercel

1. Push this repo to GitHub (e.g. `Code-Smokker/Live-newz`).
2. Go to [vercel.com](https://vercel.com) → **Add New Project**.
3. Import your GitHub repository.
4. Settings:
   - **Framework Preset:** Other
   - **Root Directory:** `/` (project root)
   - **Build Command:** leave empty
   - **Output Directory:** leave empty
5. Add the environment variable (see below).
6. Click **Deploy**.

Your site will be live at a URL like `https://live-newz.vercel.app`.

After changing env variables, **redeploy** for changes to take effect.

---

## Environment Variables

### Vercel (required for production)

| Variable | Value | Where |
|----------|-------|-------|
| `NEWS_API_KEY` | Your News API key from [newsapi.org](https://newsapi.org) | Vercel → Project → Settings → Environment Variables |

Apply to: **Production**, **Preview**, and **Development**.

### Local (optional alternative to `config.js`)

You can use a `.env` file locally with Vercel CLI, but the simplest local setup is `js/config.js` as described above.

---

## API & Security

- The **News API free tier** has rate limits (e.g. 100 requests/day on developer plan). The app uses caching and sequential loading to reduce calls.
- **Never commit** your API key to GitHub.
- On **Vercel**, the key lives only in environment variables and is used inside `api/news.js` on the server.
- On **localhost**, the key is read from `js/config.js` which is gitignored.
- The proxy only allows `top-headlines` and `everything` endpoints.

---

## Browser Support

- Chrome, Firefox, Safari, Edge (latest versions)
- Requires ES modules (`import` / `export`) — use a local server, not `file://`
- `localStorage` required for theme and bookmarks

---

## Known Limitations

- News API free plan may block requests from production IPs after heavy use (429 errors).
- Some articles may have missing images — a placeholder SVG is shown instead.
- Article full text opens on the publisher's website; the app shows title, description, and source only.
- Bookmarks are stored per browser/device (not synced across devices).

---

## Author

**Omkar Shewale**  
College project — JavaScript Capstone / OJT Portfolio  
Repository: [Code-Smokker/Live-newz](https://github.com/Code-Smokker/Live-newz)

---

## License

This project is for educational and portfolio purposes.

---

## Quick Commands

```bash
# Local development
cp js/config.example.js js/config.js   # add your key first
npm run dev

# Open app
open http://localhost:3000
```

**Vercel env:** `NEWS_API_KEY` = your News API key

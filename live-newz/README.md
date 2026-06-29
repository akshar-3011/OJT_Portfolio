# GlobalWire (Live-NEWZ)

Real-time news web app — college project.

**Live site:** Add your Vercel URL here  
**Tech:** HTML, CSS, JavaScript, News API, Vercel

## Project files

```
index.html        → Main page
article.html      → Article detail page
css/style.css     → All styles + dark theme
js/app.js         → App logic (navigation, loading news)
js/api.js         → Fetches news from API
js/render.js      → Builds cards, hero, ticker on screen
js/state.js       → Theme, bookmarks, app state (localStorage)
js/categories.js  → Sidebar menus and categories
api/news.js       → Vercel serverless proxy (hides API key)
```

## Vercel deploy

1. Push code to GitHub
2. Import on [vercel.com](https://vercel.com) — set **Root Directory** to `live-newz`
3. Add env variable: `NEWS_API_KEY` = your News API key
4. Deploy

## Local run

```bash
cd live-newz
cp js/config.example.js js/config.js   # add your key
npm run dev
```

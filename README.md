# OJT Capstone Portfolio

A unified dashboard built as part of the JavaScript On-Job-Training capstone. Five independent applications, each developed by a different team member, are integrated into a single-page dashboard with sidebar navigation, so any project can be opened without leaving the page or triggering a full browser reload.

## Live Demo

Open the deployed link and use the sidebar to switch between projects.

## Architecture

The portfolio uses a shell-and-projects structure. The shell (root-level `index.html`, `js/`, `css/`) owns the sidebar, routing, and theme toggle. Each project lives in its own folder under `projects/` and is loaded into an `<iframe>` when selected from the sidebar, which keeps every project's HTML, CSS, and JavaScript fully isolated from the others and from the shell itself.

```
OJT_Portfolio/
├── index.html              Shell entry point (dashboard + sidebar)
├── js/
│   ├── app.js               Shell bootstrap
│   ├── sidebar.js            Sidebar navigation and iframe loading
│   ├── router.js             Client-side view switching
│   └── theme.js              Light/dark theme toggle (localStorage)
├── css/                      Shell styling (layout, sidebar, dashboard, responsive)
├── api/
│   └── news.js               Serverless function, proxies NewsAPI requests
├── vercel.json                Deployment configuration
└── projects/
    ├── quiz-app/              Interactive multiple-choice quiz
    ├── expense-tracker/        Income & expense tracker with localStorage
    ├── live-news/               News feed via NewsAPI (through the serverless proxy)
    ├── github-dev-explorer/      GitHub user/repo search using the GitHub REST API
    └── kanban-task-board/        Drag-and-drop task board with localStorage persistence
```

Each project folder is self-contained (its own HTML, CSS, and JS), which is what keeps one project's styles from leaking into another despite all five being shown inside the same dashboard.

## Why a Serverless Function

NewsAPI's free tier blocks browser requests from any domain other than `localhost`. Calling it directly from the deployed site would fail with a CORS error. The `api/news.js` serverless function runs on the server side, reads the API key from an environment variable, and forwards the request to NewsAPI — so the key is never exposed in the browser and the request is never blocked by CORS in production.

In local development, `live-news` calls NewsAPI directly using a local `config.js` (see Setup below); in production it automatically routes through `/api/news` instead. No code change is needed when moving between the two.

## Projects

| Project | Description | Key Concepts |
|---|---|---|
| Quiz App | Multiple-choice quiz with scoring and a results screen | State management, DOM rendering |
| Expense Tracker | Add/edit/delete income and expenses, running totals | CRUD, `localStorage`, array methods |
| Live News | Search and browse live headlines by category | `fetch`/`async-await`, serverless API proxy |
| GitHub Explorer | Search a GitHub username to view profile, repos, and language stats | Multiple API endpoints, rate-limit handling |
| Kanban Board | Drag-and-drop task board across To Do / In Progress / Done | HTML5 Drag and Drop API, persisted state |

## Setup

### Run locally

No build step is required for the dashboard or most projects — clone the repo and open `index.html` with a local server (for example, the VS Code Live Server extension, or `npx serve`).

### Live News API key (local only)

The Live News project needs a NewsAPI key only when running locally:

```bash
cp projects/live-news/js/config.example.js projects/live-news/js/config.js
```

Then add your key from [newsapi.org](https://newsapi.org) inside `config.js`. This file is gitignored and is never committed.

### Deployment (Vercel)

The project is deployed on Vercel. The only required configuration is one environment variable:

| Key | Value |
|---|---|
| `NEWS_API_KEY` | Your NewsAPI key |

Set it under **Project Settings → Environment Variables** for Production and Preview, then redeploy.

## Tech Stack

HTML5, CSS3, vanilla JavaScript (ES Modules). No frontend frameworks. One Node.js serverless function (`api/news.js`) for the NewsAPI proxy, deployed on Vercel.

## Team

Built collaboratively, with each project developed independently on its own branch before being integrated into the shared dashboard.

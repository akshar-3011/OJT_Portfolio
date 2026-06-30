# Contributing

This repository was built by a five-person team as part of a JavaScript On-Job-Training capstone. It isn't open for outside contributions, but this document records how the team actually worked, for anyone reviewing the project (including during evaluation).

## Team Workflow

Each of the five core projects (Quiz App, Expense Tracker, Live News, GitHub Explorer, Kanban Board) was built independently by one team member on their own feature branch.

1. Each member worked on their own project in isolation on their own branch.
2. Completed projects were opened as pull requests into `develop`.
3. Folder names, HTML structure, and CSS conventions were standardized across all five projects before final integration, to keep the codebase consistent and easy to navigate.
4. Once all five projects were integrated into the shared dashboard shell (sidebar, routing, theming), `develop` was deployed to Vercel for testing, and the reviewed, stable result was kept on `portfolio-branch`.

## Branching

- `develop` — active integration branch, deployed for testing.
- `portfolio-branch` — stable, reviewed snapshot.
- Individual project branches were merged via pull request rather than pushed directly.

## Local Setup

```bash
git clone https://github.com/akshar-3011/OJT_Portfolio.git
cd OJT_Portfolio
```

No build step is required. Open `index.html` with a local server (for example, the VS Code Live Server extension, or `npx serve`).

The Live News project additionally needs a local API key:

```bash
cp projects/live-news/js/config.example.js projects/live-news/js/config.js
```

Add a key from [newsapi.org](https://newsapi.org) inside the new `config.js`. This file is gitignored and must never be committed.

## Code Style

- Plain HTML, CSS, and vanilla JavaScript (ES Modules where used) — no frameworks.
- 4-space indentation.
- `rgba()` for color values in CSS.
- Each project's JavaScript is split by responsibility where practical (e.g. `state.js`, `render.js`, `api.js`) rather than kept in one file.
- Comments explain *why*, kept short, no decorative separators.

## Reporting Issues

Since this is a fixed-team academic project, issues found after submission should be raised directly with the team rather than through public issue tracking.

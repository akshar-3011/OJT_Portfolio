import { fetchTopHeadlines } from './api.js';
import { getStoredArticle, initTheme, setTheme } from './state.js';
import { renderArticleDetail, renderArticles } from './render.js';

function toggleThemeMode() {
  const current = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  setTheme(current === 'dark' ? 'light' : 'dark');
}

async function loadRelated(article) {
  const section = document.getElementById('related-section');
  const container = document.getElementById('related-container');
  if (!section || !container || !article?.title) return;

  try {
    const data = await fetchTopHeadlines({ category: 'general', page: 1 });
    const related = (data.articles || []).filter((a) => a.url !== article.url).slice(0, 3);

    if (!related.length) return;

    section.hidden = false;
    renderArticles(related, 'related-container', { category: 'Related', color: 'default' });
  } catch {
    // Related news is optional
  }
}

function initializeArticlePage() {
  initTheme();
  document.getElementById('theme-toggle')?.addEventListener('click', toggleThemeMode);

  const article = getStoredArticle();

  if (!article) {
    window.location.href = './index.html';
    return;
  }

  renderArticleDetail(article);
  loadRelated(article);
}

initializeArticlePage();

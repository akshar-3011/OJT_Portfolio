import { TRUSTED_SOURCES } from './categories.js';
import { isBookmarked, removeBookmark, saveBookmark, storeArticle } from './state.js';

const PLACEHOLDER_IMAGE = './assets/placeholder-news.svg';
const BOOKMARK_ICON = './assets/icon-bookmark.svg';
const BOOKMARK_FILLED_ICON = './assets/icon-bookmark-filled.svg';
const VERIFIED_ICON = './assets/icon-verified.svg';

function getContainer(containerId) {
  const container = document.getElementById(containerId);
  if (!container) throw new Error(`Container "${containerId}" not found.`);
  return container;
}

function appendText(parent, tag, text, className) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  el.textContent = text || '';
  parent.appendChild(el);
  return el;
}

export function openArticle(article) {
  storeArticle(article);
  window.location.href = './article.html';
}

function formatTimeAgo(publishedAt) {
  if (!publishedAt) return 'Unknown';
  const date = new Date(publishedAt);
  if (Number.isNaN(date.getTime())) return publishedAt;

  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins || 1} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function formatDate(publishedAt) {
  if (!publishedAt) return 'Unknown date';
  const date = new Date(publishedAt);
  if (Number.isNaN(date.getTime())) return publishedAt;
  return date.toLocaleString(undefined, { dateStyle: 'long', timeStyle: 'short' });
}

function getReadingTime(text) {
  const words = (text || '').split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.ceil(words / 200))} min read`;
}

function isTrustedSource(name) {
  if (!name) return false;
  return TRUSTED_SOURCES.some((s) => name.toLowerCase().includes(s.toLowerCase()));
}

function createBookmarkButton(article) {
  const btn = document.createElement('button');
  const saved = isBookmarked(article.url);

  btn.type = 'button';
  btn.className = 'bookmark-btn';
  btn.setAttribute('aria-label', saved ? 'Remove bookmark' : 'Save article');
  btn.innerHTML = `<img src="${saved ? BOOKMARK_FILLED_ICON : BOOKMARK_ICON}" alt="" width="16" height="16" />`;

  btn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    const nowSaved = isBookmarked(article.url);
    if (nowSaved) {
      removeBookmark(article.url);
      btn.innerHTML = `<img src="${BOOKMARK_ICON}" alt="" width="16" height="16" />`;
    } else {
      saveBookmark(article);
      btn.innerHTML = `<img src="${BOOKMARK_FILLED_ICON}" alt="" width="16" height="16" />`;
    }
  });

  return btn;
}

function buildCard(article, { category = 'General', color = 'default', delay = 0 } = {}) {
  const card = document.createElement('article');
  const image = document.createElement('img');
  const content = document.createElement('div');
  const top = document.createElement('div');
  const meta = document.createElement('p');
  const footer = document.createElement('div');
  const source = article.source?.name || 'Unknown';
  const timeAgo = formatTimeAgo(article.publishedAt);
  const readTime = getReadingTime(`${article.title} ${article.description}`);

  card.className = 'news-card fade-in';
  card.style.animationDelay = `${delay}ms`;
  content.className = 'news-card__content';

  image.className = 'news-card__image';
  image.src = article.urlToImage || PLACEHOLDER_IMAGE;
  image.alt = article.title || 'News image';
  image.loading = 'lazy';
  image.onerror = () => {
    image.onerror = null;
    image.src = PLACEHOLDER_IMAGE;
  };

  top.className = 'news-card__top';
  const catBadge = document.createElement('span');
  catBadge.className = `news-card__category news-card__category--${color}`;
  catBadge.textContent = category;
  top.appendChild(catBadge);

  if (isTrustedSource(source)) {
    const verified = document.createElement('span');
    verified.className = 'news-card__verified';
    verified.innerHTML = `<img src="${VERIFIED_ICON}" alt="" width="14" height="14" /> Verified`;
    top.appendChild(verified);
  }

  meta.className = 'news-card__meta';
  meta.textContent = `${source} · ${timeAgo}`;

  footer.className = 'news-card__footer';
  const readSpan = document.createElement('span');
  readSpan.className = 'news-card__read-time';
  readSpan.textContent = readTime;

  const actions = document.createElement('div');
  actions.className = 'news-card__actions';
  actions.appendChild(readSpan);
  actions.appendChild(createBookmarkButton(article));
  footer.appendChild(actions);

  card.addEventListener('click', () => openArticle(article));

  card.appendChild(image);
  content.appendChild(top);
  content.appendChild(meta);
  appendText(content, 'h2', article.title || 'Untitled');
  appendText(content, 'p', article.description || 'No description available.');
  content.appendChild(footer);
  card.appendChild(content);

  return card;
}

function buildMiniCard(article, delay = 0) {
  const card = document.createElement('article');
  card.className = 'mini-card fade-in';
  card.style.animationDelay = `${delay}ms`;

  const img = document.createElement('img');
  img.src = article.urlToImage || PLACEHOLDER_IMAGE;
  img.alt = '';
  img.loading = 'lazy';
  img.onerror = () => { img.onerror = null; img.src = PLACEHOLDER_IMAGE; };

  const body = document.createElement('div');
  body.className = 'mini-card__body';
  const h4 = document.createElement('h4');
  h4.textContent = article.title || 'Untitled';

  body.appendChild(h4);
  card.appendChild(img);
  card.appendChild(body);
  card.addEventListener('click', () => openArticle(article));

  return card;
}

export function clearContainer(containerId) {
  getContainer(containerId).replaceChildren();
}

export function showSkeletonLoader(containerId, count = 6) {
  clearContainer(containerId);
  const container = getContainer(containerId);
  const fragment = document.createDocumentFragment();

  for (let i = 0; i < count; i += 1) {
    const card = document.createElement('div');
    card.className = 'skeleton-card';
    card.innerHTML = `
      <div class="skeleton skeleton--image"></div>
      <div class="skeleton skeleton--line"></div>
      <div class="skeleton skeleton--line skeleton--short"></div>
      <div class="skeleton skeleton--line skeleton--medium"></div>
    `;
    fragment.appendChild(card);
  }

  container.appendChild(fragment);
}

export function hideLoading(containerId) {
  const container = getContainer(containerId);
  container.querySelectorAll('.skeleton-card').forEach((el) => el.remove());
}

export function renderHero(article, sideArticles = []) {
  const section = document.getElementById('hero-section');
  if (!section) return;

  section.replaceChildren();
  if (!article) return;

  const grid = document.createElement('div');
  grid.className = sideArticles.length
    ? 'hero-layout fade-in'
    : 'hero-layout hero-layout--solo fade-in';

  const main = document.createElement('article');
  main.className = 'hero-card';

  const imageWrap = document.createElement('div');
  imageWrap.className = 'hero-card__media';

  const image = document.createElement('img');
  image.className = 'hero-card__image';
  image.src = article.urlToImage || PLACEHOLDER_IMAGE;
  image.alt = article.title || 'Top story';
  image.loading = 'eager';
  image.onerror = () => { image.onerror = null; image.src = PLACEHOLDER_IMAGE; };

  const overlay = document.createElement('div');
  overlay.className = 'hero-card__shade';

  imageWrap.appendChild(image);
  imageWrap.appendChild(overlay);

  const body = document.createElement('div');
  body.className = 'hero-card__body';

  const topRow = document.createElement('div');
  topRow.className = 'hero-card__top';

  const badge = document.createElement('span');
  badge.className = 'hero-card__badge';
  badge.textContent = 'LIVE';

  const tag = document.createElement('span');
  tag.className = 'hero-card__tag';
  tag.textContent = 'Top Story';

  topRow.appendChild(badge);
  topRow.appendChild(tag);

  const meta = document.createElement('p');
  meta.className = 'hero-card__meta';
  const source = article.source?.name || 'Source';
  meta.textContent = `${source} · ${formatTimeAgo(article.publishedAt)}`;

  if (isTrustedSource(source)) {
    const verified = document.createElement('span');
    verified.className = 'hero-card__verified';
    verified.innerHTML = `<img src="${VERIFIED_ICON}" alt="" width="14" height="14" /> Verified`;
    meta.appendChild(verified);
  }

  const title = document.createElement('h2');
  title.textContent = article.title || 'Untitled';

  const desc = document.createElement('p');
  desc.className = 'hero-card__desc';
  desc.textContent = article.description || '';

  const footer = document.createElement('div');
  footer.className = 'hero-card__footer';

  const readTime = document.createElement('span');
  readTime.className = 'hero-card__read';
  readTime.textContent = getReadingTime(`${article.title} ${article.description}`);

  const cta = document.createElement('span');
  cta.className = 'hero-card__cta';
  cta.textContent = 'Read Full Story →';

  footer.appendChild(readTime);
  footer.appendChild(cta);

  body.appendChild(topRow);
  body.appendChild(meta);
  body.appendChild(title);
  if (article.description) body.appendChild(desc);
  body.appendChild(footer);

  main.appendChild(imageWrap);
  main.appendChild(body);
  main.addEventListener('click', () => openArticle(article));

  grid.appendChild(main);

  if (sideArticles.length) {
    const sides = document.createElement('div');
    sides.className = 'hero-sides';

    sideArticles.forEach((side, i) => {
      const item = document.createElement('article');
      item.className = 'hero-side fade-in';
      item.style.animationDelay = `${(i + 1) * 100}ms`;

      const sideImg = document.createElement('img');
      sideImg.src = side.urlToImage || PLACEHOLDER_IMAGE;
      sideImg.alt = '';
      sideImg.loading = 'lazy';
      sideImg.onerror = () => { sideImg.onerror = null; sideImg.src = PLACEHOLDER_IMAGE; };

      const sideBody = document.createElement('div');
      sideBody.className = 'hero-side__body';

      const sideMeta = document.createElement('span');
      sideMeta.className = 'hero-side__meta';
      sideMeta.textContent = `${side.source?.name || 'News'} · ${formatTimeAgo(side.publishedAt)}`;

      const sideTitle = document.createElement('h3');
      sideTitle.textContent = side.title || 'Untitled';

      sideBody.appendChild(sideMeta);
      sideBody.appendChild(sideTitle);
      item.appendChild(sideImg);
      item.appendChild(sideBody);
      item.addEventListener('click', () => openArticle(side));
      sides.appendChild(item);
    });

    grid.appendChild(sides);
  }

  section.appendChild(grid);
}

export function renderTrending(articles) {
  const container = document.getElementById('trending-container');
  if (!container) return;

  container.replaceChildren();

  const items = articles.slice(0, 8);
  if (!items.length) return;

  const track = document.createElement('div');
  track.className = 'trending-track';

  const buildSet = () => {
    const set = document.createElement('div');
    set.className = 'trending-set';

    items.forEach((article, i) => {
      const card = document.createElement('article');
      card.className = 'trending-card fade-in';
      card.style.animationDelay = `${i * 80}ms`;

      const img = document.createElement('img');
      img.src = article.urlToImage || PLACEHOLDER_IMAGE;
      img.alt = '';
      img.loading = 'lazy';
      img.onerror = () => { img.onerror = null; img.src = PLACEHOLDER_IMAGE; };

      const text = document.createElement('span');
      text.textContent = article.title || 'Trending';

      card.appendChild(img);
      card.appendChild(text);
      card.addEventListener('click', () => openArticle(article));
      set.appendChild(card);
    });

    return set;
  };

  track.appendChild(buildSet());
  track.appendChild(buildSet());
  container.appendChild(track);
}

export function renderTicker(articles) {
  const container = document.getElementById('ticker-content');
  if (!container) return;

  const headlines = articles.slice(0, 10).map((a) => a.title).filter(Boolean);
  if (!headlines.length) {
    container.textContent = 'Breaking: Live global news updates loading...';
    container.style.animationDuration = '28s';
    return;
  }

  const text = headlines.join('   ◆   ');
  container.textContent = `${text}   ◆   ${text}`;

  const duration = Math.max(24, Math.min(42, headlines.join('').length / 14));
  container.style.animationDuration = `${duration}s`;
}

export function renderArticles(articles, containerId, { skipCount = 0, category = 'General', color = 'default' } = {}) {
  clearContainer(containerId);
  const container = getContainer(containerId);
  const fragment = document.createDocumentFragment();
  const list = articles.slice(skipCount);

  list.forEach((article, i) => {
    fragment.appendChild(buildCard(article, { category, color, delay: i * 60 }));
  });

  container.appendChild(fragment);
}

export function renderBookmarks(articles, containerId) {
  clearContainer(containerId);
  const container = getContainer(containerId);

  if (!articles.length) {
    const empty = document.createElement('div');
    empty.className = 'empty-state fade-in';
    empty.innerHTML = '<strong>No saved articles</strong><p>Bookmark stories to read them later.</p>';
    container.appendChild(empty);
    return;
  }

  const fragment = document.createDocumentFragment();
  articles.forEach((article, i) => {
    fragment.appendChild(buildCard(article, { category: 'Saved', color: 'default', delay: i * 60 }));
  });
  container.appendChild(fragment);
}

export function renderCategorySections(sectionsData) {
  const container = document.getElementById('category-sections');
  if (!container) return;

  container.replaceChildren();

  sectionsData.forEach(({ label, color, articles, onMore }) => {
    if (!articles?.length) return;

    const section = document.createElement('div');
    section.className = 'category-section fade-in';

    const header = document.createElement('div');
    header.className = 'category-section__header';

    const h3 = document.createElement('h3');
    h3.innerHTML = `<span class="chip chip--${color}">${label}</span>`;

    const more = document.createElement('button');
    more.type = 'button';
    more.className = 'category-section__more';
    more.textContent = 'View all →';
    more.addEventListener('click', onMore);

    header.appendChild(h3);
    header.appendChild(more);

    const grid = document.createElement('div');
    grid.className = 'category-section__grid';
    articles.slice(0, 3).forEach((article, i) => {
      grid.appendChild(buildMiniCard(article, i * 50));
    });

    section.appendChild(header);
    section.appendChild(grid);
    container.appendChild(section);
  });
}

export function renderArticleDetail(article) {
  const container = document.getElementById('article-content');
  const loading = document.getElementById('article-loading');
  if (!container) return;

  loading?.setAttribute('hidden', '');
  container.hidden = false;
  container.replaceChildren();
  container.className = 'article-detail fade-in';

  const hero = document.createElement('div');
  hero.className = 'article-detail__hero';
  const img = document.createElement('img');
  img.src = article.urlToImage || PLACEHOLDER_IMAGE;
  img.alt = article.title || '';
  img.onerror = () => { img.onerror = null; img.src = PLACEHOLDER_IMAGE; };
  hero.appendChild(img);

  const chip = document.createElement('span');
  chip.className = 'article-detail__chip chip--tech';
  chip.textContent = article.source?.name || 'News';

  const title = document.createElement('h1');
  title.textContent = article.title || 'Untitled';

  const meta = document.createElement('p');
  meta.className = 'article-detail__meta';
  const author = article.author ? `${article.author} · ` : '';
  meta.textContent = `${author}${formatDate(article.publishedAt)} · ${getReadingTime(`${article.title} ${article.description}`)}`;

  if (isTrustedSource(article.source?.name)) {
    const verified = document.createElement('span');
    verified.className = 'article-detail__verified';
    verified.innerHTML = `<img src="${VERIFIED_ICON}" alt="" width="16" height="16" /> Verified Source`;
    meta.appendChild(verified);
  }

  const body = document.createElement('div');
  body.className = 'article-detail__body';
  body.textContent = article.description || article.content || 'No content available.';

  const actions = document.createElement('div');
  actions.className = 'article-detail__actions';

  const readBtn = document.createElement('a');
  readBtn.className = 'article-detail__read-btn';
  readBtn.href = article.url || '#';
  readBtn.target = '_blank';
  readBtn.rel = 'noopener noreferrer';
  readBtn.textContent = 'Read on Source Site →';

  const bookmarkBtn = createBookmarkButton(article);
  bookmarkBtn.className = 'share-btn';

  const copyBtn = document.createElement('button');
  copyBtn.type = 'button';
  copyBtn.className = 'share-btn';
  copyBtn.textContent = 'Copy Link';
  copyBtn.addEventListener('click', () => {
    navigator.clipboard?.writeText(article.url || window.location.href);
    copyBtn.textContent = 'Copied!';
    setTimeout(() => { copyBtn.textContent = 'Copy Link'; }, 2000);
  });

  const waBtn = document.createElement('a');
  waBtn.className = 'share-btn';
  waBtn.href = `https://wa.me/?text=${encodeURIComponent(`${article.title} ${article.url}`)}`;
  waBtn.target = '_blank';
  waBtn.rel = 'noopener noreferrer';
  waBtn.textContent = 'WhatsApp';

  const twBtn = document.createElement('a');
  twBtn.className = 'share-btn';
  twBtn.href = `https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title || '')}&url=${encodeURIComponent(article.url || '')}`;
  twBtn.target = '_blank';
  twBtn.rel = 'noopener noreferrer';
  twBtn.textContent = 'Twitter';

  actions.appendChild(readBtn);
  actions.appendChild(bookmarkBtn);
  actions.appendChild(copyBtn);
  actions.appendChild(waBtn);
  actions.appendChild(twBtn);

  container.appendChild(hero);
  container.appendChild(chip);
  container.appendChild(title);
  container.appendChild(meta);
  container.appendChild(body);
  container.appendChild(actions);
}

export function renderError(message, containerId) {
  clearContainer(containerId);
  const container = getContainer(containerId);
  const wrapper = document.createElement('div');
  const retryButton = document.createElement('button');

  wrapper.className = 'news-error fade-in';
  wrapper.setAttribute('role', 'alert');
  appendText(wrapper, 'strong', 'Something went wrong');
  appendText(wrapper, 'p', message || 'Unable to load news right now.');

  retryButton.className = 'news-error__retry';
  retryButton.type = 'button';
  retryButton.textContent = 'Retry';
  retryButton.addEventListener('click', () => window.location.reload());

  wrapper.appendChild(retryButton);
  container.appendChild(wrapper);
}

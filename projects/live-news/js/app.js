import { fetchBySearch, fetchTopHeadlines } from './api.js';
import { HOME_SECTIONS, MAIN_NAV, SIDEBAR_DROPDOWNS, TRENDING_TOPICS, getAllNavItems } from './categories.js';
import {
  addRecentSearch,
  getBookmarks,
  getRecentSearches,
  getState,
  getTheme,
  initTheme,
  setState,
  setTheme,
} from './state.js';
import {
  clearContainer,
  hideLoading,
  renderArticles,
  renderBookmarks,
  renderCategorySections,
  renderError,
  renderHero,
  renderTicker,
  renderTrending,
  showSkeletonLoader,
} from './render.js';

const ARTICLES_CONTAINER_ID = 'articles-container';
const ERROR_CONTAINER_ID = 'error-container';

let newsLoadInFlight = false;
let categorySectionsLoaded = false;

function findNavItem(navId) {
  return getAllNavItems().find((entry) => entry.id === navId) || null;
}

function isHomeView() {
  const { currentNavId, searchQuery, viewMode } = getState();
  return viewMode === 'feed' && !searchQuery && currentNavId === 'home';
}

function getFeedTitle() {
  const { currentNavId, searchQuery, viewMode } = getState();
  if (viewMode === 'bookmarks') return 'Saved Articles';
  if (viewMode === 'settings') return 'Settings';
  if (searchQuery) return `Results for "${searchQuery}"`;
  const item = findNavItem(currentNavId);
  return item ? item.label : 'Latest News';
}

function getActiveColor() {
  const item = findNavItem(getState().currentNavId);
  return item?.color || 'default';
}

function getActiveCategory() {
  const item = findNavItem(getState().currentNavId);
  return item?.label || 'General';
}

async function getNewsForCurrentState() {
  const { currentCategory, currentCountry, currentPage, searchQuery, viewMode } = getState();

  if (viewMode === 'bookmarks') {
    return { articles: getBookmarks(), totalResults: getBookmarks().length };
  }

  const trimmedQuery = searchQuery.trim();
  if (trimmedQuery) return fetchBySearch(trimmedQuery, currentPage);

  return fetchTopHeadlines({
    category: currentCategory && currentCategory !== 'general' ? currentCategory : undefined,
    country: currentCountry || undefined,
    page: currentPage,
  });
}

function applyNavItem(item) {
  if (!item) return;

  if (item.type === 'bookmarks') {
    setState({
      viewMode: 'bookmarks',
      searchQuery: '',
      currentCategory: '',
      currentCountry: '',
      currentPage: 1,
      currentNavId: item.id,
    });
    return;
  }

  if (item.type === 'settings') {
    setState({
      viewMode: 'settings',
      searchQuery: '',
      currentPage: 1,
      currentNavId: item.id,
    });
    return;
  }

  setState({
    viewMode: 'feed',
    currentNavId: item.id,
    currentPage: 1,
    searchQuery: item.type === 'search' ? item.value : '',
    currentCategory: item.type === 'category' ? item.value : '',
    currentCountry: item.type === 'country' ? item.value : '',
  });
}

function isSidebarItemActive(item, { currentNavId, currentCategory, currentCountry, searchQuery, viewMode }) {
  if (!item) return false;
  if (item.id === currentNavId) return true;
  if (viewMode !== 'feed' || !item.id?.startsWith('cat-')) return false;
  if (item.type === 'category') return item.value === currentCategory && !currentCountry && !searchQuery;
  if (item.type === 'country') return item.value === currentCountry && !searchQuery;
  if (item.type === 'search') return searchQuery === item.value;
  return false;
}

function updateActiveNav() {
  const state = getState();

  document.querySelectorAll('[data-nav-id]').forEach((el) => {
    const item = findNavItem(el.dataset.navId);
    const isActive = isSidebarItemActive(item, state);
    el.classList.toggle('active', isActive);
  });

  SIDEBAR_DROPDOWNS.forEach((section) => {
    const hasActive = section.items.some((item) => isSidebarItemActive(item, state));
    const dropdown = document.querySelector(`[data-dropdown-id="${section.id}"]`);
    if (hasActive && dropdown) {
      dropdown.classList.add('sidebar__dropdown--open');
      dropdown.querySelector('.sidebar__dropdown-btn')?.setAttribute('aria-expanded', 'true');
    }
  });
}

function updateFeedTitle() {
  const title = document.getElementById('feed-title');
  if (title) title.textContent = getFeedTitle();
}

function toggleViewPanels() {
  const { viewMode, searchQuery, currentNavId } = getState();
  const homeFeed = document.getElementById('home-feed');
  const settingsPanel = document.getElementById('settings-panel');
  const categorySections = document.getElementById('category-sections');
  const showHomeSections = viewMode === 'feed' && !searchQuery && currentNavId === 'home';

  if (viewMode === 'settings') {
    homeFeed?.setAttribute('hidden', '');
    settingsPanel?.removeAttribute('hidden');
  } else {
    homeFeed?.removeAttribute('hidden');
    settingsPanel?.setAttribute('hidden', '');
  }

  document.getElementById('ticker')?.toggleAttribute('hidden', !showHomeSections);
  document.getElementById('headlines-section')?.toggleAttribute('hidden', !showHomeSections);
  document.getElementById('trending-section')?.toggleAttribute('hidden', !showHomeSections);

  if (showHomeSections) {
    categorySections?.removeAttribute('hidden');
  } else {
    categorySections?.setAttribute('hidden', '');
  }
}

function createSidebarLink(item) {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'sidebar__link';
  btn.dataset.navId = item.id;
  btn.textContent = item.label;
  btn.addEventListener('click', () => navigateTo(item.id));
  return btn;
}

function buildSidebar() {
  const nav = document.getElementById('sidebar-nav');
  if (!nav) return;

  const main = document.createElement('div');
  main.className = 'sidebar__main';
  MAIN_NAV.forEach((item) => main.appendChild(createSidebarLink(item)));
  nav.appendChild(main);

  SIDEBAR_DROPDOWNS.forEach((section) => {
    const dropdown = document.createElement('div');
    dropdown.className = 'sidebar__dropdown';
    dropdown.dataset.dropdownId = section.id;

    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'sidebar__dropdown-btn';
    toggle.setAttribute('aria-expanded', 'false');

    const label = document.createElement('span');
    label.textContent = section.label;

    const chevron = document.createElement('span');
    chevron.className = 'sidebar__chevron';
    chevron.setAttribute('aria-hidden', 'true');
    chevron.textContent = '▾';

    toggle.appendChild(label);
    toggle.appendChild(chevron);

    const panel = document.createElement('div');
    panel.className = 'sidebar__dropdown-panel';
    if (section.id === 'categories') {
      panel.classList.add('sidebar__dropdown-panel--scroll');
    }
    section.items.forEach((item) => panel.appendChild(createSidebarLink(item)));

    toggle.addEventListener('click', () => {
      const willOpen = !dropdown.classList.contains('sidebar__dropdown--open');

      document.querySelectorAll('.sidebar__dropdown').forEach((el) => {
        el.classList.remove('sidebar__dropdown--open');
        el.querySelector('.sidebar__dropdown-btn')?.setAttribute('aria-expanded', 'false');
      });

      if (willOpen) {
        dropdown.classList.add('sidebar__dropdown--open');
        toggle.setAttribute('aria-expanded', 'true');
      }
    });

    dropdown.appendChild(toggle);
    dropdown.appendChild(panel);
    nav.appendChild(dropdown);
  });
}

function toggleSidebar(open) {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  const toggle = document.getElementById('menu-toggle');

  setState({ sidebarOpen: open });
  sidebar?.classList.toggle('sidebar--open', open);
  overlay?.toggleAttribute('hidden', !open);
  toggle?.setAttribute('aria-expanded', String(open));
  document.body.classList.toggle('sidebar-open', open);
}

function navigateTo(navId) {
  if (navId === 'search') {
    document.getElementById('search-input')?.focus();
    toggleSidebar(false);
    return;
  }

  if (navId === 'explore') {
    navigateTo('cat-world');
    return;
  }

  const item = findNavItem(navId);
  if (!item) return;

  applyNavItem(item);

  const input = document.getElementById('search-input');
  if (input) input.value = getState().searchQuery;

  toggleSidebar(false);
  updateActiveNav();
  updateFeedTitle();
  toggleViewPanels();
  loadNews();
}

function renderSearchSuggestions() {
  const box = document.getElementById('search-suggestions');
  if (!box) return;

  box.replaceChildren();

  const trendingLabel = document.createElement('span');
  trendingLabel.className = 'search-suggestions__label';
  trendingLabel.textContent = 'Trending Searches';
  box.appendChild(trendingLabel);

  TRENDING_TOPICS.forEach((topic) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'search-suggestions__item';
    btn.textContent = topic;
    btn.addEventListener('click', () => {
      runSearch(topic);
      box.hidden = true;
    });
    box.appendChild(btn);
  });

  const recent = getRecentSearches();
  if (recent.length) {
    const recentLabel = document.createElement('span');
    recentLabel.className = 'search-suggestions__label';
    recentLabel.textContent = 'Recent';
    box.appendChild(recentLabel);

    recent.forEach((query) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'search-suggestions__item';
      btn.textContent = query;
      btn.addEventListener('click', () => {
        runSearch(query);
        box.hidden = true;
      });
      box.appendChild(btn);
    });
  }
}

function runSearch(query) {
  const trimmed = query.trim();
  setState({
    viewMode: 'feed',
    currentNavId: 'home',
    currentCategory: '',
    currentCountry: '',
    searchQuery: trimmed,
    currentPage: 1,
  });

  const input = document.getElementById('search-input');
  if (input) input.value = trimmed;
  if (trimmed) addRecentSearch(trimmed);

  updateActiveNav();
  updateFeedTitle();
  toggleViewPanels();
  loadNews();
}

async function fetchSectionArticles(section) {
  return fetchTopHeadlines({
    category: section.type === 'category' && section.value !== 'general' ? section.value : undefined,
    country: section.country,
    page: 1,
  }).then((data) => data.articles || []);
}

async function loadCategorySections() {
  if (!isHomeView() || categorySectionsLoaded) return;
  categorySectionsLoaded = true;

  const results = [];

  try {
    for (const section of HOME_SECTIONS) {
      try {
        const articles = await fetchSectionArticles(section);
        results.push({
          label: section.label,
          color: section.color,
          articles,
          onMore: () => {
            setState({
              viewMode: 'feed',
              currentNavId: 'home',
              currentPage: 1,
              searchQuery: section.type === 'search' ? section.value : '',
              currentCategory: section.type === 'category' ? section.value : '',
              currentCountry: '',
            });
            updateActiveNav();
            updateFeedTitle();
            toggleViewPanels();
            loadNews();
            document.getElementById('articles-container')?.scrollIntoView({ behavior: 'smooth' });
          },
        });
      } catch (error) {
        if (error?.status === 429) break;
      }
    }

    if (results.length) {
      renderCategorySections(results);
    } else {
      categorySectionsLoaded = false;
    }
  } catch {
    categorySectionsLoaded = false;
  }
}

async function loadNews() {
  const { viewMode } = getState();

  if (viewMode === 'settings') {
    toggleViewPanels();
    return;
  }

  if (newsLoadInFlight) return;
  newsLoadInFlight = true;

  try {
    setState({ isLoading: true, error: null });
    clearContainer(ERROR_CONTAINER_ID);
    showSkeletonLoader(ARTICLES_CONTAINER_ID);

    const data = await getNewsForCurrentState();
    const articles = data.articles || [];

    setState({
      articles,
      totalResults: data.totalResults || articles.length,
    });

    toggleViewPanels();

    if (viewMode === 'bookmarks') {
      renderHero(null, []);
      renderBookmarks(articles, ARTICLES_CONTAINER_ID);
    } else {
      renderHero(articles[0] || null, articles.slice(1, 4));
      renderArticles(articles, ARTICLES_CONTAINER_ID, {
        skipCount: 4,
        category: getActiveCategory(),
        color: getActiveColor(),
      });
      if (!getState().searchQuery && isHomeView()) {
        renderTicker(articles);
        renderTrending(articles);
        loadCategorySections();
      }
    }
  } catch (error) {
    setState({ error: error.message });
    renderHero(null, []);
    renderError(error.message, ERROR_CONTAINER_ID);
    if (error?.status === 429) {
      categorySectionsLoaded = true;
    }
  } finally {
    setState({ isLoading: false });
    hideLoading(ARTICLES_CONTAINER_ID);
    newsLoadInFlight = false;
  }
}

function toggleThemeMode() {
  setTheme(getTheme() === 'dark' ? 'light' : 'dark');
}

function setupEventListeners() {
  document.getElementById('menu-toggle')?.addEventListener('click', () => {
    toggleSidebar(!getState().sidebarOpen);
  });

  document.getElementById('sidebar-overlay')?.addEventListener('click', () => {
    toggleSidebar(false);
  });

  document.getElementById('theme-toggle')?.addEventListener('click', toggleThemeMode);
  document.getElementById('settings-theme-toggle')?.addEventListener('click', toggleThemeMode);

  document.getElementById('search-form')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const input = document.getElementById('search-input');
    runSearch(input?.value || '');
    document.getElementById('search-suggestions')?.setAttribute('hidden', '');
  });

  const searchInput = document.getElementById('search-input');
  const suggestions = document.getElementById('search-suggestions');

  searchInput?.addEventListener('focus', () => {
    renderSearchSuggestions();
    suggestions?.removeAttribute('hidden');
  });

  document.addEventListener('click', (event) => {
    if (!(event.target instanceof Element)) return;
    if (!event.target.closest('#search-form')) {
      suggestions?.setAttribute('hidden', '');
    }
  });

  document.querySelectorAll('.bottom-nav__item, .footer__link').forEach((btn) => {
    btn.addEventListener('click', () => navigateTo(btn.dataset.navId));
  });
}

function initializeApp() {
  initTheme();
  buildSidebar();

  const input = document.getElementById('search-input');
  if (input) input.value = getState().searchQuery;

  updateActiveNav();
  updateFeedTitle();
  toggleViewPanels();
  setupEventListeners();
  loadNews();
}

initializeApp();

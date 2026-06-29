const initialState = {
  currentNavId: 'home',
  currentCategory: 'general',
  currentCountry: '',
  searchQuery: '',
  viewMode: 'feed',
  articles: [],
  isLoading: false,
  error: null,
  currentPage: 1,
  totalResults: 0,
  sidebarOpen: false,
};

const THEME_KEY = 'globalWireTheme';

function loadTheme() {
  if (typeof localStorage === 'undefined') return 'light';
  return localStorage.getItem(THEME_KEY) === 'dark' ? 'dark' : 'light';
}

export function getTheme() {
  return loadTheme();
}

export function setTheme(theme) {
  const value = theme === 'dark' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', value === 'dark' ? 'dark' : '');
  localStorage.setItem(THEME_KEY, value);
  return value;
}

export function initTheme() {
  setTheme(loadTheme());
}

const ARTICLE_KEY = 'globalWireArticle';

export function storeArticle(article) {
  sessionStorage.setItem(ARTICLE_KEY, JSON.stringify(article));
}

export function getStoredArticle() {
  try {
    const raw = sessionStorage.getItem(ARTICLE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

const PREFERENCES_KEY = 'globalWirePreferences';
const BOOKMARKS_KEY = 'globalWireBookmarks';
const RECENT_SEARCHES_KEY = 'globalWireRecentSearches';

function loadPreferences() {
  if (typeof localStorage === 'undefined') {
    return {};
  }

  try {
    const saved = localStorage.getItem(PREFERENCES_KEY);
    if (!saved) return {};

    const parsed = JSON.parse(saved);
    if (!parsed || typeof parsed !== 'object') return {};

    return {
      currentNavId: typeof parsed.currentNavId === 'string' ? parsed.currentNavId : initialState.currentNavId,
      currentCategory: typeof parsed.currentCategory === 'string' ? parsed.currentCategory : initialState.currentCategory,
      currentCountry: typeof parsed.currentCountry === 'string' ? parsed.currentCountry : initialState.currentCountry,
      searchQuery: typeof parsed.searchQuery === 'string' ? parsed.searchQuery : initialState.searchQuery,
    };
  } catch {
    return {};
  }
}

function savePreferences(state) {
  if (typeof localStorage === 'undefined') return;

  try {
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify({
      currentNavId: state.currentNavId,
      currentCategory: state.currentCategory,
      currentCountry: state.currentCountry,
      searchQuery: state.searchQuery,
    }));
  } catch {
    // ignore
  }
}

export function getBookmarks() {
  if (typeof localStorage === 'undefined') return [];

  try {
    const saved = localStorage.getItem(BOOKMARKS_KEY);
    if (!saved) return [];
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveBookmark(article) {
  const bookmarks = getBookmarks();
  const exists = bookmarks.some((item) => item.url === article.url);
  if (exists) return bookmarks;

  const updated = [article, ...bookmarks].slice(0, 50);
  localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(updated));
  return updated;
}

export function removeBookmark(url) {
  const updated = getBookmarks().filter((item) => item.url !== url);
  localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(updated));
  return updated;
}

export function isBookmarked(url) {
  return getBookmarks().some((item) => item.url === url);
}

export function getRecentSearches() {
  if (typeof localStorage === 'undefined') return [];

  try {
    const saved = localStorage.getItem(RECENT_SEARCHES_KEY);
    if (!saved) return [];
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function addRecentSearch(query) {
  const trimmed = query.trim();
  if (!trimmed) return getRecentSearches();

  const updated = [trimmed, ...getRecentSearches().filter((q) => q !== trimmed)].slice(0, 6);
  localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  return updated;
}

let state = {
  ...initialState,
  ...loadPreferences(),
};

export function getState() {
  return {
    ...state,
    articles: [...state.articles],
  };
}

export function setState(partial) {
  state = { ...state, ...partial };

  if ('currentNavId' in partial || 'currentCategory' in partial || 'currentCountry' in partial || 'searchQuery' in partial) {
    savePreferences(state);
  }

  return getState();
}

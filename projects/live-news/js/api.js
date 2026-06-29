const NEWS_API = 'https://newsapi.org/v2';
const PROXY = '/api/news';
const CACHE_MS = 30 * 60 * 1000;
const cache = new Map();

export class NewsAPIError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'NewsAPIError';
    this.status = status;
  }
}

function isLocal() {
  return location.hostname === 'localhost' || location.hostname === '127.0.0.1';
}

async function requestNews(endpoint, params = {}) {
  const query = { pageSize: 20, ...params };
  const cacheKey = `${endpoint}:${JSON.stringify(query)}`;

  const saved = cache.get(cacheKey);
  if (saved && Date.now() - saved.time < CACHE_MS) {
    return saved.data;
  }

  let url;
  if (isLocal()) {
    const { API_KEY } = await import('./config.js');
    const direct = new URL(`${NEWS_API}/${endpoint}`);
    direct.searchParams.set('apiKey', API_KEY);
    Object.entries(query).forEach(([key, value]) => {
      if (value) direct.searchParams.set(key, value);
    });
    url = direct.toString();
  } else {
    const proxy = new URL(PROXY, location.origin);
    proxy.searchParams.set('endpoint', endpoint);
    Object.entries(query).forEach(([key, value]) => {
      if (value) proxy.searchParams.set(key, value);
    });
    url = proxy.toString();
  }

  const response = await fetch(url);
  const data = await response.json();

  if (!response.ok) {
    throw new NewsAPIError(data?.message || 'Could not load news', response.status);
  }

  cache.set(cacheKey, { time: Date.now(), data });
  return data;
}

export function fetchTopHeadlines({ category, country, page } = {}) {
  return requestNews('top-headlines', {
    country: country || 'us',
    category: category && category !== 'general' ? category : undefined,
    page,
  });
}

export function fetchBySearch(query, page = 1) {
  return requestNews('everything', {
    q: query,
    sortBy: 'publishedAt',
    page,
  });
}

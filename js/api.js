import { API_KEY } from './config.js';

const BASE_URL = 'https://newsapi.org/v2';
const DEFAULT_COUNTRY = 'us';
const DEFAULT_PAGE_SIZE = 20;
const CACHE_TTL_MS = 60 * 60 * 1000;
const STALE_CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const MIN_REQUEST_GAP_MS = 800;
const RATE_LIMIT_COOLDOWN_MS = 5 * 60 * 1000;
const CACHE_PREFIX = 'globalWireNewsCache:';

const memoryCache = new Map();
const inflightRequests = new Map();
let requestChain = Promise.resolve();
let lastRequestAt = 0;
let rateLimitedUntil = 0;

export class NewsAPIError extends Error {
  constructor(message, { status, originalError, fromCache = false } = {}) {
    super(message);
    this.name = 'NewsAPIError';
    this.message = message;
    this.status = status;
    this.originalError = originalError;
    this.fromCache = fromCache;
  }
}

function buildCacheKey(endpoint, params) {
  const sorted = Object.keys(params).sort().map((key) => `${key}=${params[key]}`).join('&');
  return `${endpoint}?${sorted}`;
}

function getCacheEntry(cacheKey) {
  const cached = memoryCache.get(cacheKey);
  if (cached) return cached;

  if (typeof sessionStorage === 'undefined') return null;

  try {
    const raw = sessionStorage.getItem(`${CACHE_PREFIX}${cacheKey}`);
    if (!raw) return null;

    const entry = JSON.parse(raw);
    memoryCache.set(cacheKey, entry);
    return entry;
  } catch {
    return null;
  }
}

function readCache(cacheKey) {
  const entry = getCacheEntry(cacheKey);
  if (!entry) return null;
  if (Date.now() - entry.time > CACHE_TTL_MS) return null;
  return entry.data;
}

function readStaleCache(cacheKey) {
  const entry = getCacheEntry(cacheKey);
  if (!entry) return null;
  if (Date.now() - entry.time > STALE_CACHE_TTL_MS) return null;
  return entry.data;
}

function writeCache(cacheKey, data) {
  const entry = { time: Date.now(), data };
  memoryCache.set(cacheKey, entry);

  if (typeof sessionStorage === 'undefined') return;

  try {
    sessionStorage.setItem(`${CACHE_PREFIX}${cacheKey}`, JSON.stringify(entry));
  } catch {
    // Storage full or unavailable — memory cache still works.
  }
}

function wait(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function isRateLimited() {
  return Date.now() < rateLimitedUntil;
}

function markRateLimited() {
  rateLimitedUntil = Date.now() + RATE_LIMIT_COOLDOWN_MS;
}

async function throttle() {
  const elapsed = Date.now() - lastRequestAt;
  if (elapsed < MIN_REQUEST_GAP_MS) {
    await wait(MIN_REQUEST_GAP_MS - elapsed);
  }
  lastRequestAt = Date.now();
}

function queueRequest(task) {
  const run = () => task();
  const result = requestChain.then(run, run);
  requestChain = result.catch(() => {});
  return result;
}

async function fetchFromNetwork(url) {
  await throttle();

  let response;

  try {
    response = await fetch(url);
  } catch (error) {
    throw new NewsAPIError(
      'We could not reach the news service. Please check your connection and try again.',
      { originalError: error },
    );
  }

  let data = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    if (response.status === 429) {
      markRateLimited();
      throw new NewsAPIError(
        'News API rate limit reached. Showing cached stories when available — please wait a few minutes.',
        { status: response.status },
      );
    }

    throw new NewsAPIError(
      data?.message || 'We could not load the latest news right now. Please try again later.',
      { status: response.status },
    );
  }

  return data;
}

async function requestNews(endpoint, params = {}) {
  const requestParams = {
    pageSize: DEFAULT_PAGE_SIZE,
    ...params,
  };

  const cacheKey = buildCacheKey(endpoint, requestParams);
  const cached = readCache(cacheKey);
  if (cached) return cached;

  if (inflightRequests.has(cacheKey)) {
    return inflightRequests.get(cacheKey);
  }

  if (isRateLimited()) {
    const stale = readStaleCache(cacheKey);
    if (stale) return stale;
    throw new NewsAPIError(
      'News API is temporarily rate-limited. Please wait a few minutes before trying again.',
      { status: 429 },
    );
  }

  const url = new URL(`${BASE_URL}/${endpoint}`);
  Object.entries({
    apiKey: API_KEY,
    ...requestParams,
  }).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, value);
    }
  });

  const requestPromise = queueRequest(async () => {
    try {
      const data = await fetchFromNetwork(url.toString());
      writeCache(cacheKey, data);
      return data;
    } catch (error) {
      const stale = readStaleCache(cacheKey);
      if (stale) return stale;
      throw error;
    }
  }).finally(() => {
    inflightRequests.delete(cacheKey);
  });

  inflightRequests.set(cacheKey, requestPromise);
  return requestPromise;
}

export async function fetchTopHeadlines({ category, country, page } = {}) {
  return requestNews('top-headlines', {
    country: country || DEFAULT_COUNTRY,
    category: category && category !== 'general' ? category : undefined,
    page,
  });
}

export async function fetchBySearch(query, page = 1) {
  return requestNews('everything', {
    q: query,
    sortBy: 'publishedAt',
    page,
  });
}

export async function fetchNews() {
  return fetchTopHeadlines({ page: 1 });
}

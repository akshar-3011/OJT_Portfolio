export const MAIN_NAV = [
  { id: 'home', label: 'Home', type: 'category', value: 'general' },
  { id: 'trending', label: 'Trending', type: 'category', value: 'technology' },
  { id: 'bookmarks', label: 'Bookmarks', type: 'bookmarks' },
];

const CATEGORIES = [
  { label: 'All', type: 'category', value: 'general', color: 'default' },
  { label: 'Politics', type: 'category', value: 'general', color: 'politics' },
  { label: 'Finance', type: 'category', value: 'business', color: 'finance' },
  { label: 'Tech', type: 'category', value: 'technology', color: 'tech' },
  { label: 'Sports', type: 'category', value: 'sports', color: 'sports' },
  { label: 'Health', type: 'category', value: 'health', color: 'health' },
  { label: 'Science', type: 'category', value: 'science', color: 'science' },
  { label: 'Entertainment', type: 'category', value: 'entertainment', color: 'entertainment' },
  { label: 'World', type: 'country', value: 'us', color: 'world' },
  { label: 'India', type: 'country', value: 'in', color: 'world' },
  { label: 'USA', type: 'country', value: 'us', color: 'world' },
  { label: 'UK', type: 'country', value: 'gb', color: 'world' },
  { label: 'AI', type: 'category', value: 'technology', color: 'tech' },
  { label: 'Startups', type: 'category', value: 'business', color: 'finance' },
  { label: 'Climate', type: 'category', value: 'science', color: 'health' },
  { label: 'Crypto', type: 'category', value: 'business', color: 'finance' },
];

function toNavItem(cat) {
  const id = `cat-${cat.label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
  return { id, label: cat.label, type: cat.type, value: cat.value, color: cat.color };
}

export const SIDEBAR_DROPDOWNS = [
  {
    id: 'categories',
    label: 'Categories',
    items: CATEGORIES.map(toNavItem),
  },
  {
    id: 'explore',
    label: 'Explore',
    items: [{ id: 'settings', label: 'Settings', type: 'settings' }],
  },
];

export function getAllNavItems() {
  return [...MAIN_NAV, ...SIDEBAR_DROPDOWNS.flatMap((s) => s.items)];
}

export const HOME_SECTIONS = [
  { label: 'Business', type: 'category', value: 'business', color: 'finance' },
  { label: 'Technology', type: 'category', value: 'technology', color: 'tech' },
  { label: 'Sports', type: 'category', value: 'sports', color: 'sports' },
  { label: 'Entertainment', type: 'category', value: 'entertainment', color: 'entertainment' },
];

export const TRENDING_TOPICS = ['AI', 'Bitcoin', 'India', 'Tesla', 'Israel', 'NASA'];

export const TRUSTED_SOURCES = [
  'BBC', 'CNN', 'Reuters', 'The New York Times', 'Bloomberg', 'The Guardian',
];

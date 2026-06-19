export const AGENCY = {
  name: 'CodeWire',
  tagline: 'Studio',
  description: 'We build clean, fast web products — from live news platforms to full-stack college projects.',
  email: 'hello@codewire.dev',
};

export const PROJECTS = [
  {
    id: 'globalwire',
    name: 'GlobalWire',
    subtitle: 'Live-NEWZ',
    badge: 'Featured',
    type: 'Live News Platform',
    description:
      'Real-time global news app with breaking ticker, trending stories, bookmarks, dark mode, sidebar categories, and mobile navigation. Powered by News API with smart caching.',
    image: '../assets/logo.svg',
    tech: ['JavaScript', 'News API', 'HTML/CSS', 'localStorage', 'Responsive UI'],
    links: [
      { label: 'Open App', href: '../index.html', external: true },
      { label: 'Live Preview', href: '#globalwire', view: 'globalwire' },
    ],
    featured: true,
  },
];

export const TEAM = [
  {
    name: 'Your Name',
    role: 'Full Stack Developer',
    bio: 'Add your bio here — what you build, what you are learning, and what you care about.',
    avatar: './assets/avatar-placeholder.svg',
    skills: ['JavaScript', 'HTML/CSS', 'APIs', 'UI Design'],
    links: [
      { label: 'GitHub', href: 'https://github.com/', icon: 'github' },
      { label: 'LinkedIn', href: 'https://linkedin.com/', icon: 'linkedin' },
    ],
  },
  {
    name: 'Teammate Name',
    role: 'Frontend Developer',
    bio: 'Add teammate details in portfolio/js/data.js — easy to update without touching layout code.',
    avatar: './assets/avatar-placeholder.svg',
    skills: ['JavaScript', 'CSS', 'React', 'Figma'],
    links: [
      { label: 'GitHub', href: 'https://github.com/', icon: 'github' },
      { label: 'LinkedIn', href: 'https://linkedin.com/', icon: 'linkedin' },
    ],
  },
];

export const NAV = [
  { id: 'home', label: 'Overview', icon: 'grid' },
  { id: 'projects', label: 'Projects', icon: 'briefcase' },
  { id: 'team', label: 'Team', icon: 'users' },
  { id: 'globalwire', label: 'GlobalWire', icon: 'news' },
  { id: 'contact', label: 'Contact', icon: 'mail' },
];

export const PAGE_TITLES = {
  home: ['CodeWire', 'Studio.'],
  projects: ['Our', 'Projects.'],
  team: ['The', 'Team.'],
  globalwire: ['GlobalWire', 'Live-NEWZ.'],
  contact: ['Get in', 'Touch.'],
};

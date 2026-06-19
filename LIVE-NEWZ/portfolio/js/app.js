import { AGENCY, NAV, PAGE_TITLES, PROJECTS, TEAM } from './data.js';

const iconPaths = {
  grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  briefcase: '<path d="M8 7h8l2 3h10a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V12a2 2 0 0 1 2-2h2V7z"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
  users: '<circle cx="9" cy="8" r="3"/><circle cx="17" cy="10" r="2.5"/><path d="M3 19c0-3 2.5-5 6-5s6 2 6 5"/><path d="M14 19c0-2 1.5-3.5 4-3.5"/>',
  news: '<path d="M6 4h12a2 2 0 0 1 2 2v14l-4-3-4 3-4-3-4 3V6a2 2 0 0 1 2-2z"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
  github: '<path d="M12 2C6.5 2 2 6.6 2 12.2c0 4.5 2.9 8.3 6.9 9.6.5.1.7-.2.7-.5v-1.8c-2.8.6-3.4-1.2-3.4-1.2-.5-1.2-1.1-1.5-1.1-1.5-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.5 2.4 1.1 3 .8.1-.7.4-1.1.7-1.4-2.2-.3-4.6-1.1-4.6-5 0-1.1.4-2 1-2.7-.1-.3-.4-1.3.1-2.7 0 0 .8-.3 2.7 1 .8-.2 1.6-.3 2.4-.3s1.6.1 2.4.3c1.9-1.3 2.7-1 2.7-1 .5 1.4.2 2.4.1 2.7.6.7 1 1.6 1 2.7 0 3.9-2.4 4.7-4.6 5 .4.3.7 1 .7 2v3c0 .3.2.6.7.5A10 10 0 0 0 22 12.2C22 6.6 17.5 2 12 2z"/>',
  linkedin: '<path d="M4 4h4v16H4V4zm2 18a2 2 0 1 1 0-4 2 2 0 0 1 0 4zM9 8h4v2.2h.1c.6-1.1 2-2.2 4.1-2.2 4.4 0 5.2 2.9 5.2 6.7V20h-4v-5.2c0-1.2 0-2.8-1.7-2.8s-2 1.3-2 2.9V20H9V8z"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M2 12h2M20 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"/>',
  moon: '<path d="M21 14.5A8.5 8.5 0 0 1 9.5 3 7 7 0 1 0 21 14.5z"/>',
  external: '<path d="M14 3h7v7"/><path d="M10 14 21 3"/><path d="M21 14v7H3V3h7"/>',
};

function icon(name, size = 18) {
  const path = iconPaths[name] || iconPaths.grid;
  return `<svg class="icon" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${path}</svg>`;
}

function buildSidebar() {
  const nav = document.getElementById('sidebar-nav');
  nav.innerHTML = NAV.map((item) => `
    <a href="#${item.id}" class="sidebar-link" data-view="${item.id}">
      ${icon(item.icon, 20)}
      <span>${item.label}</span>
    </a>
  `).join('');
}

function projectCard(project) {
  const media = project.image
    ? `<img src="${project.image}" alt="" class="card-media">`
    : `<div class="card-media card-media--icon">${icon('briefcase', 28)}</div>`;

  const links = project.links.map((link) => {
    if (link.external) {
      return `<a href="${link.href}" class="btn btn--ghost" target="_blank" rel="noopener noreferrer">${icon('external', 16)}${link.label}</a>`;
    }
    return `<a href="${link.href}" class="btn btn--ghost">${link.label}</a>`;
  }).join('');

  return `
    <article class="card ${project.featured ? 'card--featured' : ''}">
      <div class="card-top">
        ${media}
        <div>
          <div class="card-badge">${project.badge || project.type}</div>
          <h3>${project.name}</h3>
          <p class="card-sub">${project.subtitle}</p>
        </div>
      </div>
      <p class="card-desc">${project.description}</p>
      <div class="pill-row">${project.tech.map((t) => `<span class="pill">${t}</span>`).join('')}</div>
      <div class="card-actions">${links}</div>
    </article>
  `;
}

function teamCard(member) {
  const links = member.links.map((link) => `
    <a href="${link.href}" class="btn btn--ghost" target="_blank" rel="noopener noreferrer">
      ${icon(link.icon, 16)}${link.label}
    </a>
  `).join('');

  return `
    <article class="card">
      <div class="card-top">
        <img src="${member.avatar}" alt="${member.name}" class="card-media card-media--avatar">
        <div>
          <h3>${member.name}</h3>
          <p class="card-sub">${member.role}</p>
        </div>
      </div>
      <p class="card-desc">${member.bio}</p>
      <div class="pill-row">${member.skills.map((s) => `<span class="pill">${s}</span>`).join('')}</div>
      <div class="card-actions">${links}</div>
    </article>
  `;
}

function renderContent() {
  document.getElementById('agency-name').textContent = AGENCY.name;
  document.getElementById('agency-tagline').textContent = AGENCY.tagline;
  document.getElementById('hero-desc').textContent = AGENCY.description;
  document.getElementById('projects-grid').innerHTML = PROJECTS.map(projectCard).join('');
  document.getElementById('team-grid').innerHTML = TEAM.map(teamCard).join('');
  document.getElementById('contact-email').textContent = AGENCY.email;
  document.getElementById('contact-email').href = `mailto:${AGENCY.email}`;
}

function setPage(view) {
  const viewId = PAGE_TITLES[view] ? view : 'home';

  document.querySelectorAll('.view').forEach((el) => {
    el.classList.toggle('view--active', el.id === `view-${viewId}`);
  });

  document.querySelectorAll('.sidebar-link').forEach((link) => {
    link.classList.toggle('active', link.dataset.view === viewId);
  });

  const [part1, part2] = PAGE_TITLES[viewId];
  document.getElementById('title-part-1').textContent = part1;
  document.getElementById('title-part-2').textContent = part2;

  if (window.innerWidth <= 768) {
    document.getElementById('sidebar').setAttribute('aria-expanded', 'false');
  }
}

function handleRoute() {
  const hash = window.location.hash.replace('#', '') || 'home';
  setPage(hash);
}

function setupTheme() {
  const body = document.body;
  const btn = document.getElementById('theme-toggle');
  const saved = localStorage.getItem('portfolioTheme');
  const isDark = saved !== 'light';

  body.classList.toggle('theme-dark', isDark);

  btn.addEventListener('click', () => {
    const nextDark = !body.classList.contains('theme-dark');
    body.classList.toggle('theme-dark', nextDark);
    localStorage.setItem('portfolioTheme', nextDark ? 'dark' : 'light');
  });
}

function setupSidebar() {
  const sidebar = document.getElementById('sidebar');
  document.getElementById('sidebar-open').addEventListener('click', () => {
    sidebar.setAttribute('aria-expanded', 'true');
  });
  document.getElementById('sidebar-close').addEventListener('click', () => {
    sidebar.setAttribute('aria-expanded', 'false');
  });
}

function setupContactForm() {
  const form = document.getElementById('contact-form');
  const success = document.getElementById('form-success');

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const name = form.querySelector('#name');
    const email = form.querySelector('#email');
    const message = form.querySelector('#message');
    let valid = true;

    [name, email, message].forEach((field) => {
      const group = field.closest('.field');
      const fieldValid = field.value.trim() && (field.type !== 'email' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value));
      group.classList.toggle('field--error', !fieldValid);
      if (!fieldValid) valid = false;
    });

    if (!valid) return;

    success.hidden = false;
    form.reset();
    setTimeout(() => {
      success.hidden = true;
    }, 3000);
  });
}

buildSidebar();
renderContent();
setupTheme();
setupSidebar();
setupContactForm();
handleRoute();
window.addEventListener('hashchange', handleRoute);

// GitHub Developer Explorer
// Fetches profile data and repos from the GitHub REST API.

// ---- Element references (querySelector) ----
var searchForm = document.querySelector("#searchForm");
var usernameInput = document.querySelector("#usernameInput");
var searchButton = document.querySelector("#searchButton");

var rateLimitText = document.querySelector("#rateLimitText");
var rateDot = document.querySelector("#rateDot");

var statusSection = document.querySelector("#statusSection");
var statusCard = document.querySelector("#statusCard");
var statusMessage = document.querySelector("#statusMessage");

var profileSection = document.querySelector("#profileSection");
var profileAvatar = document.querySelector("#profileAvatar");
var profileName = document.querySelector("#profileName");
var profileLogin = document.querySelector("#profileLogin");
var profileBio = document.querySelector("#profileBio");
var profileMeta = document.querySelector("#profileMeta");
var profileLink = document.querySelector("#profileLink");
var profileStats = document.querySelector("#profileStats");

var langSection = document.querySelector("#langSection");
var langTableBody = document.querySelector("#langTableBody");

var reposSection = document.querySelector("#reposSection");
var repoGrid = document.querySelector("#repoGrid");
var sortSelect = document.querySelector("#sortSelect");

// ---- App state (plain variables, kept simple) ----
var currentRepos = [];

// In-memory cache so re-searching the same username doesn't
// burn extra GitHub API requests. Keyed by lowercase username,
// each entry stores { user: ..., repos: ... }.
// This resets on page reload, which is fine — it's just to
// avoid wasting requests on repeat searches within one session.
var searchCache = {};

// A small fixed color set used for language swatches.
// (Plain object, accessed with bracket notation — both in syllabus.)
var LANGUAGE_COLORS = {
  "JavaScript": "#E0B65F",
  "TypeScript": "#5F9FE0",
  "Python": "#5FD98A",
  "HTML": "#E2675A",
  "CSS": "#B98EE0",
  "Java": "#E08F5F",
  "C++": "#5FC9D9",
  "C": "#8B919A",
  "Shell": "#7BE095",
  "Go": "#5FE0C9",
  "Ruby": "#E25F8C",
  "PHP": "#8E8EE0",
  "Other": "#5C616B"
};

function getLanguageColor(lang) {
  if (LANGUAGE_COLORS[lang]) {
    return LANGUAGE_COLORS[lang];
  }
  return LANGUAGE_COLORS["Other"];
}

// ---- Utility: clear all children from a container ----
function clearChildren(container) {
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }
}

// ---- Utility: format large numbers (1200 -> 1.2k) ----
function formatCount(num) {
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + "k";
  }
  return String(num);
}

// ---- Utility: format an ISO date string ----
function formatDate(isoString) {
  var dateObj = new Date(isoString);
  var year = dateObj.getFullYear();
  var month = dateObj.getMonth() + 1;
  var day = dateObj.getDate();
  if (month < 10) { month = "0" + month; }
  if (day < 10) { day = "0" + day; }
  return year + "-" + month + "-" + day;
}

// STATUS HELPERS
function showStatus(message, type) {
  statusSection.hidden = false;
  statusMessage.textContent = message;

  statusCard.classList.remove("loading", "error");
  if (type === "loading") {
    statusCard.classList.add("loading");
  } else if (type === "error") {
    statusCard.classList.add("error");
  }
}

function hideStatus() {
  statusSection.hidden = true;
}

function hideResults() {
  profileSection.hidden = true;
  langSection.hidden = true;
  reposSection.hidden = true;
}

// RATE LIMIT DISPLAY
// GitHub counts a request against your hourly limit the moment you make it.
// We read x-ratelimit-remaining and x-ratelimit-limit headers from fetched responses.
// /rate_limit is only called once on page load.
function updateRateLimitDisplay(response) {
  var remainingHeader = response.headers.get("x-ratelimit-remaining");
  var limitHeader = response.headers.get("x-ratelimit-limit");

  if (remainingHeader === null || limitHeader === null) {
    return;
  }

  var remaining = Number(remainingHeader);
  var limit = Number(limitHeader);

  rateDot.classList.remove("ok", "warn", "bad");

  if (remaining > 20) {
    rateDot.classList.add("ok");
  } else if (remaining > 0) {
    rateDot.classList.add("warn");
  } else {
    rateDot.classList.add("bad");
  }

  rateLimitText.textContent = remaining + " / " + limit + " requests remaining this hour";
}

// Used once on initial page load only, since at that point
// there is no previous GitHub response to read headers from.
async function checkRateLimitOnLoad() {
  try {
    var response = await fetch("https://api.github.com/rate_limit");

    if (!response.ok) {
      rateDot.classList.add("warn");
      rateLimitText.textContent = "rate limit status unavailable";
      return;
    }

    updateRateLimitDisplay(response);
  } catch (error) {
    rateDot.classList.add("warn");
    rateLimitText.textContent = "could not reach github api";
  }
}

// FETCH USER PROFILE
// GET https://api.github.com/users/{username}
async function fetchUserProfile(username) {
  var response = await fetch("https://api.github.com/users/" + username);

  // Read the rate limit straight off this response's headers —
  // no extra request needed.
  updateRateLimitDisplay(response);

  if (response.status === 404) {
    throw new Error("NOT_FOUND");
  }

  if (response.status === 403) {
    throw new Error("RATE_LIMITED");
  }

  if (!response.ok) {
    throw new Error("UNKNOWN");
  }

  var data = await response.json();
  return data;
}

// FETCH USER REPOS
// GET https://api.github.com/users/{username}/repos
async function fetchUserRepos(username) {
  var url = "https://api.github.com/users/" + username + "/repos?per_page=100&sort=updated";
  var response = await fetch(url);

  // Same idea as fetchUserProfile — reuse this response's
  // headers instead of firing a separate /rate_limit request.
  updateRateLimitDisplay(response);

  if (response.status === 403) {
    throw new Error("RATE_LIMITED");
  }

  if (!response.ok) {
    throw new Error("UNKNOWN");
  }

  var data = await response.json();
  return data;
}

// RENDER: PROFILE
function renderProfile(user) {
  profileAvatar.setAttribute("src", user.avatar_url);
  profileAvatar.setAttribute("alt", user.login + " avatar");

  profileName.textContent = user.name ? user.name : user.login;
  profileLogin.textContent = "@" + user.login;
  profileBio.textContent = user.bio ? user.bio : "No bio provided.";

  profileLink.setAttribute("href", user.html_url);

  // Meta row: location / company / blog, built with createElement + append
  clearChildren(profileMeta);

  if (user.location) {
    var locationSpan = document.createElement("span");
    locationSpan.textContent = "📍 " + user.location;
    profileMeta.append(locationSpan);
  }

  if (user.company) {
    var companySpan = document.createElement("span");
    companySpan.textContent = "🏢 " + user.company;
    profileMeta.append(companySpan);
  }

  if (user.blog) {
    var blogSpan = document.createElement("span");
    blogSpan.textContent = "🔗 " + user.blog;
    profileMeta.append(blogSpan);
  }

  // Stats column: followers / following / public repos
  clearChildren(profileStats);

  var statsData = [
    { label: "followers", value: user.followers },
    { label: "following", value: user.following },
    { label: "repos", value: user.public_repos }
  ];

  statsData.forEach(function (item) {
    var block = document.createElement("div");
    block.classList.add("stat-block");

    var valueEl = document.createElement("span");
    valueEl.classList.add("stat-value");
    valueEl.textContent = formatCount(item.value);

    var labelEl = document.createElement("span");
    labelEl.classList.add("stat-label");
    labelEl.textContent = item.label;

    block.append(valueEl);
    block.append(labelEl);
    profileStats.append(block);
  });

  profileSection.hidden = false;
}

// RENDER: LANGUAGE BREAKDOWN TABLE
// Uses reduce() to count, then map-like forEach to render.
function renderLanguageBreakdown(repos) {
  // Count repos per language using reduce()
  var counts = repos.reduce(function (acc, repo) {
    var lang = repo.language ? repo.language : "Other";
    if (acc[lang]) {
      acc[lang] = acc[lang] + 1;
    } else {
      acc[lang] = 1;
    }
    return acc;
  }, {});

  // Convert the counts object into an array of [language, count] pairs
  var langArray = Object.entries(counts);

  // Sort descending by count
  langArray.sort(function (a, b) {
    return b[1] - a[1];
  });

  var totalRepos = repos.length;

  clearChildren(langTableBody);

  if (langArray.length === 0) {
    var emptyRow = document.createElement("tr");
    var emptyCell = document.createElement("td");
    emptyCell.setAttribute("colspan", "3");
    emptyCell.classList.add("empty-note");
    emptyCell.textContent = "No public repositories to analyze.";
    emptyRow.append(emptyCell);
    langTableBody.append(emptyRow);
    langSection.hidden = false;
    return;
  }

  langArray.forEach(function (pair) {
    var langName = pair[0];
    var count = pair[1];
    var percent = totalRepos > 0 ? Math.round((count / totalRepos) * 100) : 0;
    var color = getLanguageColor(langName);

    var row = document.createElement("tr");

    // Language name cell with color swatch
    var nameCell = document.createElement("td");
    var nameWrap = document.createElement("span");
    nameWrap.classList.add("lang-name-cell");

    var swatch = document.createElement("span");
    swatch.classList.add("lang-swatch");
    swatch.style.setProperty("background", color);

    var nameText = document.createElement("span");
    nameText.textContent = langName;

    nameWrap.append(swatch);
    nameWrap.append(nameText);
    nameCell.append(nameWrap);

    // Repo count cell
    var countCell = document.createElement("td");
    countCell.textContent = String(count);

    // Share cell with mini bar + percentage
    var shareCell = document.createElement("td");

    var barTrack = document.createElement("span");
    barTrack.classList.add("lang-share-bar-track");

    var barFill = document.createElement("span");
    barFill.classList.add("lang-share-bar-fill");
    barFill.style.setProperty("width", percent + "%");
    barFill.style.setProperty("background", color);

    barTrack.append(barFill);

    var percentText = document.createTextNode(percent + "%");

    shareCell.append(barTrack);
    shareCell.append(percentText);

    row.append(nameCell);
    row.append(countCell);
    row.append(shareCell);

    langTableBody.append(row);
  });

  langSection.hidden = false;
}

// RENDER: REPO DIFFSTAT (signature element)
// A small two-segment bar that fakes a git diffstat
// line using stars vs forks as the two "segments".
function buildDiffstatBar(repo) {
  var wrap = document.createElement("div");
  wrap.classList.add("repo-diffstat");

  var label = document.createElement("span");
  label.classList.add("repo-diffstat-label");
  label.textContent = repo.language ? repo.language : "text";

  var barTrack = document.createElement("div");
  barTrack.classList.add("repo-diffstat-bar");

  var stars = repo.stargazers_count;
  var forks = repo.forks_count;
  var total = stars + forks;

  // Default to a fully "dim" bar if there is no activity at all
  var starPercent = 50;
  var forkPercent = 50;

  if (total > 0) {
    starPercent = Math.round((stars / total) * 100);
    forkPercent = 100 - starPercent;
  }

  var starSegment = document.createElement("span");
  starSegment.classList.add("repo-diffstat-segment");
  starSegment.style.setProperty("width", starPercent + "%");
  starSegment.style.setProperty("background", "#E0B65F");

  var forkSegment = document.createElement("span");
  forkSegment.classList.add("repo-diffstat-segment");
  forkSegment.style.setProperty("width", forkPercent + "%");
  forkSegment.style.setProperty("background", "#5C616B");

  barTrack.append(starSegment);
  barTrack.append(forkSegment);

  wrap.append(label);
  wrap.append(barTrack);

  return wrap;
}

// RENDER: REPO CARD
function buildRepoCard(repo) {
  var card = document.createElement("div");
  card.classList.add("repo-card");

  // top row: name + private tag
  var topRow = document.createElement("div");
  topRow.classList.add("repo-card-top");

  var nameLink = document.createElement("a");
  nameLink.classList.add("repo-name");
  nameLink.textContent = repo.name;
  nameLink.setAttribute("href", repo.html_url);
  nameLink.setAttribute("target", "_blank");
  nameLink.setAttribute("rel", "noopener");

  topRow.append(nameLink);

  if (repo.private) {
    var privateTag = document.createElement("span");
    privateTag.classList.add("repo-private-tag");
    privateTag.textContent = "private";
    topRow.append(privateTag);
  }

  // description
  var desc = document.createElement("p");
  desc.classList.add("repo-desc");
  desc.textContent = repo.description ? repo.description : "No description provided.";

  // stats row: stars + forks
  var statsRow = document.createElement("div");
  statsRow.classList.add("repo-stats-row");

  var starStat = document.createElement("span");
  starStat.classList.add("stat-star");
  starStat.textContent = "★ " + formatCount(repo.stargazers_count);

  var forkStat = document.createElement("span");
  forkStat.classList.add("stat-fork");
  forkStat.textContent = "⑂ " + formatCount(repo.forks_count);

  statsRow.append(starStat);
  statsRow.append(forkStat);

  // diffstat signature bar
  var diffstat = buildDiffstatBar(repo);

  // updated date
  var updated = document.createElement("p");
  updated.classList.add("repo-updated");
  updated.textContent = "updated " + formatDate(repo.updated_at);

  card.append(topRow);
  card.append(desc);
  card.append(statsRow);
  card.append(diffstat);
  card.append(updated);

  return card;
}

// RENDER: REPO GRID (respects current sort)
function renderRepoGrid() {
  var sortBy = sortSelect.value;
  var sorted = currentRepos.slice(); // copy so original order is preserved

  if (sortBy === "stars") {
    sorted.sort(function (a, b) {
      return b.stargazers_count - a.stargazers_count;
    });
  } else if (sortBy === "forks") {
    sorted.sort(function (a, b) {
      return b.forks_count - a.forks_count;
    });
  } else if (sortBy === "name") {
    sorted.sort(function (a, b) {
      var nameA = a.name.toLowerCase();
      var nameB = b.name.toLowerCase();
      if (nameA < nameB) { return -1; }
      if (nameA > nameB) { return 1; }
      return 0;
    });
  } else {
    // default: updated (most recent first)
    sorted.sort(function (a, b) {
      return new Date(b.updated_at) - new Date(a.updated_at);
    });
  }

  clearChildren(repoGrid);

  if (sorted.length === 0) {
    var emptyNote = document.createElement("p");
    emptyNote.classList.add("empty-note");
    emptyNote.textContent = "This user has no public repositories.";
    repoGrid.append(emptyNote);
    return;
  }

  sorted.forEach(function (repo) {
    var card = buildRepoCard(repo);
    repoGrid.append(card);
  });
}

// MAIN SEARCH HANDLER
async function handleSearch(username) {
  hideResults();

  var cacheKey = username.toLowerCase();
  var cached = searchCache[cacheKey];

  // If we've already fetched this username this session,
  // reuse it instead of calling the GitHub API again.
  if (cached) {
    showStatus("Loading @" + username + " from cache (no new requests used) …", "loading");

    var user = cached.user;
    currentRepos = cached.repos;

    hideStatus();
    renderProfile(user);
    renderLanguageBreakdown(currentRepos);
    renderRepoGrid();
    return;
  }

  showStatus("Looking up @" + username + " …", "loading");
  searchButton.disabled = true;

  try {
    var fetchedUser = await fetchUserProfile(username);
    var fetchedRepos = await fetchUserRepos(username);

    // filter out forks if the user wants original work highlighted —
    // kept simple: just keep everything, but sort original work first
    currentRepos = fetchedRepos.filter(function (repo) {
      return true;
    });

    // Save to cache so the next search for this username is free.
    searchCache[cacheKey] = {
      user: fetchedUser,
      repos: currentRepos
    };

    hideStatus();
    renderProfile(fetchedUser);
    renderLanguageBreakdown(currentRepos);
    renderRepoGrid();
  } catch (error) {
    if (error.message === "NOT_FOUND") {
      showStatus("No GitHub user found with the username \"" + username + "\".", "error");
    } else if (error.message === "RATE_LIMITED") {
      showStatus("GitHub's unauthenticated rate limit (60 requests/hour) has been reached. Please wait a bit and try again.", "error");
    } else {
      showStatus("Something went wrong while reaching the GitHub API. Check your connection and try again.", "error");
    }
  } finally {
    searchButton.disabled = false;
  }
}

// EVENT LISTENERS
searchForm.addEventListener("submit", function (event) {
  event.preventDefault();

  var rawValue = usernameInput.value;
  var username = rawValue.trim();

  if (username === "") {
    showStatus("Type a GitHub username to search.", "error");
    return;
  }

  handleSearch(username);
});

sortSelect.addEventListener("change", function () {
  renderRepoGrid();
});

// INITIAL LOAD
checkRateLimitOnLoad();

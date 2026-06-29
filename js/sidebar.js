const projects = {
    dashboard: {
        title: "Dashboard",
        description: ""
    },
    quiz: {
        title: "Quiz App",
        description: "Interactive MCQ Application",
        path: "projects/quiz-app/index.html"
    },
    expense: {
        title: "Expense Tracker",
        description: "Income & Expense Management",
        path: "projects/expense-tracker/index.html"
    },
    news: {
        title: "Live News",
        description: "News API Integration",
        path: "projects/live-news/index.html"
    },
    github: {
        title: "GitHub Explorer",
        description: "Developer Profile Search",
        path: "projects/github-dev-explorer/index.html"
    },
    kanban: {
        title: "Kanban Board",
        description: "Task Management Board",
        path: "projects/kanban-task-board/index.html"
    }
};

const navButtons = document.querySelectorAll('.nav-btn');
const projectButtons = document.querySelectorAll('.project-card button');
const dashboardPage = document.getElementById('dashboard-page');
const projectFrame = document.getElementById('project-frame');
const projectHeader = document.getElementById('project-header');
const projectTitle = document.getElementById('project-title');
const projectDesc = document.getElementById('project-desc');

function openProject(pageId) {
    // Update active button state in sidebar
    navButtons.forEach(function(navBtn) {
        if (navBtn.getAttribute('data-page') === pageId) {
            navBtn.classList.add('active');
        } else {
            navBtn.classList.remove('active');
        }
    });
    
    if (pageId === 'dashboard') {
        // Show dashboard, hide project container elements
        projectFrame.style.display = 'none';
        projectHeader.style.display = 'none';
        dashboardPage.style.display = 'block';
    } else {
        // Show project container elements, hide dashboard
        dashboardPage.style.display = 'none';
        projectHeader.style.display = 'block';
        projectFrame.style.display = 'block';
        
        // Update header info dynamically
        projectTitle.innerText = projects[pageId].title;
        projectDesc.innerText = projects[pageId].description;
        
        // Set the iframe source
        projectFrame.src = projects[pageId].path;
    }
}

navButtons.forEach(function(btn) {
    btn.addEventListener('click', function() {
        const pageId = this.getAttribute('data-page');
        openProject(pageId);
    });
});

projectButtons.forEach(function(btn) {
    btn.addEventListener('click', function() {
        const pageId = this.getAttribute('data-page');
        openProject(pageId);
    });
});

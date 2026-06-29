const themeBtn = document.getElementById("themeBtn");

function applyTheme(isDark) {
    if (isDark) {
        document.body.classList.add("dark");
        themeBtn.innerHTML = '<i data-lucide="sun"></i> Light Mode';
        localStorage.setItem("theme", "dark");
    } else {
        document.body.classList.remove("dark");
        themeBtn.innerHTML = '<i data-lucide="moon"></i> Dark Mode';
        localStorage.setItem("theme", "light");
    }
    
    // Refresh the icons since we changed the HTML inside the button
    if (window.lucide) {
        lucide.createIcons();
    }
}

// Check if a theme was saved previously
const savedTheme = localStorage.getItem("theme");

// Apply the saved theme on page load
if (savedTheme === "dark") {
    applyTheme(true);
} else {
    applyTheme(false); // Default to light mode
}

// Toggle the theme when the button is clicked
themeBtn.addEventListener("click", function() {
    const isCurrentlyDark = document.body.classList.contains("dark");
    applyTheme(!isCurrentlyDark);
});

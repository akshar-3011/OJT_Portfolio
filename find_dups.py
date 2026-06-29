import re
import os

css_files = [
    "./css/global.css",
    "./css/dashboard.css",
    "./css/responsive.css",
    "./css/sidebar.css",
    "./css/layout.css",
    "./projects/github-dev-explorer/style.css",
    "./projects/quiz-app/style.css",
    "./projects/live-news/css/style.css",
    "./projects/kanban-task-board/style.css",
    "./projects/expense-tracker/style.css"
]

total_dups = 0

for f in css_files:
    if os.path.exists(f):
        with open(f, 'r', encoding='utf-8') as file:
            content = file.read()
            
        # Very basic CSS block parsing
        blocks = re.findall(r'([^{]+)\{([^}]+)\}', content)
        seen = {}
        dups_in_file = []
        
        for selector, body in blocks:
            selector = selector.strip()
            # Normalize body to check for exact duplicates
            norm_body = " ".join(body.split())
            if selector in seen:
                if seen[selector] == norm_body:
                    dups_in_file.append(selector)
            else:
                seen[selector] = norm_body
                
        if dups_in_file:
            print(f"Duplicates in {f}: {dups_in_file}")
            total_dups += len(dups_in_file)

print("Total exact duplicates found:", total_dups)

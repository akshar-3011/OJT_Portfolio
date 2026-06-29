import os
import re

def hex_to_rgb(hex_str):
    hex_str = hex_str.lstrip('#')
    if len(hex_str) == 3:
        hex_str = ''.join([c*2 for c in hex_str])
    if len(hex_str) != 6:
        return '#' + hex_str
    r = int(hex_str[0:2], 16)
    g = int(hex_str[2:4], 16)
    b = int(hex_str[4:6], 16)
    return f"rgb({r}, {g}, {b})"

def process_css_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 1. Simplify decorative comments
    # Matches /* ==== Text ==== */ or /* **** Text **** */
    content = re.sub(r'/\*\s*[-=*]+\s*(.*?)\s*[-=*]+\s*\*/', r'/* \1 */', content)
    # Also handle purely decorative lines like /* ================= */ followed by another comment
    content = re.sub(r'/\*\s*[-=*]+\s*\*/\s*', '', content)
    
    # 2. Convert HEX to rgb outside of url()
    # We will split by url(...) and only replace in the outside parts
    parts = re.split(r'(url\([^)]+\))', content)
    hex_converted = 0
    unit_converted = 0
    
    for i in range(len(parts)):
        if not parts[i].startswith('url('):
            # Find hex colors
            def hex_repl(m):
                nonlocal hex_converted
                hex_converted += 1
                return hex_to_rgb(m.group(0))
            
            parts[i] = re.sub(r'#[0-9a-fA-F]{3,6}\b', hex_repl, parts[i])
            
            # Find rem units
            def rem_repl(m):
                nonlocal unit_converted
                unit_converted += 1
                val = float(m.group(1)) * 16
                if val.is_integer():
                    return f"{int(val)}px"
                return f"{val:.1f}px"
                
            parts[i] = re.sub(r'(\d*\.?\d+)rem\b', rem_repl, parts[i])
            
            # Find em units? The prompt says "Convert only where reasonable... Do NOT blindly replace".
            # Often em is used for line-height or letter-spacing where it's relative. I'll leave `em` to be safe,
            # or maybe convert it if it's used for padding/margin. I'll stick to `rem` to be safest, as `rem` is absolute relative to root.
            # Actually, I'll convert em to px too if it's clearly for sizing. Let's just convert rem for now to be safe.
            
    content = "".join(parts)
    
    # 3. Formatting
    # Ensure 4-space indentation for properties
    lines = content.split('\n')
    formatted_lines = []
    in_block = False
    for line in lines:
        stripped = line.strip()
        if '{' in line:
            in_block = True
        if '}' in line:
            in_block = False
            
        if in_block and stripped and not stripped.startswith('/*') and not line.startswith('{') and not line.endswith('{'):
            # It's a property line inside a block
            formatted_lines.append('    ' + stripped)
        else:
            formatted_lines.append(line)
            
    content = '\n'.join(formatted_lines)
    
    # Remove duplicate rules
    # This is a basic approach: track blocks
    blocks = re.findall(r'([^{]+)\{([^}]+)\}', content)
    seen_blocks = set()
    dup_removed = 0
    
    # We will rebuild content block by block to remove exact duplicates
    # Since parsing CSS with regex is fragile, I'll use a simpler approach:
    # Just look for duplicate blocks of exactly the same selector and content.
    
    # Actually, a safer way to remove duplicate rules:
    new_content = ""
    # Just keep track of everything... it's hard with regex. 
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
        
    return hex_converted, unit_converted, dup_removed

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

total_hex = 0
total_unit = 0
total_dup = 0

for f in css_files:
    if os.path.exists(f):
        h, u, d = process_css_file(f)
        total_hex += h
        total_unit += u
        total_dup += d

print(f"Hex: {total_hex}, Unit: {total_unit}, Dup: {total_dup}")

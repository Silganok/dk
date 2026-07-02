import re

with open("js/data/items.js", "r", encoding="utf-8") as f:
    content = f.read()

# Add a comma to lines that end with " }" but do not have a comma
content = re.sub(r'(\s*"[^"]+": \{.*?\})\s*$', r'\1,', content, flags=re.MULTILINE)

with open("js/data/items.js", "w", encoding="utf-8") as f:
    f.write(content)
print("fixed")

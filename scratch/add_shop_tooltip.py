import re

with open("js/game/ui.js", "r", encoding="utf-8") as f:
    content = f.read()

marker = "            <div>\n                <div style=\"font-weight: 600; font-size: 13px; color: ${color};\">${item.name} <span style=\"font-size:10px;color:#94a3b8;\">${item.subType ? `[${item.subType}]` : ''}</span></div>"
inject = "            <div title=\"${getItemTooltipText(item)}\">\n                <div style=\"font-weight: 600; font-size: 13px; color: ${color};\">${item.name} <span style=\"font-size:10px;color:#94a3b8;\">${item.subType ? `[${item.subType}]` : ''}</span></div>"

content = content.replace(marker, inject)

with open("js/game/ui.js", "w", encoding="utf-8") as f:
    f.write(content)
print("done")

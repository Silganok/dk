import re

with open("js/game/ui.js", "r", encoding="utf-8") as f:
    content = f.read()

tooltip_marker = "if (item.luk) stats.push(`LUK +${item.luk}`);"
tooltip_inject = "if (item.reqLevel) stats.push(`[요구 레벨: ${item.reqLevel}]`);"
if tooltip_inject not in content:
    content = content.replace(tooltip_marker, f"{tooltip_marker}\n    {tooltip_inject}")

equip_marker = """    const baseItem = ITEM_DB[invItem.id];
    if (!baseItem) return;"""
equip_inject = """    const baseItem = ITEM_DB[invItem.id];
    if (!baseItem) return;

    if (baseItem.reqLevel && playerState.level < baseItem.reqLevel) {
        showToast(`레벨이 부족하여 장착할 수 없습니다. (요구 레벨: ${baseItem.reqLevel})`, 'error');
        return;
    }"""
if equip_inject not in content:
    content = content.replace(equip_marker, equip_inject)

with open("js/game/ui.js", "w", encoding="utf-8") as f:
    f.write(content)
print("UI updated")

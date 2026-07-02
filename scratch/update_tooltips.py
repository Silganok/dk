import re
import sys

with open("js/game/ui.js", "r", encoding="utf-8") as f:
    content = f.read()

start_marker = "        <div class=\"stat-section\" style=\"grid-column: span 3; margin-top: 8px; margin-bottom: 4px;\">\n            <h3 style=\"font-size: 13px; color: #a855f7; border-bottom: 1px solid var(--border-color); padding-bottom: 4px;\">전투 능력치</h3>\n        </div>"

end_marker = "</div>\n    `;"

start_idx = content.find(start_marker)
end_idx = content.find(end_marker, start_idx)

if start_idx == -1 or end_idx == -1:
    print("Could not find start or end bounds.")
    sys.exit(1)

new_logic = """        <div class="stat-section" style="grid-column: span 3; margin-top: 8px; margin-bottom: 4px;">
            <h3 style="font-size: 13px; color: #a855f7; border-bottom: 1px solid var(--border-color); padding-bottom: 4px;">전투 능력치</h3>
        </div>
        `;
        
        let strVal = playerState.getTotalStat('str');
        let strBon = playerState.calcStatBonus('str', 2);
        let eqAtk = playerState.getEquipBonus('attack') + playerState.getEquipBonus('meleeAttack');
        let pasAtk = playerState.getPassiveBonus('attackBonus');
        let multAtk = Math.round((playerState.getSetBonus('attackMult') + playerState.getMealBonus('meleeAttackMultBonus')) * 100);
        let ttMelee = `STR${strVal}(${strBon})`;
        if(eqAtk > 0) ttMelee += ` + 장비(${eqAtk})`;
        if(pasAtk > 0) ttMelee += ` + 패시브(${pasAtk})`;
        if(multAtk > 0) ttMelee += ` + 비율(${multAtk}%)`;

        let dexVal = playerState.getTotalStat('dex');
        let dexBon = playerState.calcStatBonus('dex', 2);
        let eqRAtk = playerState.getEquipBonus('attack') + playerState.getEquipBonus('rangedAttack');
        let pasRAtk = playerState.getPassiveBonus('attackBonus');
        let multRAtk = Math.round((playerState.getSetBonus('attackMult') + playerState.getMealBonus('rangedAttackMultBonus')) * 100);
        let ttRanged = `DEX${dexVal}(${dexBon})`;
        if(eqRAtk > 0) ttRanged += ` + 장비(${eqRAtk})`;
        if(pasRAtk > 0) ttRanged += ` + 패시브(${pasRAtk})`;
        if(multRAtk > 0) ttRanged += ` + 비율(${multRAtk}%)`;

        let intVal = playerState.getTotalStat('int');
        let intBon = playerState.calcStatBonus('int', 2);
        let eqMAtk = playerState.getEquipBonus('magicAttack') + playerState.getSetBonus('magicAttack');
        let pasMAtk = playerState.getPassiveBonus('magicAttackBonus');
        let multMAtk = Math.round((playerState.getSetBonus('magicAttackMult') + playerState.getMealBonus('magicAttackMultBonus')) * 100);
        let ttMagic = `INT${intVal}(${intBon})`;
        if(eqMAtk > 0) ttMagic += ` + 장비(${eqMAtk})`;
        if(pasMAtk > 0) ttMagic += ` + 패시브(${pasMAtk})`;
        if(multMAtk > 0) ttMagic += ` + 비율(${multMAtk}%)`;

        let eqDefVal = playerState.getEquipBonus('defense') + playerState.getSetBonus('defense');
        let multDef = Math.round((playerState.getSetBonus('defMult') + playerState.getMealBonus('defMultBonus')) * 100);
        let ttEqDef = `장비(${eqDefVal})`;
        if(multDef > 0) ttEqDef += ` + 효과(${multDef}%)`;
        let vitVal = playerState.getTotalStat('vit');
        let vitBon = playerState.calcStatBonus('vit', 1);
        let pasDef = playerState.getPassiveBonus('defBonus');
        let ttVitDef = `VIT${vitVal}(${vitBon})`;
        if(pasDef > 0) ttVitDef += ` + 패시브(${pasDef})`;
        let ttPDef = `[장비방어/뎀감] ${ttEqDef}  |  [스탯방어/고정] ${ttVitDef}`;

        let eqMDefVal = playerState.getEquipBonus('magicDefense') + playerState.getSetBonus('magicDefense');
        let ttEqMDef = `장비(${eqMDefVal})`;
        let intMDefVal = playerState.getTotalStat('int');
        let intMDefBon = playerState.calcStatBonus('int', 1);
        let ttIntMDef = `INT${intMDefVal}(${intMDefBon})`;
        let ttMDef = `[장비마방/뎀감] ${ttEqMDef}  |  [스탯마방/고정] ${ttIntMDef}`;

        let agiVal = playerState.getTotalStat('agi');
        let agiBon = playerState.calcStatBonus('agi', 1);
        let eqSpd = playerState.getEquipBonus('speed') + playerState.getSetBonus('speed');
        let pasSpd = playerState.getPassiveBonus('speedBonus') + playerState.getMealBonus('speedBonus');
        let ttSpeed = `AGI${agiVal}(${agiBon})`;
        if(eqSpd > 0) ttSpeed += ` + 장비(${eqSpd})`;
        if(pasSpd > 0) ttSpeed += ` + 추가(${pasSpd})`;

        let eqAcc = playerState.getEquipBonus('accuracy') + playerState.getSetBonus('accuracy');
        let pasAcc = playerState.getPassiveBonus('hitRateBonus') + playerState.getMealBonus('accuracyBonus');
        let dexAccBon = playerState.calcStatBonus('dex', 1);
        let ttAcc = `기본(80) + DEX${dexVal}(${dexAccBon})`;
        if(eqAcc > 0) ttAcc += ` + 장비(${eqAcc})`;
        if(pasAcc > 0) ttAcc += ` + 추가(${pasAcc})`;

        let eqEva = playerState.getEquipBonus('evasion') + playerState.getSetBonus('evasion');
        let pasEva = playerState.getPassiveBonus('evadeBonus') + playerState.getMealBonus('evadeBonus');
        let agiEvaBon = playerState.calcStatBonus('agi', 2);
        let ttEva = `AGI${agiVal}(${agiEvaBon})`;
        if(eqEva > 0) ttEva += ` + 장비(${eqEva})`;
        if(pasEva > 0) ttEva += ` + 추가(${pasEva})`;

        let lukVal = playerState.getTotalStat('luk');
        let lukBon = playerState.calcStatBonus('luk', 0.5);
        let eqCrit = playerState.getEquipBonus('critChance') + playerState.getSetBonus('critChance');
        let pasCrit = playerState.getPassiveBonus('critBonus') + playerState.getMealBonus('critBonus');
        let ttCrit = `기본(5%) + LUK${lukVal}(${lukBon}%)`;
        if(eqCrit > 0) ttCrit += ` + 장비(${eqCrit}%)`;
        if(pasCrit > 0) ttCrit += ` + 추가(${pasCrit}%)`;

        let lukCritBon = playerState.calcStatBonus('luk', 1);
        let eqCritDmg = playerState.getEquipBonus('critDamage') + playerState.getSetBonus('critDamage');
        let pasCritDmg = playerState.getPassiveBonus('critDamageBonus') + playerState.getMealBonus('critDamageBonus');
        let ttCritDmg = `기본(200%) + LUK${lukVal}(${lukCritBon}%)`;
        if(eqCritDmg > 0) ttCritDmg += ` + 장비(${eqCritDmg}%)`;
        if(pasCritDmg > 0) ttCritDmg += ` + 추가(${pasCritDmg}%)`;

        statsContainer.innerHTML += `
        <div style="grid-column: span 3; display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 6px; width: 100%;">
            <div class="stat-box" style="margin:0; padding:6px; display:flex; justify-content:space-between; align-items:center;" title="${ttMelee}"><span class="stat-label" style="font-size:10px; white-space:nowrap;">근접 공격</span><span class="stat-value" style="font-size:11px;">${playerState.meleeAttack}</span></div>
            <div class="stat-box" style="margin:0; padding:6px; display:flex; justify-content:space-between; align-items:center;" title="${ttRanged}"><span class="stat-label" style="font-size:10px; white-space:nowrap;">원거리 공격</span><span class="stat-value" style="font-size:11px;">${playerState.rangedAttack}</span></div>
            <div class="stat-box" style="margin:0; padding:6px; display:flex; justify-content:space-between; align-items:center;" title="${ttMagic}"><span class="stat-label" style="font-size:10px; white-space:nowrap;">마법 공격</span><span class="stat-value" style="font-size:11px;">${playerState.magicAttack}</span></div>
            
            <div class="stat-box" style="margin:0; padding:6px; display:flex; justify-content:space-between; align-items:center;" title="${ttPDef}"><span class="stat-label" style="font-size:10px; white-space:nowrap;">물리 방어</span><span class="stat-value" style="font-size:11px;">${playerState.equipDefense} + ${playerState.vitDefense}</span></div>
            <div class="stat-box" style="margin:0; padding:6px; display:flex; justify-content:space-between; align-items:center;" title="${ttMDef}"><span class="stat-label" style="font-size:10px; white-space:nowrap;">마법 방어</span><span class="stat-value" style="color: #c084fc; font-size:11px;">${playerState.equipMagicDefense || 0} + ${playerState.intDefense || 0}</span></div>
            <div class="stat-box" style="margin:0; padding:6px; display:flex; justify-content:space-between; align-items:center;" title="${ttSpeed}"><span class="stat-label" style="font-size:10px; white-space:nowrap;">전투 속도</span><span class="stat-value" style="font-size:11px;">${playerState.speed}</span></div>
            
            <div class="stat-box" style="margin:0; padding:6px; display:flex; justify-content:space-between; align-items:center;" title="${ttAcc}"><span class="stat-label" style="font-size:10px; white-space:nowrap;">명중률</span><span class="stat-value" style="font-size:11px;">${playerState.accuracy}%</span></div>
            <div class="stat-box" style="margin:0; padding:6px; display:flex; justify-content:space-between; align-items:center;" title="${ttEva}"><span class="stat-label" style="font-size:10px; white-space:nowrap;">회피율</span><span class="stat-value" style="font-size:11px;">${playerState.evasion}%</span></div>
            <div class="stat-box" style="margin:0; padding:6px; display:flex; justify-content:space-between; align-items:center;" title="${ttCrit}"><span class="stat-label" style="font-size:10px; white-space:nowrap;">치명 확률</span><span class="stat-value" style="font-size:11px;">${playerState.critChance}%</span></div>
            
            <div class="stat-box" style="margin:0; padding:6px; display:flex; justify-content:space-between; align-items:center; grid-column: span 3;" title="${ttCritDmg}"><span class="stat-label" style="font-size:10px; white-space:nowrap;">치명타 피해</span><span class="stat-value" style="font-size:11px;">${playerState.critDamage}%</span></div>
        </div>
    `;"""

content = content[:start_idx] + new_logic + content[end_idx + len("</div>\n    `;"):]

with open("js/game/ui.js", "w", encoding="utf-8") as f:
    f.write(content)
print("Tooltips successfully updated.")

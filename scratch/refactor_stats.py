import re
import sys

with open("js/game/ui.js", "r", encoding="utf-8") as f:
    content = f.read()

start_str = "window.renderPlayerStats = function() {"
end_str = "    // 스킬 관리 섹션 추가"
start_idx = content.find(start_str)
end_idx = content.find(end_str)

if start_idx == -1 or end_idx == -1:
    print("Could not find start or end bounds.")
    print("start_idx:", start_idx)
    print("end_idx:", end_idx)
    sys.exit(1)

new_func = """window.renderPlayerStats = function() {
    if (!statsContainer || !playerState) return;
    updateGlobalBar();
    if (!playerState.equippedSkills) playerState.equippedSkills = []; // 호환성
    
    const baseReq = EXP_DB.getRequiredExp(playerState.level);
    const baseExpPercent = playerState.level >= 100 ? 100 : Math.min(100, (playerState.exp / baseReq) * 100);
    
    const jobData = JOB_DB[playerState.job];
    const maxJobLevel = jobData ? jobData.maxLevel : 10;
    const jobReq = EXP_DB.getRequiredJobExp(playerState.jobLevel);
    const jobExpPercent = playerState.jobLevel >= maxJobLevel ? 100 : Math.min(100, ((playerState.jobExp || 0) / jobReq) * 100);
    
    // 장비 슬롯 렌더링 헬퍼
    const renderEquipSlot = (slotKey, label) => {
        const eqItem = playerState.equipment[slotKey];
        let displayName = '비어있음';
        let tooltip = '';
        let nameColor = '#475569';
        let hasItem = false;
        
        if (eqItem && ITEM_DB[eqItem.id]) {
            hasItem = true;
            const baseItem = ITEM_DB[eqItem.id];
            const enhanceStr = eqItem.enhance ? `+${eqItem.enhance} ` : '';
            displayName = `${enhanceStr}${baseItem.name}`;
            tooltip = getItemTooltipText({ ...baseItem, ...eqItem });
            nameColor = '#f8fafc';
        }
        
        return `
            <div class="equip-slot" style="display: flex; align-items: center; justify-content: space-between; background: rgba(0,0,0,0.4); border: 1px solid #334155; border-radius: 4px; padding: 2px 4px; height: 26px; gap: 4px; width: 100%;" title="${tooltip}">
                <span style="font-size: 10px; color: #94a3b8; background: #1e293b; padding: 1px 3px; border-radius: 2px; white-space: nowrap; flex-shrink: 0; min-width: 28px; text-align: center;">${label}</span>
                <span style="font-size: 11px; color: ${nameColor}; font-weight: ${hasItem ? 'bold' : 'normal'}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex: 1; text-align: left;">${displayName}</span>
                ${hasItem ? `<button class="action-btn danger" style="padding: 1px; font-size: 9px; width: 22px; height: 16px; line-height: 14px; flex-shrink: 0; margin: 0;" onclick="unequipItem('${slotKey}')">해제</button>` : `<div style="width: 22px; flex-shrink: 0;"></div>`}
            </div>
        `;
    };

    if (equipmentContainer) {
        equipmentContainer.innerHTML = ''; 
    }

    const getStatHtml = (statKey, statLabel) => {
        const total = playerState.getTotalStat(statKey);
        const base = playerState.baseStats[statKey];
        const jobBonus = playerState.getJobBonus(statKey);
        const equipBonus = playerState.getEquipBonus(statKey);
        const cost = EXP_DB.getStatUpgradeCost(base);
        const canUpgrade = base < 100 && (playerState.statPoints || 0) >= cost;
        
        let btnHtml = '';
        if (base < 100) {
            btnHtml = `<button class="action-btn stat-up-btn" data-stat="${statKey}" style="width: 100%; padding: 4px; font-size: 10px; margin: 0; ${canUpgrade ? 'border-color: #10b981; color: #6ee7b7;' : 'opacity: 0.3; cursor: not-allowed;'}" ${canUpgrade ? '' : 'disabled'}>+1 UP(${cost})</button>`;
        } else {
            btnHtml = `<button class="action-btn" style="width: 100%; padding: 4px; font-size: 10px; margin: 0; opacity: 0.5; border-color: #ef4444; color: #ef4444;" disabled>(MAX)</button>`;
        }
        
        let details = `기본${base}`;
        if (jobBonus > 0) details += `<span style="color: #3b82f6;">+${jobBonus}</span>`;
        if (equipBonus > 0) details += `<span style="color: #10b981;">+${equipBonus}</span>`;

        return `<div style="background: rgba(15, 23, 42, 0.6); border: 1px solid #334155; border-radius: 6px; padding: 8px; display: flex; flex-direction: column; justify-content: space-between; overflow: hidden;">
            <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 4px;">
                <span style="font-weight: bold; color: #f8fafc; font-size: 12px; white-space: nowrap;">${statLabel}</span>
                <span style="font-weight: bold; color: #f59e0b; font-size: 13px; white-space: nowrap;">${total}</span>
            </div>
            <div style="font-size: 10px; color: #94a3b8; margin-bottom: 6px; white-space: nowrap; text-align: right;">
                ${details}
            </div>
            ${btnHtml}
        </div>`;
    };

    let statBoxesHtml = `
        <div class="stat-section" style="grid-column: span 3; margin-top: 8px; margin-bottom: 4px; display: flex; justify-content: space-between; align-items: baseline;">
            <h3 style="font-size: 13px; color: #f59e0b; border-bottom: 1px solid var(--border-color); padding-bottom: 4px; margin: 0; width: 100%;">기본 스탯 <span style="font-size: 11px; color: #94a3b8; float: right;">잔여 포인트: <span style="color: #10b981; font-weight: bold;">${playerState.statPoints || 0}</span></span></h3>
        </div>
        <div style="grid-column: span 3; display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 6px; width: 100%;">
            ${getStatHtml('str', 'STR')}
            ${getStatHtml('agi', 'AGI')}
            ${getStatHtml('dex', 'DEX')}
            ${getStatHtml('vit', 'VIT')}
            ${getStatHtml('int', 'INT')}
            ${getStatHtml('luk', 'LUK')}
        </div>
    `;

    statsContainer.innerHTML = `
        <div style="grid-column: span 3; display: grid; grid-template-columns: 1fr auto 1fr; gap: 8px; align-items: center; margin-bottom: 12px; padding: 12px; background: rgba(15, 23, 42, 0.5); border-radius: 8px; border: 1px solid #334155;">
            <div style="display: flex; flex-direction: column; gap: 6px;">
                ${renderEquipSlot('head', '투구')}
                ${renderEquipSlot('body', '갑옷')}
                ${renderEquipSlot('pants', '바지')}
                ${renderEquipSlot('shoes', '신발')}
            </div>
            
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100px; overflow: hidden;">
                <img src="${getAppearanceImageURL(playerState.gender || '남성', playerState.appearance || 1)}" alt="Portrait" style="width: 70px; height: 70px; border-radius: 50%; border: 3px solid ${playerState.gender === '여성' ? '#ec4899' : '#3b82f6'}; box-shadow: 0 4px 6px rgba(0,0,0,0.3); object-fit: cover;">
                <div style="font-size: 14px; font-weight: bold; color: #f8fafc; margin-top: 6px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; width: 100%; text-align: center;">${playerState.name}</div>
                <div style="color: #94a3b8; font-size: 11px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; width: 100%; text-align: center;">${playerState.job} | Lv.${playerState.level}</div>
            </div>
            
            <div style="display: flex; flex-direction: column; gap: 6px;">
                ${renderEquipSlot('weapon', '무기')}
                ${renderEquipSlot('subWeapon', '보조')}
                ${renderEquipSlot('accessory1', '장신1')}
                ${renderEquipSlot('accessory2', '장신2')}
            </div>
        </div>
        
        <div style="grid-column: span 3; display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 8px;">
            <div class="stat-box" style="margin: 0; display: flex; flex-direction: column; justify-content: center; padding: 8px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                    <span class="stat-label" style="font-size: 11px;">베이스 경험치</span>
                    <span class="stat-value exp" style="font-size: 10px;">Lv.${playerState.level} (${playerState.exp}/${baseReq})</span>
                </div>
                <div style="width: 100%; background: #334155; height: 5px; border-radius: 3px; overflow: hidden;">
                    <div style="width: ${baseExpPercent}%; background: #a855f7; height: 100%; transition: width 0.3s ease;"></div>
                </div>
            </div>
            <div class="stat-box" style="margin: 0; display: flex; flex-direction: column; justify-content: center; padding: 8px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                    <span class="stat-label" style="font-size: 11px;">잡 경험치</span>
                    <span class="stat-value" style="color: #6ee7b7; font-size: 10px;">JobLv.${playerState.jobLevel} (${playerState.jobExp || 0}/${jobReq})</span>
                </div>
                <div style="width: 100%; background: #334155; height: 5px; border-radius: 3px; overflow: hidden;">
                    <div style="width: ${jobExpPercent}%; background: #10b981; height: 100%; transition: width 0.3s ease;"></div>
                </div>
            </div>
        </div>

        ${statBoxesHtml}

        <div class="stat-section" style="grid-column: span 3; margin-top: 8px; margin-bottom: 4px;">
            <h3 style="font-size: 13px; color: #a855f7; border-bottom: 1px solid var(--border-color); padding-bottom: 4px;">전투 능력치</h3>
        </div>
        <div style="grid-column: span 3; display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 6px; width: 100%;">
            <div class="stat-box" style="margin:0; padding:6px; display:flex; justify-content:space-between; align-items:center;"><span class="stat-label" style="font-size:10px; white-space:nowrap;">근접 공격</span><span class="stat-value" style="font-size:11px;">${playerState.meleeAttack}</span></div>
            <div class="stat-box" style="margin:0; padding:6px; display:flex; justify-content:space-between; align-items:center;"><span class="stat-label" style="font-size:10px; white-space:nowrap;">원거리 공격</span><span class="stat-value" style="font-size:11px;">${playerState.rangedAttack}</span></div>
            <div class="stat-box" style="margin:0; padding:6px; display:flex; justify-content:space-between; align-items:center;"><span class="stat-label" style="font-size:10px; white-space:nowrap;">마법 공격</span><span class="stat-value" style="font-size:11px;">${playerState.magicAttack}</span></div>
            
            <div class="stat-box" style="margin:0; padding:6px; display:flex; justify-content:space-between; align-items:center;" title="장비${playerState.equipDefense} + VIT${playerState.vitDefense}"><span class="stat-label" style="font-size:10px; white-space:nowrap;">물리 방어</span><span class="stat-value" style="font-size:11px;">${playerState.defense}</span></div>
            <div class="stat-box" style="margin:0; padding:6px; display:flex; justify-content:space-between; align-items:center;" title="장비${playerState.equipMagicDefense || 0} + INT${playerState.intDefense || 0}"><span class="stat-label" style="font-size:10px; white-space:nowrap;">마법 방어</span><span class="stat-value" style="color: #c084fc; font-size:11px;">${playerState.magicDefense || 0}</span></div>
            <div class="stat-box" style="margin:0; padding:6px; display:flex; justify-content:space-between; align-items:center;"><span class="stat-label" style="font-size:10px; white-space:nowrap;">전투 속도</span><span class="stat-value" style="font-size:11px;">${playerState.speed}</span></div>
            
            <div class="stat-box" style="margin:0; padding:6px; display:flex; justify-content:space-between; align-items:center;"><span class="stat-label" style="font-size:10px; white-space:nowrap;">명중률</span><span class="stat-value" style="font-size:11px;">${playerState.accuracy}%</span></div>
            <div class="stat-box" style="margin:0; padding:6px; display:flex; justify-content:space-between; align-items:center;"><span class="stat-label" style="font-size:10px; white-space:nowrap;">회피율</span><span class="stat-value" style="font-size:11px;">${playerState.evasion}%</span></div>
            <div class="stat-box" style="margin:0; padding:6px; display:flex; justify-content:space-between; align-items:center;"><span class="stat-label" style="font-size:10px; white-space:nowrap;">치명 확률</span><span class="stat-value" style="font-size:11px;">${playerState.critChance}%</span></div>
            
            <div class="stat-box" style="margin:0; padding:6px; display:flex; justify-content:space-between; align-items:center; grid-column: span 3;"><span class="stat-label" style="font-size:10px; white-space:nowrap;">치명타 피해</span><span class="stat-value" style="font-size:11px;">${playerState.critDamage}%</span></div>
        </div>
    `;
"""

content = content[:start_idx] + new_func + "\n" + content[end_idx:]

with open("js/game/ui.js", "w", encoding="utf-8") as f:
    f.write(content)
print("Updated successfully.")

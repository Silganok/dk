// DOM 요소를 전역적으로 캐싱
let tabBtns, views, statsContainer;
let btnInn, btnChurch, btnShop, btnGuild, btnWarrior, btnMage, guildMenu;
let fieldIdle, fieldCombat, monsterNameDisplay, monsterHpDisplay, combatLog;
let btnExplore, btnAttack, btnSkill, btnFlee, btnStopAuto, combatSkillMenu, combatSkillList;
let btnWarehouse, warehouseMenu, warehouseInvList, warehouseStorageList;
let equipmentContainer, inventoryList, inventoryFilters;
let currentInvFilter = 'all';

let gHp, gMp, gFatigue, gGold;
let selAutoCombat, combatPlayerName, combatPlayerHpText, combatPlayerHpBar, combatPlayerMpText, combatPlayerMpBar;
let combatMonsterHpText, combatMonsterHpBar;

function initGameUI() {
    tabBtns = document.querySelectorAll('.tab-btn');
    views = document.querySelectorAll('.view');
    statsContainer = document.getElementById('player-stats');
    equipmentContainer = document.getElementById('equipment-container');

    // 마을 UI
    btnInn = document.getElementById('btn-inn');
    btnChurch = document.getElementById('btn-church');
    btnShop = document.getElementById('btn-shop');
    btnGuild = document.getElementById('btn-guild');
    guildMenu = document.getElementById('guild-menu');
    btnWarrior = document.getElementById('btn-job-warrior');
    btnMage = document.getElementById('btn-job-mage');
    btnWarehouse = document.getElementById('btn-warehouse');
    warehouseMenu = document.getElementById('warehouse-menu');
    warehouseInvList = document.getElementById('warehouse-inventory-list');
    warehouseStorageList = document.getElementById('warehouse-storage-list');
    
    inventoryList = document.getElementById('inventory-list');
    inventoryFilters = document.querySelectorAll('.filter-btn');

    // 필드 UI
    fieldIdle = document.getElementById('field-idle');
    fieldCombat = document.getElementById('field-combat');
    monsterNameDisplay = document.getElementById('monster-name-display');
    monsterHpDisplay = document.getElementById('monster-hp-display');
    combatLog = document.getElementById('combat-log');
    btnExplore = document.getElementById('btn-explore');
    btnAttack = document.getElementById('btn-attack');
    btnSkill = document.getElementById('btn-skill');
    btnFlee = document.getElementById('btn-flee');
    btnStopAuto = document.getElementById('btn-stop-auto');
    combatSkillMenu = document.getElementById('combat-skill-menu');
    combatSkillList = document.getElementById('combat-skill-list');

    gHp = document.getElementById('g-hp');
    gMp = document.getElementById('g-mp');
    gFatigue = document.getElementById('g-fatigue');
    gGold = document.getElementById('g-gold');
    
    selAutoCombat = document.getElementById('sel-auto-combat');
    combatPlayerName = document.getElementById('combat-player-name');
    combatPlayerHpText = document.getElementById('combat-player-hp-text');
    combatPlayerHpBar = document.getElementById('combat-player-hp-bar');
    combatPlayerMpText = document.getElementById('combat-player-mp-text');
    combatPlayerMpBar = document.getElementById('combat-player-mp-bar');
    combatMonsterHpText = document.getElementById('combat-monster-hp-text');
    combatMonsterHpBar = document.getElementById('combat-monster-hp-bar');

    // 이벤트 리스너 바인딩
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => switchTab(btn.dataset.target));
    });

    if (btnInn) {
        btnInn.addEventListener('click', () => {
            if (playerState.gold >= 10) {
                if (playerState.currentHp === playerState.maxHp && playerState.currentMp === playerState.maxMp) {
                    alert("이미 체력과 마력이 가득 찼습니다.");
                    return;
                }
                updatePlayerState({
                    gold: playerState.gold - 10,
                    currentHp: playerState.maxHp,
                    currentMp: playerState.maxMp
                });
                alert("10G를 지불하고 체력과 마력을 모두 회복했습니다.");
            } else {
                alert("골드가 부족합니다.");
            }
        });
    }

    if (btnChurch) {
        btnChurch.addEventListener('click', () => {
            updatePlayerState({ fatigue: playerState.fatigue + 100 });
            alert("여신의 가호를 받아 피로도가 100 증가했습니다!");
        });
    }

    if (btnGuild) {
        btnGuild.addEventListener('click', () => {
            if (playerState.job !== "초보자") {
                alert("이미 전직하셨습니다!");
                return;
            }
            if (playerState.level < 10) {
                alert(`레벨 10 이상부터 전직할 수 있습니다. (현재 레벨: ${playerState.level})`);
                return;
            }
            guildMenu.style.display = guildMenu.style.display === 'none' ? 'block' : 'none';
        });
    }

    if (btnWarehouse) {
        btnWarehouse.addEventListener('click', () => {
            warehouseMenu.style.display = warehouseMenu.style.display === 'none' ? 'block' : 'none';
            if (warehouseMenu.style.display === 'block') {
                renderWarehouse();
            }
        });
    }

    if (inventoryFilters) {
        inventoryFilters.forEach(btn => {
            btn.addEventListener('click', () => {
                inventoryFilters.forEach(b => {
                    b.classList.remove('active');
                    b.style.borderColor = '#475569';
                    b.style.color = '#cbd5e1';
                });
                btn.classList.add('active');
                btn.style.borderColor = '#3b82f6';
                btn.style.color = '#93c5fd';
                currentInvFilter = btn.dataset.filter;
                renderInventory();
            });
        });
    }

    if (btnWarrior) {
        btnWarrior.addEventListener('click', () => {
            const jobData = JOB_DB["검사"];
            for (let stat in jobData.bonusStats) {
                playerState.baseStats[stat] += jobData.bonusStats[stat];
            }
            playerState.skills = [];
            playerState.equippedSkills = [];
            jobData.bonusSkills.forEach(skillName => {
                playerState.skills.push(JSON.parse(JSON.stringify(SKILL_DB[skillName])));
            });
            updatePlayerState({ job: "검사", skills: playerState.skills, equippedSkills: playerState.equippedSkills });
            guildMenu.style.display = 'none';
            alert(`전사로 전직했습니다! ${jobData.desc}`);
        });
    }

    if (btnMage) {
        btnMage.addEventListener('click', () => {
            const jobData = JOB_DB["마법사"];
            for (let stat in jobData.bonusStats) {
                playerState.baseStats[stat] += jobData.bonusStats[stat];
            }
            playerState.skills = [];
            playerState.equippedSkills = [];
            jobData.bonusSkills.forEach(skillName => {
                playerState.skills.push(JSON.parse(JSON.stringify(SKILL_DB[skillName])));
            });
            updatePlayerState({ job: "마법사", skills: playerState.skills, equippedSkills: playerState.equippedSkills });
            guildMenu.style.display = 'none';
            alert(`마법사로 전직했습니다! ${jobData.desc}`);
        });
    }

    renderFieldList();

    if (btnAttack) {
        btnAttack.addEventListener('click', () => executePlayerAction(null));
    }

    if (btnSkill) {
        btnSkill.addEventListener('click', () => {
            if (!currentMonster || playerState.currentHp <= 0) return;
            if (combatSkillMenu.style.display === 'none') {
                combatSkillMenu.style.display = 'block';
                combatSkillList.innerHTML = '';
                if (playerState.skills.length === 0) {
                    combatSkillList.innerHTML = '<span style="color:#94a3b8; font-size:13px;">배운 스킬이 없습니다.</span>';
                } else {
                    playerState.skills.forEach(skill => {
                        const sBtn = document.createElement('button');
                        sBtn.className = 'action-btn';
                        sBtn.style.padding = '4px 8px';
                        sBtn.style.fontSize = '12px';
                        sBtn.textContent = `${skill.name} (MP ${skill.costMp})`;
                        sBtn.addEventListener('click', () => {
                            if (playerState.currentMp < skill.costMp) {
                                alert("MP가 부족합니다!");
                                return;
                            }
                            combatSkillMenu.style.display = 'none';
                            updatePlayerState({ currentMp: playerState.currentMp - skill.costMp });
                            executePlayerAction(skill);
                        });
                        combatSkillList.appendChild(sBtn);
                    });
                }
            } else {
                combatSkillMenu.style.display = 'none';
            }
        });
    }

    if (btnFlee) {
        btnFlee.addEventListener('click', () => {
            if (!currentMonster || playerState.currentHp <= 0) return;
            addCombatLog("당신은 무사히 도망쳤습니다.", "#94a3b8");
            setTimeout(endCombat, 1000);
        });
    }

    if (btnStopAuto) {
        btnStopAuto.addEventListener('click', () => {
            if (!currentMonster) return;
            window.isAutoCombatActive = false;
            window.autoCombatMode = 'manual';
            addCombatLog("마을로 다급히 귀환합니다!", "#f8fafc");
            setTimeout(() => {
                endCombat();
                if (typeof switchTab === 'function') switchTab('town');
            }, 500);
        });
    }

    renderPlayerStats();
}

function switchTab(targetId) {
    tabBtns.forEach(btn => btn.classList.toggle('active', btn.dataset.target === targetId));
    views.forEach(view => view.style.display = view.id === targetId ? 'block' : 'none');
    if (targetId === 'info') {
        renderPlayerStats();
    } else if (targetId === 'inventory') {
        renderPlayerStats();
        renderInventory();
    } else if (targetId === 'field') {
        if (typeof renderFieldList === 'function') renderFieldList();
    }
}

window.renderFieldList = function() {
    const container = document.getElementById('field-list-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    const hasKey = playerState.inventory.some(i => i && i.name === "둥지로의 열쇠");

    for (let fieldId in FIELD_DB) {
        const field = FIELD_DB[fieldId];
        
        if (field.requireItem === "둥지로의 열쇠" && !hasKey) {
            continue;
        }
        
        const isLevelReqMet = playerState.level >= (field.reqLevel || 1);
        let btnDisabled = !isLevelReqMet;
        let btnText = "탐색하기";
        if (!isLevelReqMet) {
            btnText = `Lv.${field.reqLevel} 필요`;
        }
        
        if (field.requireItem && isLevelReqMet) {
            btnText = "탐색 (열쇠 1개 소모)";
        }

        const div = document.createElement('div');
        div.style.background = 'rgba(0,0,0,0.3)';
        div.style.border = '1px solid #334155';
        div.style.padding = '12px';
        div.style.borderRadius = '8px';
        div.style.display = 'flex';
        div.style.justifyContent = 'space-between';
        div.style.alignItems = 'center';

        const nameColor = field.requireItem ? '#ef4444' : '#3b82f6';

        div.innerHTML = `
            <div>
                <div style="font-weight: bold; font-size: 15px; color: ${nameColor}; margin-bottom: 4px;">${field.name}</div>
                <div style="font-size: 12px; color: #94a3b8;">${field.desc}</div>
                <div style="font-size: 11px; color: #64748b; margin-top: 4px;">권장 레벨: ${field.reqLevel || 1}</div>
            </div>
            <div>
                <button class="action-btn ${btnDisabled ? '' : 'danger'}" style="padding: 8px 16px; font-size: 13px; width: auto; ${btnDisabled ? 'opacity: 0.5; cursor: not-allowed;' : ''}" ${btnDisabled ? 'disabled' : ''}>${btnText}</button>
            </div>
        `;

        if (!btnDisabled) {
            const btn = div.querySelector('button');
            btn.addEventListener('click', () => {
                if (typeof startCombat === 'function') startCombat(fieldId);
            });
        }

        container.appendChild(div);
    }
};

window.startCombat = function(fieldId) {
    if (playerState.currentHp <= 0) {
        alert("체력을 먼저 회복하세요!");
        return;
    }
    if (playerState.fatigue < 5) {
        alert(`피로도가 부족합니다! (현재: ${playerState.fatigue}, 필요: 5)`);
        window.isAutoCombatActive = false;
        return;
    }

    const fieldData = FIELD_DB[fieldId];
    
    if (fieldData.requireItem) {
        const keyIndex = playerState.inventory.findIndex(i => i && i.name === fieldData.requireItem);
        if (keyIndex === -1) {
            alert(`${fieldData.requireItem} 아이템이 부족합니다!`);
            window.isAutoCombatActive = false;
            renderFieldList();
            return;
        }
        const newInv = [...playerState.inventory];
        newInv.splice(keyIndex, 1);
        updatePlayerState({ inventory: newInv });
        renderFieldList(); // 열쇠가 0개가 되면 목록 갱신
    }

    updatePlayerState({ fatigue: playerState.fatigue - 5 });
    
    window.combatTurnCount = 0;
    window.currentFieldId = fieldId;
    
    if (selAutoCombat) {
        window.autoCombatMode = selAutoCombat.value;
    } else {
        window.autoCombatMode = 'manual';
    }
    window.isAutoCombatActive = (window.autoCombatMode === 'once' || window.autoCombatMode === 'repeat');

    let totalWeight = 0;
    fieldData.monsters.forEach(m => totalWeight += m.weight);
    
    let rand = Math.random() * totalWeight;
    let selectedMonsterId = fieldData.monsters[0].id;
    
    for (let m of fieldData.monsters) {
        rand -= m.weight;
        if (rand <= 0) {
            selectedMonsterId = m.id;
            break;
        }
    }

    currentMonster = JSON.parse(JSON.stringify(MONSTER_DB[selectedMonsterId]));
    currentMonster.maxHp = currentMonster.hp; 
    
    fieldIdle.style.display = 'none';
    fieldCombat.style.display = 'block';
    if (combatSkillMenu) combatSkillMenu.style.display = 'none';
    
    updateCombatUI();
    combatLog.innerHTML = '';
    addCombatLog(`${fieldData.name}에서 ${currentMonster.name}이(가) 나타났다! 전투 시작! (피로도 5 소모)`, "#f59e0b");
    setCombatButtonsState(false);
    
    if (btnStopAuto) {
        btnStopAuto.style.display = window.isAutoCombatActive ? 'block' : 'none';
    }

    if (window.isAutoCombatActive) {
        addCombatLog("자동 전투를 진행합니다...", "#93c5fd");
        setCombatButtonsState(true);
        setTimeout(() => executePlayerAction(null), 800);
    }
}

window.updateCombatUI = function() {
    updateGlobalBar();
    if (currentMonster) {
        if(combatPlayerName) combatPlayerName.textContent = playerState.name;
        
        const pHp = playerState.currentHp;
        const pMaxHp = playerState.maxHp;
        if(combatPlayerHpText) combatPlayerHpText.textContent = `${pHp}/${pMaxHp}`;
        if(combatPlayerHpBar) combatPlayerHpBar.style.width = `${Math.max(0, (pHp / pMaxHp) * 100)}%`;

        const pMp = playerState.currentMp;
        const pMaxMp = playerState.maxMp;
        if(combatPlayerMpText) combatPlayerMpText.textContent = `${pMp}/${pMaxMp}`;
        if(combatPlayerMpBar) combatPlayerMpBar.style.width = `${Math.max(0, (pMp / pMaxMp) * 100)}%`;

        if(monsterNameDisplay) monsterNameDisplay.textContent = currentMonster.name;
        
        const mHp = Math.max(0, currentMonster.hp);
        const mMaxHp = currentMonster.maxHp || 1;
        if(combatMonsterHpText) combatMonsterHpText.textContent = `${mHp}/${mMaxHp}`;
        if(combatMonsterHpBar) combatMonsterHpBar.style.width = `${Math.max(0, (mHp / mMaxHp) * 100)}%`;
    }
}

function updateGlobalBar() {
    if(!playerState) return;
    if(gHp) gHp.textContent = `${playerState.currentHp}/${playerState.maxHp}`;
    if(gMp) gMp.textContent = `${playerState.currentMp}/${playerState.maxMp}`;
    if(gFatigue) gFatigue.textContent = `${playerState.fatigue}/${playerState.maxFatigue}`;
    if(gGold) gGold.textContent = playerState.gold;
}

function addCombatLog(msg, colorOrClass = "#cbd5e1") {
    const p = document.createElement('p');
    if (colorOrClass.startsWith('#') || colorOrClass.startsWith('rgb')) {
        p.style.color = colorOrClass;
    } else {
        p.className = colorOrClass;
    }
    p.textContent = msg;
    combatLog.appendChild(p);
    combatLog.scrollTop = combatLog.scrollHeight;
}

function setCombatButtonsState(disabled) {
    [btnAttack, btnFlee, btnSkill].forEach(btn => {
        if (btn) {
            btn.disabled = disabled;
            btn.style.opacity = disabled ? '0.5' : '1';
        }
    });
}

function endCombat() {
    currentMonster = null;
    fieldCombat.style.display = 'none';
    fieldIdle.style.display = 'block';
    if (btnStopAuto) btnStopAuto.style.display = 'none';
    if (typeof renderFieldList === 'function') renderFieldList();
}

function getEquipTooltip(item) {
    if (!item) return '';
    let stats = [];
    if (item.attack) stats.push(`공격력 +${item.attack}`);
    if (item.defense) stats.push(`방어력 +${item.defense}`);
    if (item.speed) stats.push(`속도 +${item.speed}`);
    if (item.hp) stats.push(`HP +${item.hp}`);
    if (item.mp) stats.push(`MP +${item.mp}`);
    if (item.str) stats.push(`STR +${item.str}`);
    if (item.agi) stats.push(`AGI +${item.agi}`);
    if (item.dex) stats.push(`DEX +${item.dex}`);
    if (item.vit) stats.push(`VIT +${item.vit}`);
    if (item.int) stats.push(`INT +${item.int}`);
    if (item.luk) stats.push(`LUK +${item.luk}`);
    return `<div class="equip-tooltip"><strong>${item.name}</strong>\n${stats.join('\n')}</div>`;
}

window.renderPlayerStats = function() {
    if (!statsContainer || !playerState) return;
    updateGlobalBar();
    if (!playerState.equippedSkills) playerState.equippedSkills = []; // 호환성
    
    const expPercent = playerState.level >= 10 && playerState.job === "초보자" ? 100 : Math.min(100, (playerState.exp / (playerState.level * 100)) * 100);
    const slotNames = { weapon: '무기', subWeapon: '보조', head: '투구', body: '갑옷', pants: '바지', shoes: '신발', accessory1: '장신구1', accessory2: '장신구2' };
    
    let equipHtml = '';
    for (const slot in slotNames) {
        const item = playerState.equipment[slot];
        equipHtml += `
            <div class="equip-slot" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0px; padding: 6px; background: rgba(0,0,0,0.2); border-radius: 4px; border: 1px solid #334155;">
                <div style="flex: 1; position: relative; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; padding-right: 8px;">
                    <span style="font-size: 12px; color: #94a3b8; display: inline-block; width: 45px;">${slotNames[slot]}</span>
                    <span style="color: ${item ? '#f8fafc' : '#475569'}; font-weight: ${item ? '600' : 'normal'}; font-size: 13px;">${item ? item.name : '없음'}</span>
                    ${item ? getEquipTooltip(item) : ''}
                </div>
                ${item ? `<button class="action-btn danger" style="padding: 2px 6px; font-size: 11px; width: auto; margin: 0; min-width: 32px;" onclick="unequipItem('${slot}')">해제</button>` : ''}
            </div>
        `;
    }

    if (equipmentContainer) {
        equipmentContainer.innerHTML = `
            <div class="stat-section" style="grid-column: span 2; margin-bottom: 4px;">
                <h3 style="font-size: 14px; color: #f59e0b; border-bottom: 1px solid var(--border-color); padding-bottom: 6px;">현재 장착 중인 장비</h3>
            </div>
            ${equipHtml}
        `;
    }

    statsContainer.innerHTML = `
        <div style="grid-column: span 3; display: flex; align-items: center; gap: 16px; margin-bottom: 16px; padding: 16px; background: rgba(15, 23, 42, 0.5); border-radius: 8px; border: 1px solid #334155;">
            <img src="${getAppearanceImageURL(playerState.gender || '남성', playerState.appearance || 1)}" alt="Portrait" style="width: 80px; height: 80px; border-radius: 50%; border: 3px solid ${playerState.gender === '여성' ? '#ec4899' : '#3b82f6'}; box-shadow: 0 4px 6px rgba(0,0,0,0.3); object-fit: cover;">
            <div>
                <div style="font-size: 20px; font-weight: bold; color: #f8fafc; margin-bottom: 4px;">${playerState.name}</div>
                <div style="color: #94a3b8; font-size: 14px;">${playerState.job} | Lv.${playerState.level}</div>
            </div>
        </div>
        <div class="stat-section" style="grid-column: span 3; margin-bottom: 4px;">
            <h3 style="font-size: 14px; color: #3b82f6; border-bottom: 1px solid var(--border-color); padding-bottom: 6px;">기본 정보</h3>
        </div>
        <div class="stat-box"><span class="stat-label">이름</span><span class="stat-value">${playerState.name}</span></div>
        <div class="stat-box"><span class="stat-label">성별</span><span class="stat-value">${playerState.gender || '남성'} (외형${playerState.appearance || 1})</span></div>
        <div class="stat-box"><span class="stat-label">직업</span><span class="stat-value">${playerState.job}</span></div>
        <div class="stat-box" style="grid-column: span 3;">
            <span class="stat-label">경험치 (EXP)</span>
            <span class="stat-value exp">Lv.${playerState.level} (${playerState.exp}/${playerState.level * 100})</span>
            <div style="width: 100%; background: #334155; height: 6px; border-radius: 4px; margin-top: 8px; overflow: hidden;">
                <div style="width: ${expPercent}%; background: #a855f7; height: 100%; transition: width 0.3s ease;"></div>
            </div>
        </div>

        <div class="stat-section" style="grid-column: span 3; margin-top: 8px; margin-bottom: 4px;">
            <h3 style="font-size: 14px; color: #10b981; border-bottom: 1px solid var(--border-color); padding-bottom: 6px;">상태</h3>
        </div>
        <div class="stat-box"><span class="stat-label">HP</span><span class="stat-value health">${playerState.currentHp} / ${playerState.maxHp}</span></div>
        <div class="stat-box"><span class="stat-label">MP</span><span class="stat-value" style="color: #3b82f6;">${playerState.currentMp} / ${playerState.maxMp}</span></div>
        <div class="stat-box"><span class="stat-label">소지금</span><span class="stat-value gold">${playerState.gold} G</span></div>

        <div class="stat-section" style="grid-column: span 3; margin-top: 8px; margin-bottom: 4px;">
            <h3 style="font-size: 14px; color: #f59e0b; border-bottom: 1px solid var(--border-color); padding-bottom: 6px;">기본 스탯</h3>
        </div>
        <div class="stat-box"><span class="stat-label">STR</span><span class="stat-value">${playerState.getTotalStat('str')}</span></div>
        <div class="stat-box"><span class="stat-label">AGI</span><span class="stat-value">${playerState.getTotalStat('agi')}</span></div>
        <div class="stat-box"><span class="stat-label">DEX</span><span class="stat-value">${playerState.getTotalStat('dex')}</span></div>
        <div class="stat-box"><span class="stat-label">VIT</span><span class="stat-value">${playerState.getTotalStat('vit')}</span></div>
        <div class="stat-box"><span class="stat-label">INT</span><span class="stat-value">${playerState.getTotalStat('int')}</span></div>
        <div class="stat-box"><span class="stat-label">LUK</span><span class="stat-value">${playerState.getTotalStat('luk')}</span></div>

        <div class="stat-section" style="grid-column: span 3; margin-top: 8px; margin-bottom: 4px;">
            <h3 style="font-size: 14px; color: #a855f7; border-bottom: 1px solid var(--border-color); padding-bottom: 6px;">전투 능력치</h3>
        </div>
        <div class="stat-box"><span class="stat-label">근접 공격력</span><span class="stat-value">${playerState.meleeAttack}</span></div>
        <div class="stat-box"><span class="stat-label">원거리 공격력</span><span class="stat-value">${playerState.rangedAttack}</span></div>
        <div class="stat-box"><span class="stat-label">마법 공격력</span><span class="stat-value">${playerState.magicAttack}</span></div>
        <div class="stat-box"><span class="stat-label">방어력</span><span class="stat-value">${playerState.defense}</span></div>
        <div class="stat-box"><span class="stat-label">속도</span><span class="stat-value">${playerState.speed}</span></div>
        <div class="stat-box"><span class="stat-label">명중률</span><span class="stat-value">${playerState.accuracy}%</span></div>
        <div class="stat-box"><span class="stat-label">회피율</span><span class="stat-value">${playerState.evasion}%</span></div>
        <div class="stat-box"><span class="stat-label">치명타 확률</span><span class="stat-value">${playerState.critChance}%</span></div>
        <div class="stat-box"><span class="stat-label">치명타 피해</span><span class="stat-value">${playerState.critDamage}%</span></div>
    `;

    // 스킬 관리 섹션 추가
    const jobSkills = JOB_DB[playerState.job] ? JOB_DB[playerState.job].bonusSkills : [];
    
    // 호환성: 이전 직업의 스킬이 equippedSkills에 남아있는 경우 필터링하여 삭제
    const validEquipped = playerState.equippedSkills.filter(s => jobSkills.includes(s.name));
    if (validEquipped.length !== playerState.equippedSkills.length) {
        playerState.equippedSkills = validEquipped;
    }

    let skillHtml = `
        <div class="stat-section" style="grid-column: span 3; margin-top: 16px; margin-bottom: 4px;">
            <h3 style="font-size: 14px; color: #ef4444; border-bottom: 1px solid var(--border-color); padding-bottom: 6px;">스킬 장착 및 발동 확률 설정</h3>
            <div style="font-size: 11px; color: #94a3b8; margin-top: 4px;">
                * 전투 시 설정된 확률에 따라 스킬이 발동되며, 남는 확률은 <strong>[일반 공격]</strong>으로 발동됩니다. (마나 부족 시 일반 공격 대체)
            </div>
        </div>
    `;

    if (!jobSkills || jobSkills.length === 0) {
        skillHtml += `<div style="grid-column: span 3; color: #64748b; font-size: 12px; margin-top: 8px;">현재 보유한 스킬이 없습니다.</div>`;
    } else {
        jobSkills.forEach(skillName => {
            const skillData = SKILL_DB[skillName];
            if (!skillData) return;
            const equipped = playerState.equippedSkills.find(s => s.name === skillName);
            const isEquipped = !!equipped;
            const prob = isEquipped ? equipped.prob : 0;
            
            skillHtml += `
                <div style="grid-column: span 3; display: flex; align-items: center; justify-content: space-between; background: rgba(0,0,0,0.2); border: 1px solid #334155; padding: 8px; border-radius: 4px; margin-top: 4px;">
                    <div style="flex: 1;">
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <input type="checkbox" id="skill-equip-${skillName}" class="skill-equip-cb" data-skill="${skillName}" ${isEquipped ? 'checked' : ''} style="cursor: pointer; width: 16px; height: 16px;">
                            <label for="skill-equip-${skillName}" style="font-weight: 600; font-size: 14px; color: ${isEquipped ? '#f8fafc' : '#94a3b8'}; cursor: pointer;">${skillName}</label>
                        </div>
                        <div style="font-size: 11px; color: #64748b; margin-top: 4px; margin-left: 24px;">${skillData.desc} <span style="color: #3b82f6;">(MP: ${skillData.costMp})</span></div>
                    </div>
                    <div style="display: flex; align-items: center; gap: 4px;">
                        <input type="number" class="skill-prob-input" data-skill="${skillName}" value="${prob}" min="0" max="100" ${!isEquipped ? 'disabled' : ''} style="width: 50px; background: #1e293b; color: #f8fafc; border: 1px solid #475569; border-radius: 4px; padding: 4px; text-align: right;">
                        <span style="color: #94a3b8; font-size: 12px;">%</span>
                    </div>
                </div>
            `;
        });
        
        const totalProb = playerState.equippedSkills.reduce((sum, s) => sum + s.prob, 0);
        let probStatusColor = totalProb > 100 ? '#ef4444' : (totalProb === 100 ? '#10b981' : '#3b82f6');
        skillHtml += `
            <div style="grid-column: span 3; text-align: right; font-size: 12px; margin-top: 8px;">
                <span style="color: #94a3b8;">스킬 발동 총합: </span>
                <strong style="color: ${probStatusColor};">${totalProb}%</strong>
                <span style="color: #64748b; margin-left: 8px;">(일반 공격: ${Math.max(0, 100 - totalProb)}%)</span>
                ${totalProb > 100 ? '<div style="color: #ef4444; margin-top: 4px;">경고: 총합이 100%를 초과했습니다! 초과분은 무시됩니다.</div>' : ''}
            </div>
        `;
    }
    statsContainer.innerHTML += skillHtml;

    // 이벤트 리스너 바인딩 (동적 생성 요소)
    const equipCbs = statsContainer.querySelectorAll('.skill-equip-cb');
    equipCbs.forEach(cb => {
        cb.addEventListener('change', (e) => {
            handleSkillEquipChange(e.target.dataset.skill, e.target.checked);
        });
    });

    const probInputs = statsContainer.querySelectorAll('.skill-prob-input');
    probInputs.forEach(input => {
        input.addEventListener('change', (e) => {
            let val = parseInt(e.target.value) || 0;
            if (val < 0) val = 0;
            if (val > 100) val = 100;
            handleSkillProbChange(e.target.dataset.skill, val);
        });
    });
};

window.handleSkillEquipChange = function(skillName, isChecked) {
    if (!playerState.equippedSkills) playerState.equippedSkills = [];
    let newSkills = [...playerState.equippedSkills];
    
    if (isChecked) {
        if (!newSkills.find(s => s.name === skillName)) {
            newSkills.push({ name: skillName, prob: 0 });
        }
    } else {
        newSkills = newSkills.filter(s => s.name !== skillName);
    }
    updatePlayerState({ equippedSkills: newSkills });
};

window.handleSkillProbChange = function(skillName, prob) {
    if (!playerState.equippedSkills) playerState.equippedSkills = [];
    let newSkills = [...playerState.equippedSkills];
    let skill = newSkills.find(s => s.name === skillName);
    if (skill) {
        skill.prob = prob;
        updatePlayerState({ equippedSkills: newSkills });
    }
};

// 인벤토리 렌더링
window.renderInventory = function() {
    if (!inventoryList) return;
    inventoryList.innerHTML = '';
    
    const groupedInventory = [];
    playerState.inventory.forEach((item, originalIndex) => {
        if (!item) return;
        
        if (item.type === 'consumable' || item.type === 'material') {
            const existing = groupedInventory.find(g => g.item.name === item.name);
            if (existing) {
                existing.count++;
                existing.indices.push(originalIndex);
            } else {
                groupedInventory.push({ item, count: 1, indices: [originalIndex] });
            }
        } else {
            groupedInventory.push({ item, count: 1, indices: [originalIndex] });
        }
    });
    
    groupedInventory.forEach((group) => {
        const item = group.item;
        const count = group.count;
        const targetIndex = group.indices[0];
        
        // 카테고리 필터링
        if (currentInvFilter !== 'all') {
            const isEquip = ['weapon', 'body', 'head', 'shoes', 'pants', 'subWeapon'].includes(item.type) || item.type.startsWith('accessory');
            if (currentInvFilter === 'equip' && !isEquip) return;
            if (currentInvFilter === 'consumable' && item.type !== 'consumable') return;
            if (currentInvFilter === 'material' && item.type !== 'material') return;
            if (currentInvFilter === 'event' && item.type !== 'event') return;
        }

        const div = document.createElement('div');
        div.style.display = 'flex';
        div.style.justifyContent = 'space-between';
        div.style.alignItems = 'center';
        div.style.padding = '8px';
        div.style.background = 'rgba(0,0,0,0.3)';
        div.style.border = '1px solid #334155';
        div.style.borderRadius = '4px';

        let btnHtml = '';
        const isEquip = ['weapon', 'body', 'head', 'shoes', 'pants', 'subWeapon'].includes(item.type) || item.type.startsWith('accessory');
        if (isEquip) {
            btnHtml = `<button class="action-btn" style="padding: 4px 8px; font-size: 12px; width: auto;" onclick="equipItem(${targetIndex})">장착</button>`;
        } else if (item.type === 'consumable') {
            btnHtml = `<button class="action-btn" style="padding: 4px 8px; font-size: 12px; width: auto; border-color: #10b981; color: #6ee7b7;" onclick="useItem(${targetIndex})">사용</button>`;
        }

        const displayName = count > 1 ? `${item.name} <span style="color: #fcd34d; font-size: 13px;">x ${count}</span>` : item.name;

        div.innerHTML = `
            <div>
                <div style="font-weight: 600; font-size: 14px; color: #f8fafc;">${displayName}</div>
                <div style="font-size: 12px; color: #94a3b8;">${item.desc}</div>
            </div>
            <div>${btnHtml}</div>
        `;
        inventoryList.appendChild(div);
    });
};

// 아이템 장착 로직
window.equipItem = function(index) {
    const item = playerState.inventory[index];
    let slot = item.type;
    
    // accessory 처리 (비어있는 곳 우선)
    if (slot.startsWith('accessory')) {
        if (!playerState.equipment.accessory1) slot = 'accessory1';
        else if (!playerState.equipment.accessory2) slot = 'accessory2';
        else slot = 'accessory1'; // 기본 덮어쓰기
    }
    
    const newEquip = { ...playerState.equipment };
    const newInv = [...playerState.inventory];
    
    // 인벤토리에서 제거
    newInv.splice(index, 1);
    
    // 장착 칸에 이미 아이템이 있다면 인벤토리로 반환
    if (newEquip[slot]) {
        newInv.push(newEquip[slot]);
    }
    
    // 새 아이템 장착
    newEquip[slot] = item;
    
    updatePlayerState({ equipment: newEquip, inventory: newInv });
    renderInventory();
    renderPlayerStats();
};

// 아이템 해제 로직
window.unequipItem = function(slot) {
    const item = playerState.equipment[slot];
    if (!item) return;
    
    const newEquip = { ...playerState.equipment };
    const newInv = [...playerState.inventory];
    
    newEquip[slot] = null;
    newInv.push(item);
    
    updatePlayerState({ equipment: newEquip, inventory: newInv });
    renderInventory();
    renderPlayerStats();
};

// 소모품 사용 로직
window.useItem = function(index) {
    const item = playerState.inventory[index];
    const newInv = [...playerState.inventory];
    newInv.splice(index, 1);

    if (item.healHp) {
        const hp = Math.min(playerState.maxHp, playerState.currentHp + item.healHp);
        updatePlayerState({ currentHp: hp, inventory: newInv });
        alert(`${item.name}을(를) 사용하여 체력을 회복했습니다.`);
    } else if (item.healMp) {
        const mp = Math.min(playerState.maxMp, playerState.currentMp + item.healMp);
        updatePlayerState({ currentMp: mp, inventory: newInv });
        alert(`${item.name}을(를) 사용하여 마나를 회복했습니다.`);
    }
    renderInventory();
    renderPlayerStats();
};

// 창고 UI 렌더링
window.renderWarehouse = function() {
    if (!warehouseInvList || !warehouseStorageList) return;
    const accId = sessionStorage.getItem('lastAccount');
    const db = DB.load();
    const warehouse = db.accounts[accId].warehouse || [];

    warehouseInvList.innerHTML = '';
    const groupedInv = [];
    playerState.inventory.forEach((item, index) => {
        if (!item) return;
        if (item.type === 'consumable' || item.type === 'material') {
            const existing = groupedInv.find(g => g.item.name === item.name);
            if (existing) {
                existing.count++;
                existing.indices.push(index);
            } else {
                groupedInv.push({ item, count: 1, indices: [index] });
            }
        } else {
            groupedInv.push({ item, count: 1, indices: [index] });
        }
    });

    groupedInv.forEach((group) => {
        const item = group.item;
        const count = group.count;
        const targetIndex = group.indices[0];
        const displayName = count > 1 ? `${item.name} (x${count})` : item.name;

        const div = document.createElement('div');
        div.className = 'action-btn';
        div.style.padding = '6px 8px';
        div.style.fontSize = '12px';
        div.style.textAlign = 'left';
        div.style.display = 'flex';
        div.style.justifyContent = 'space-between';
        div.innerHTML = `<span>${displayName}</span> <span style="color:#94a3b8;">▶ 보관</span>`;
        div.addEventListener('click', () => storeInWarehouse(targetIndex));
        warehouseInvList.appendChild(div);
    });

    warehouseStorageList.innerHTML = '';
    const groupedWh = [];
    warehouse.forEach((item, index) => {
        if (!item) return;
        if (item.type === 'consumable' || item.type === 'material') {
            const existing = groupedWh.find(g => g.item.name === item.name);
            if (existing) {
                existing.count++;
                existing.indices.push(index);
            } else {
                groupedWh.push({ item, count: 1, indices: [index] });
            }
        } else {
            groupedWh.push({ item, count: 1, indices: [index] });
        }
    });

    groupedWh.forEach((group) => {
        const item = group.item;
        const count = group.count;
        const targetIndex = group.indices[0];
        const displayName = count > 1 ? `${item.name} (x${count})` : item.name;

        const div = document.createElement('div');
        div.className = 'action-btn';
        div.style.padding = '6px 8px';
        div.style.fontSize = '12px';
        div.style.textAlign = 'left';
        div.style.display = 'flex';
        div.style.justifyContent = 'space-between';
        div.innerHTML = `<span style="color:#94a3b8;">◀ 꺼내기</span> <span>${displayName}</span>`;
        div.addEventListener('click', () => takeFromWarehouse(targetIndex));
        warehouseStorageList.appendChild(div);
    });
};

// 창고 보관 로직
window.storeInWarehouse = function(index) {
    const item = playerState.inventory[index];
    const accId = sessionStorage.getItem('lastAccount');
    const db = DB.load();
    if (!db.accounts[accId].warehouse) db.accounts[accId].warehouse = [];
    db.accounts[accId].warehouse.push(item);
    DB.save(db);

    const newInv = [...playerState.inventory];
    newInv.splice(index, 1);
    updatePlayerState({ inventory: newInv });
    renderWarehouse();
};

// 창고 꺼내기 로직
window.takeFromWarehouse = function(index) {
    const accId = sessionStorage.getItem('lastAccount');
    const db = DB.load();
    if (!db.accounts[accId].warehouse) return;
    const item = db.accounts[accId].warehouse[index];
    db.accounts[accId].warehouse.splice(index, 1);
    DB.save(db);

    const newInv = [...playerState.inventory];
    newInv.push(item);
    updatePlayerState({ inventory: newInv });
    renderWarehouse();
};

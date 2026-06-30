// DOM 요소를 전역적으로 캐싱
let tabBtns, views, statsContainer;
let btnInn, btnChurch, btnShop, btnGuild, btnWarrior, btnMage, btnArcher, btnStatReset, guildMenu;
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
    btnWarrior = document.getElementById('btn-job-warrior');
    btnMage = document.getElementById('btn-job-mage');
    btnArcher = document.getElementById('btn-job-archer');
    btnStatReset = document.getElementById('btn-stat-reset');
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

    // --- 마을 내비게이션 로직 ---
    const townNavBtns = document.querySelectorAll('.town-nav-btn');
    const townMain = document.getElementById('town-main');
    const townSubviews = document.querySelectorAll('.town-subview');
    const btnBackToTown = document.getElementById('btn-back-to-town');

    townNavBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.dataset.target;
            townMain.style.display = 'none';
            townSubviews.forEach(view => view.style.display = 'none');
            document.getElementById(targetId).style.display = 'block';
            btnBackToTown.style.display = 'block';
            
            if (targetId === 'town-warehouse') renderWarehouse();
            if (targetId === 'town-sell') renderShopSellList();
            if (targetId === 'town-weapon') renderShopCategoryList('weapon', 'shop-weapon-list');
            if (targetId === 'town-armor') renderShopCategoryList('body', 'shop-armor-list');
            if (targetId === 'town-consumable') renderShopCategoryList('consumable', 'shop-consumable-list');
        });
    });

    if (btnBackToTown) {
        btnBackToTown.addEventListener('click', () => {
            townSubviews.forEach(view => view.style.display = 'none');
            btnBackToTown.style.display = 'none';
            townMain.style.display = 'block';
        });
    }

    // --- 여관 기능 ---
    const btnInnRest = document.getElementById('btn-inn-rest');
    if (btnInnRest) {
        // 비용: 레벨 * 5
        btnInnRest.textContent = `휴식 (${(playerState.level || 1) * 5}G)`;
        btnInnRest.addEventListener('click', () => {
            const cost = (playerState.level || 1) * 5;
            if (playerState.gold >= cost) {
                if (playerState.currentHp === playerState.maxHp && playerState.currentMp === playerState.maxMp) {
                    alert("이미 체력과 마력이 가득 찼습니다.");
                    return;
                }
                updatePlayerState({
                    gold: playerState.gold - cost,
                    currentHp: playerState.maxHp,
                    currentMp: playerState.maxMp
                });
                alert(`${cost}G를 지불하고 체력과 마력을 모두 회복했습니다.`);
            } else {
                alert("골드가 부족합니다.");
            }
        });
    }

    const btnInnMeals = document.querySelectorAll('.btn-inn-meal');
    btnInnMeals.forEach(btn => {
        btn.addEventListener('click', () => {
            const mealType = btn.dataset.meal;
            let cost = 0;
            let buffDesc = "";
            let buffData = null;

            if (mealType === 'bbq') {
                cost = 100; buffDesc = "물리/마법 공격력 10% 증가"; buffData = { type: 'bbq', stat: 'atk', amount: 0.1 };
            } else if (mealType === 'salad') {
                cost = 80; buffDesc = "명중률/회피율 10 증가"; buffData = { type: 'salad', stat: 'acc_eva', amount: 10 };
            } else if (mealType === 'stew') {
                cost = 150; buffDesc = "획득 경험치 15% 증가"; buffData = { type: 'stew', stat: 'exp', amount: 0.15 };
            }

            if (playerState.gold >= cost) {
                updatePlayerState({
                    gold: playerState.gold - cost,
                    mealBuff: { ...buffData, count: 10 }
                });
                alert(`식사를 마쳤습니다! 10번의 전투 동안 [${buffDesc}] 효과가 적용됩니다.`);
            } else {
                alert("골드가 부족합니다.");
            }
        });
    });

    // --- 성당 기능 ---
    const btnChurchHeal = document.getElementById('btn-church-heal');
    if (btnChurchHeal) {
        // 비용: 레벨 * 20
        btnChurchHeal.textContent = `가호 받기 (${(playerState.level || 1) * 20}G)`;
        btnChurchHeal.addEventListener('click', () => {
            const cost = (playerState.level || 1) * 20;
            if (playerState.gold >= cost) {
                updatePlayerState({
                    gold: playerState.gold - cost,
                    fatigue: playerState.fatigue + 100
                });
                alert(`여신의 가호를 받아 피로도가 100 증가했습니다! (${cost}G 소모)`);
            } else {
                alert("골드가 부족합니다.");
            }
        });
    }

    // --- 상점 기능 ---

    // (Static buy logic removed)

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
            playerState.skills = {};
            playerState.equippedSkills = [];
            updatePlayerState({ job: "검사", jobLevel: 1, jobExp: 0, skills: playerState.skills, equippedSkills: playerState.equippedSkills });
            guildMenu.style.display = 'none';
            alert(`검사로 전직했습니다! ${jobData.desc}`);
        });
    }

    if (btnMage) {
        btnMage.addEventListener('click', () => {
            const jobData = JOB_DB["마법사"];
            playerState.skills = {};
            playerState.equippedSkills = [];
            updatePlayerState({ job: "마법사", jobLevel: 1, jobExp: 0, skills: playerState.skills, equippedSkills: playerState.equippedSkills });
            guildMenu.style.display = 'none';
            alert(`마법사로 전직했습니다! ${jobData.desc}`);
        });
    }

    if (btnArcher) {
        btnArcher.addEventListener('click', () => {
            const jobData = JOB_DB["궁수"];
            playerState.skills = {};
            playerState.equippedSkills = [];
            updatePlayerState({ job: "궁수", jobLevel: 1, jobExp: 0, skills: playerState.skills, equippedSkills: playerState.equippedSkills });
            guildMenu.style.display = 'none';
            alert(`궁수로 전직했습니다! ${jobData.desc}`);
        });
    }

    if (btnStatReset) {
        btnStatReset.addEventListener('click', () => {
            if (confirm("정말로 스탯을 모두 초기화하시겠습니까? 포인트가 전부 반환됩니다.")) {
                playerState.baseStats = { str: 1, agi: 1, dex: 1, vit: 1, int: 1, luk: 1 };
                playerState.statPoints = EXP_DB.getAccumulatedStatPoints(playerState.level);
                updatePlayerState({ baseStats: playerState.baseStats, statPoints: playerState.statPoints });
                alert("스탯이 모두 초기화되었습니다!");
                if (typeof renderPlayerStats === 'function') renderPlayerStats();
            }
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
    if (targetId !== 'field' && typeof currentMonster !== 'undefined' && currentMonster) {
        window.isAutoCombatActive = false;
        window.autoCombatMode = 'manual';
        if (typeof endCombat === 'function') endCombat();
    }
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
            <div style="flex: 1; padding-right: 12px;">
                <div style="font-weight: bold; font-size: 15px; color: ${nameColor}; margin-bottom: 4px;">${field.name}</div>
                <div style="font-size: 12px; color: #94a3b8; line-height: 1.4;">${field.desc}</div>
                <div style="font-size: 11px; color: #64748b; margin-top: 4px;">권장 레벨: ${field.reqLevel || 1}</div>
            </div>
            <div style="flex-shrink: 0;">
                <button class="action-btn ${btnDisabled ? '' : 'danger'}" style="padding: 8px 16px; font-size: 13px; width: auto; white-space: nowrap; ${btnDisabled ? 'opacity: 0.5; cursor: not-allowed;' : ''}" ${btnDisabled ? 'disabled' : ''}>${btnText}</button>
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

function getItemTooltipText(item) {
    if (!item) return '';
    let stats = [];
    if (item.attack) stats.push(`공격력 +${item.attack}`);
    if (item.magicAttack) stats.push(`마법 공격력 +${item.magicAttack}`);
    if (item.rangedAttack) stats.push(`원거리 공격력 +${item.rangedAttack}`);
    if (item.defense) stats.push(`방어력 +${item.defense}`);
    if (item.speed) stats.push(`속도 +${item.speed}`);
    if (item.hp || item.maxHp) stats.push(`HP +${item.hp || item.maxHp}`);
    if (item.mp || item.maxMp) stats.push(`MP +${item.mp || item.maxMp}`);
    if (item.str) stats.push(`STR +${item.str}`);
    if (item.agi) stats.push(`AGI +${item.agi}`);
    if (item.dex) stats.push(`DEX +${item.dex}`);
    if (item.vit) stats.push(`VIT +${item.vit}`);
    if (item.int) stats.push(`INT +${item.int}`);
    if (item.luk) stats.push(`LUK +${item.luk}`);
    if (item.healHp) stats.push(`HP 회복: ${item.healHp}`);
    if (item.healMp) stats.push(`MP 회복: ${item.healMp}`);
    
    let text = `${item.name}${item.subType ? ` [${item.subType}]` : ''}\n${item.desc}`;
    if (stats.length > 0) {
        text += `\n\n[상세 정보]\n` + stats.join('\n');
    }
    
    // 이스케이프 처리 (큰따옴표)
    return text.replace(/"/g, '&quot;');
}

window.renderPlayerStats = function() {
    if (!statsContainer || !playerState) return;
    updateGlobalBar();
    if (!playerState.equippedSkills) playerState.equippedSkills = []; // 호환성
    
    const baseReq = EXP_DB.getRequiredExp(playerState.level);
    const baseExpPercent = playerState.level >= 100 ? 100 : Math.min(100, (playerState.exp / baseReq) * 100);
    
    const jobData = JOB_DB[playerState.job];
    const maxJobLevel = jobData ? jobData.maxLevel : 10;
    const jobReq = EXP_DB.getRequiredJobExp(playerState.jobLevel);
    const jobExpPercent = playerState.jobLevel >= maxJobLevel ? 100 : Math.min(100, ((playerState.jobExp || 0) / jobReq) * 100);
    
    const slotNames = { weapon: '무기', subWeapon: '보조', head: '투구', body: '갑옷', pants: '바지', shoes: '신발', accessory1: '장신구1', accessory2: '장신구2' };
    
    let equipHtml = '';
    for (const slot in slotNames) {
        const item = playerState.equipment[slot];
        equipHtml += `
            <div class="equip-slot" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0px; padding: 6px; background: rgba(0,0,0,0.2); border-radius: 4px; border: 1px solid #334155;" title="${item ? getItemTooltipText(item) : ''}">
                <div style="flex: 1; position: relative; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; padding-right: 8px;">
                    <span style="font-size: 12px; color: #94a3b8; display: inline-block; width: 45px;">${slotNames[slot]}</span>
                    <span style="color: ${item ? '#f8fafc' : '#475569'}; font-weight: ${item ? '600' : 'normal'}; font-size: 13px;">${item ? item.name : '없음'}</span>
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

    const getStatHtml = (statKey, statLabel) => {
        const total = playerState.getTotalStat(statKey);
        const base = playerState.baseStats[statKey];
        const jobBonus = playerState.getJobBonus(statKey);
        const equipBonus = playerState.getEquipBonus(statKey);
        const cost = EXP_DB.getStatUpgradeCost(base);
        const canUpgrade = base < 100 && (playerState.statPoints || 0) >= cost;
        
        let btnHtml = '';
        if (base < 100) {
            btnHtml = `<button class="action-btn stat-up-btn" data-stat="${statKey}" style="width: 100%; padding: 6px; font-size: 11px; margin: 0; ${canUpgrade ? 'border-color: #10b981; color: #6ee7b7;' : 'opacity: 0.3; cursor: not-allowed;'}" ${canUpgrade ? '' : 'disabled'}>+ 1 UP (비용: ${cost})</button>`;
        } else {
            btnHtml = `<button class="action-btn" style="width: 100%; padding: 6px; font-size: 11px; margin: 0; opacity: 0.5; border-color: #ef4444; color: #ef4444;" disabled>(MAX)</button>`;
        }
        
        let details = `순수 ${base}`;
        if (jobBonus > 0) details += ` <span style="color: #3b82f6;">+${jobBonus}(직업)</span>`;
        if (equipBonus > 0) details += ` <span style="color: #10b981;">+${equipBonus}(장비)</span>`;

        return `<div style="background: rgba(15, 23, 42, 0.6); border: 1px solid #334155; border-radius: 6px; padding: 10px; display: flex; flex-direction: column; justify-content: space-between;">
            <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 4px;">
                <span style="font-weight: bold; color: #f8fafc; font-size: 14px;">${statLabel}</span>
                <span style="font-weight: bold; color: #f59e0b; font-size: 15px;">총합 ${total}</span>
            </div>
            <div style="font-size: 11px; color: #94a3b8; margin-bottom: 8px;">
                ${details}
            </div>
            ${btnHtml}
        </div>`;
    };

    let statBoxesHtml = `
        <div class="stat-section" style="grid-column: span 3; margin-top: 8px; margin-bottom: 4px; display: flex; justify-content: space-between; align-items: baseline;">
            <h3 style="font-size: 14px; color: #f59e0b; border-bottom: 1px solid var(--border-color); padding-bottom: 6px; margin: 0; width: 100%;">기본 스탯 <span style="font-size: 12px; color: #94a3b8; float: right;">잔여 포인트: <span style="color: #10b981; font-weight: bold;">${playerState.statPoints || 0}</span></span></h3>
        </div>
        <div style="grid-column: span 3; display: grid; grid-template-columns: 1fr 1fr; gap: 8px; width: 100%;">
            ${getStatHtml('str', 'STR')}
            ${getStatHtml('agi', 'AGI')}
            ${getStatHtml('dex', 'DEX')}
            ${getStatHtml('vit', 'VIT')}
            ${getStatHtml('int', 'INT')}
            ${getStatHtml('luk', 'LUK')}
        </div>
    `;

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
        <div class="stat-box" style="grid-column: span 3; display: flex; flex-direction: column;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <span class="stat-label">베이스 경험치</span>
                <span class="stat-value exp">Lv.${playerState.level} (${playerState.exp}/${baseReq})</span>
            </div>
            <div style="width: 100%; background: #334155; height: 6px; border-radius: 4px; margin-top: 8px; margin-bottom: 8px; overflow: hidden;">
                <div style="width: ${baseExpPercent}%; background: #a855f7; height: 100%; transition: width 0.3s ease;"></div>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px;">
                <span class="stat-label">잡 경험치</span>
                <span class="stat-value" style="color: #6ee7b7;">JobLv.${playerState.jobLevel} (${playerState.jobExp || 0}/${jobReq})</span>
            </div>
            <div style="width: 100%; background: #334155; height: 6px; border-radius: 4px; margin-top: 8px; overflow: hidden;">
                <div style="width: ${jobExpPercent}%; background: #10b981; height: 100%; transition: width 0.3s ease;"></div>
            </div>
        </div>

        <div class="stat-section" style="grid-column: span 3; margin-top: 8px; margin-bottom: 4px;">
            <h3 style="font-size: 14px; color: #10b981; border-bottom: 1px solid var(--border-color); padding-bottom: 6px;">상태</h3>
        </div>
        <div class="stat-box"><span class="stat-label">HP</span><span class="stat-value health">${playerState.currentHp} / ${playerState.maxHp}</span></div>
        <div class="stat-box"><span class="stat-label">MP</span><span class="stat-value" style="color: #3b82f6;">${playerState.currentMp} / ${playerState.maxMp}</span></div>
        <div class="stat-box"><span class="stat-label">소지금</span><span class="stat-value gold">${playerState.gold} G</span></div>

        ${statBoxesHtml}

        <div class="stat-section" style="grid-column: span 3; margin-top: 8px; margin-bottom: 4px;">
            <h3 style="font-size: 14px; color: #a855f7; border-bottom: 1px solid var(--border-color); padding-bottom: 6px;">전투 능력치</h3>
        </div>
        <div style="grid-column: span 3; display: grid; grid-template-columns: 1fr 1fr; gap: 8px; width: 100%;">
            <div class="stat-box" style="margin:0;"><span class="stat-label">근접 공격력</span><span class="stat-value">${playerState.meleeAttack}</span></div>
            <div class="stat-box" style="margin:0;"><span class="stat-label">원거리 공격력</span><span class="stat-value">${playerState.rangedAttack}</span></div>
            <div class="stat-box" style="margin:0;"><span class="stat-label">마법 공격력</span><span class="stat-value">${playerState.magicAttack}</span></div>
            <div class="stat-box" style="margin:0;"><span class="stat-label">방어력</span><span class="stat-value">${playerState.defense}</span></div>
            <div class="stat-box" style="margin:0;"><span class="stat-label">속도</span><span class="stat-value">${playerState.speed}</span></div>
            <div class="stat-box" style="margin:0;"><span class="stat-label">명중률</span><span class="stat-value">${playerState.accuracy}%</span></div>
            <div class="stat-box" style="margin:0;"><span class="stat-label">회피율</span><span class="stat-value">${playerState.evasion}%</span></div>
            <div class="stat-box" style="margin:0;"><span class="stat-label">치명타 확률</span><span class="stat-value">${playerState.critChance}%</span></div>
            <div class="stat-box" style="margin:0; grid-column: span 2;"><span class="stat-label">치명타 피해</span><span class="stat-value">${playerState.critDamage}%</span></div>
        </div>
    `;

    // 스킬 관리 섹션 추가
    const jobSkills = JOB_DB[playerState.job] ? JOB_DB[playerState.job].bonusSkills : [];
    
    // 호환성: 이전 객체 형태면 문자열로 변환 (state.js에서 했겠지만 혹시 몰라서 추가)
    if (playerState.equippedSkills.length > 0 && typeof playerState.equippedSkills[0] === 'object') {
        playerState.equippedSkills = playerState.equippedSkills.map(s => s.name);
    }

    // 호환성: 이전 직업의 스킬이 equippedSkills에 남아있는 경우 필터링하여 삭제
    const validEquipped = playerState.equippedSkills.filter(sName => jobSkills.includes(sName));
    if (validEquipped.length !== playerState.equippedSkills.length) {
        playerState.equippedSkills = validEquipped;
    }

    let skillTreeHtml = `
        <div class="stat-section" style="grid-column: span 3; margin-top: 16px; margin-bottom: 4px;">
            <h3 style="font-size: 14px; color: #fcd34d; border-bottom: 1px solid var(--border-color); padding-bottom: 6px; display: flex; justify-content: space-between;">
                <span>스킬 트리 (배우기)</span>
                <span style="font-size: 12px; color: #94a3b8;">잔여 SP: <span style="color: #10b981; font-weight: bold;">${playerState.skillPoints || 0}</span></span>
            </h3>
        </div>
        <div style="grid-column: span 3; display: flex; flex-direction: column; gap: 8px; width: 100%;">
    `;
    
    if (jobSkills && jobSkills.length > 0) {
        jobSkills.forEach(skillName => {
            const skillData = SKILL_DB[skillName];
            if (!skillData) return;
            const level = playerState.skills[skillName] || 0;
            const maxLevel = skillData.maxLevel || 10;
            
            // 선행 스킬 체크
            let reqMet = true;
            let reqText = '';
            if (skillData.reqSkills && Object.keys(skillData.reqSkills).length > 0) {
                const reqs = [];
                for (let rSkill in skillData.reqSkills) {
                    const rLevel = skillData.reqSkills[rSkill];
                    const currentRLevel = playerState.skills[rSkill] || 0;
                    if (currentRLevel < rLevel) reqMet = false;
                    reqs.push(`${rSkill} Lv.${rLevel}`);
                }
                reqText = `(선행: ${reqs.join(', ')})`;
            }
            
            const canUpgrade = level < maxLevel && (playerState.skillPoints || 0) > 0 && reqMet;
            let btnHtml = '';
            if (level < maxLevel) {
                btnHtml = `<button class="action-btn skill-up-btn" data-skill="${skillName}" style="padding: 4px 8px; font-size: 11px; width: auto; min-width: 60px; margin: 0; ${canUpgrade ? 'border-color: #10b981; color: #6ee7b7;' : 'opacity: 0.3; cursor: not-allowed;'}" ${canUpgrade ? '' : 'disabled'}>+ 1 UP</button>`;
            } else {
                btnHtml = `<button class="action-btn" style="padding: 4px 8px; font-size: 11px; width: auto; min-width: 60px; margin: 0; opacity: 0.5; border-color: #ef4444; color: #ef4444;" disabled>MAX</button>`;
            }
            
            let colorTitle = level > 0 ? '#f8fafc' : '#94a3b8';
            if (skillData.type === 'passive') colorTitle = '#a78bfa'; // 패시브 스킬 보라색 표시

            skillTreeHtml += `
                <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid #334155; border-radius: 6px; padding: 10px; display: flex; justify-content: space-between; align-items: center;">
                    <div style="flex: 1;">
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <span style="font-weight: bold; color: ${colorTitle}; font-size: 14px;">${skillName}</span>
                            <span style="font-size: 12px; color: ${level >= maxLevel ? '#f59e0b' : '#3b82f6'};">Lv.${level} / ${maxLevel}</span>
                        </div>
                        <div style="font-size: 11px; color: #94a3b8; margin-top: 4px;">
                            ${skillData.desc}
                            ${reqText ? `<div style="color: ${reqMet ? '#10b981' : '#ef4444'}; margin-top: 2px;">${reqText}</div>` : ''}
                        </div>
                    </div>
                    <div>
                        ${btnHtml}
                    </div>
                </div>
            `;
        });
    } else {
        skillTreeHtml += `<div style="color: #64748b; font-size: 12px;">현재 직업은 스킬 트리가 없습니다.</div>`;
    }
    skillTreeHtml += `</div>`;
    statsContainer.innerHTML += skillTreeHtml;

    let skillHtml = `
        <div class="stat-section" style="grid-column: span 3; margin-top: 24px; margin-bottom: 4px;">
            <h3 style="font-size: 14px; color: #ef4444; border-bottom: 1px solid var(--border-color); padding-bottom: 6px;">자동 사냥 스킬 우선순위 설정</h3>
            <div style="font-size: 11px; color: #94a3b8; margin-top: 4px;">
                * 위쪽에 있을수록 우선적으로 사용합니다. (마나, 쿨타임, 버프 상태를 자동으로 판단합니다.)<br>
                * 우선순위에 등록되지 않거나 모두 조건이 안 될 경우 <strong>[일반 공격]</strong>이 나갑니다.
            </div>
        </div>
    `;

    if (!jobSkills || jobSkills.length === 0) {
        skillHtml += `<div style="grid-column: span 3; color: #64748b; font-size: 12px; margin-top: 8px;">현재 보유한 스킬이 없습니다.</div>`;
    } else {
        // 등록된 스킬들을 순서대로 먼저 표시
        playerState.equippedSkills.forEach((skillName, index) => {
            const skillData = SKILL_DB[skillName];
            if (!skillData) return;
            const level = playerState.skills[skillName] || 1;
            const costMp = skillData.getCostMp ? skillData.getCostMp(level) : 0;
            
            skillHtml += `
                <div style="grid-column: span 3; display: flex; align-items: center; justify-content: space-between; background: rgba(0,0,0,0.2); border: 1px solid #3b82f6; padding: 8px; border-radius: 4px; margin-top: 4px;">
                    <div style="flex: 1;">
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <input type="checkbox" id="skill-equip-${skillName}" class="skill-equip-cb" data-skill="${skillName}" checked style="cursor: pointer; width: 16px; height: 16px;">
                            <label for="skill-equip-${skillName}" style="font-weight: 600; font-size: 14px; color: #60a5fa; cursor: pointer;">[${index + 1}순위] ${skillName} Lv.${level}</label>
                        </div>
                        <div style="font-size: 11px; color: #94a3b8; margin-top: 4px; margin-left: 24px;">${skillData.desc} <span style="color: #3b82f6;">(MP: ${costMp})</span></div>
                    </div>
                    <div style="display: flex; align-items: center; gap: 4px;">
                        <button class="action-btn skill-move-btn" data-skill="${skillName}" data-dir="up" style="padding: 4px 8px; font-size: 12px; width: auto;" ${index === 0 ? 'disabled' : ''}>▲</button>
                        <button class="action-btn skill-move-btn" data-skill="${skillName}" data-dir="down" style="padding: 4px 8px; font-size: 12px; width: auto;" ${index === playerState.equippedSkills.length - 1 ? 'disabled' : ''}>▼</button>
                    </div>
                </div>
            `;
        });
        
        // 미등록 스킬들 표시
        jobSkills.forEach(skillName => {
            if (playerState.equippedSkills.includes(skillName)) return; // 이미 등록됨
            const skillData = SKILL_DB[skillName];
            if (!skillData || skillData.type === 'passive') return; // 패시브 스킬은 자동 등록 목록에서 제외
            const level = playerState.skills[skillName];
            if (!level) return; // 배우지 않은 스킬은 자동 스킬 목록에서 제외
            
            const costMp = skillData.getCostMp ? skillData.getCostMp(level) : 0;
            
            skillHtml += `
                <div style="grid-column: span 3; display: flex; align-items: center; justify-content: space-between; background: rgba(0,0,0,0.2); border: 1px solid #334155; padding: 8px; border-radius: 4px; margin-top: 4px;">
                    <div style="flex: 1;">
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <input type="checkbox" id="skill-equip-${skillName}" class="skill-equip-cb" data-skill="${skillName}" style="cursor: pointer; width: 16px; height: 16px;">
                            <label for="skill-equip-${skillName}" style="font-weight: 600; font-size: 14px; color: #94a3b8; cursor: pointer;">${skillName} Lv.${level}</label>
                        </div>
                        <div style="font-size: 11px; color: #64748b; margin-top: 4px; margin-left: 24px;">${skillData.desc} <span style="color: #3b82f6;">(MP: ${costMp})</span></div>
                    </div>
                </div>
            `;
        });
    }
    statsContainer.innerHTML += skillHtml;

    // 이벤트 리스너 바인딩 (동적 생성 요소)
    const equipCbs = statsContainer.querySelectorAll('.skill-equip-cb');
    equipCbs.forEach(cb => {
        cb.addEventListener('change', (e) => {
            handleSkillEquipChange(e.target.dataset.skill, e.target.checked);
        });
    });

    const moveBtns = statsContainer.querySelectorAll('.skill-move-btn');
    moveBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            handleSkillPriorityChange(e.target.dataset.skill, e.target.dataset.dir);
        });
    });

    const statUpBtns = statsContainer.querySelectorAll('.stat-up-btn');
    statUpBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const statKey = e.target.dataset.stat;
            upgradeStat(statKey);
        });
    });
    
    const skillUpBtns = statsContainer.querySelectorAll('.skill-up-btn');
    skillUpBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const skillName = e.target.dataset.skill;
            upgradeSkill(skillName);
        });
    });
};

window.upgradeSkill = function(skillName) {
    if (!playerState || playerState.skillPoints <= 0) return;
    const skillData = SKILL_DB[skillName];
    if (!skillData) return;
    
    const level = playerState.skills[skillName] || 0;
    if (level >= (skillData.maxLevel || 10)) return;
    
    if (skillData.req) {
        for (let rSkill in skillData.req) {
            const rLevel = skillData.req[rSkill];
            if ((playerState.skills[rSkill] || 0) < rLevel) return;
        }
    }
    
    const newSkills = { ...playerState.skills };
    newSkills[skillName] = level + 1;
    updatePlayerState({ skills: newSkills });
};

window.upgradeStat = function(statKey) {
    if (!playerState) return;
    const base = playerState.baseStats[statKey];
    if (base >= 100) return;
    
    const cost = EXP_DB.getStatUpgradeCost(base);
    if ((playerState.statPoints || 0) >= cost) {
        const newStats = { ...playerState.baseStats };
        newStats[statKey] += 1;
        updatePlayerState({
            baseStats: newStats,
            statPoints: playerState.statPoints - cost
        });
    }
};

window.handleSkillEquipChange = function(skillName, isChecked) {
    if (!playerState.equippedSkills) playerState.equippedSkills = [];
    let newSkills = [...playerState.equippedSkills];
    
    if (isChecked) {
        if (!newSkills.includes(skillName)) {
            newSkills.push(skillName);
        }
    } else {
        newSkills = newSkills.filter(s => s !== skillName);
    }
    updatePlayerState({ equippedSkills: newSkills });
    renderPlayerStats();
};

window.handleSkillPriorityChange = function(skillName, direction) {
    if (!playerState.equippedSkills) return;
    let newSkills = [...playerState.equippedSkills];
    const idx = newSkills.indexOf(skillName);
    if (idx === -1) return;
    
    if (direction === 'up' && idx > 0) {
        const temp = newSkills[idx - 1];
        newSkills[idx - 1] = newSkills[idx];
        newSkills[idx] = temp;
    } else if (direction === 'down' && idx < newSkills.length - 1) {
        const temp = newSkills[idx + 1];
        newSkills[idx + 1] = newSkills[idx];
        newSkills[idx] = temp;
    }
    updatePlayerState({ equippedSkills: newSkills });
    renderPlayerStats();
};

// 인벤토리 렌더링
window.renderInventory = function() {
    if (!inventoryList) return;
    inventoryList.innerHTML = '';
    
    const groupedInventory = [];
    playerState.inventory.forEach((item, originalIndex) => {
        if (!item) return;
        
        if (item.type === 'consumable' || item.type === 'material' || item.type === 'etc') {
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
            if (currentInvFilter === 'etc' && item.type !== 'etc') return;
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
            <div title="${getItemTooltipText(item)}">
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
        if (item.type === 'consumable' || item.type === 'material' || item.type === 'etc') {
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
        div.title = getItemTooltipText(item);
        div.innerHTML = `<span>${displayName}</span> <span style="color:#94a3b8;">▶ 보관</span>`;
        div.addEventListener('click', () => storeInWarehouse(targetIndex));
        warehouseInvList.appendChild(div);
    });

    warehouseStorageList.innerHTML = '';
    const groupedWh = [];
    warehouse.forEach((item, index) => {
        if (!item) return;
        if (item.type === 'consumable' || item.type === 'material' || item.type === 'etc') {
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
        div.title = getItemTooltipText(item);
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

window.renderShopCategoryList = function(categoryType, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = '';
    
    // ITEM_DB에서 해당 카테고리의 아이템만 필터링
    const items = Object.entries(ITEM_DB)
        .filter(([_, item]) => {
            if (categoryType === 'weapon' || categoryType === 'body') return item.type === categoryType || item.type === 'accessory';
            return item.type === categoryType;
        });

    if (items.length === 0) {
        container.innerHTML = '<div style="color: #64748b; font-size: 12px; padding: 8px;">상품이 없습니다.</div>';
        return;
    }

    items.forEach(([key, item]) => {
        // 무기/방어구 상점에서 장신구는 모두 보이게 하거나 방어구 쪽에만 보이게 처리 가능
        // 여기서는 무기상점(weapon)은 무기만, 방어구상점(body)은 방어구와 장신구를 띄우도록 조건 추가
        if (categoryType === 'weapon' && item.type === 'accessory') return;
        
        let color = '#cbd5e1';
        if (item.type === 'weapon') color = '#fca5a5';
        else if (item.type === 'body' || item.type === 'accessory') color = '#fcd34d';
        else if (item.type === 'consumable') color = '#a855f7';

        const div = document.createElement('div');
        div.style.cssText = 'display: flex; justify-content: space-between; align-items: center; background: rgba(0,0,0,0.3); border: 1px solid #334155; padding: 8px; border-radius: 4px;';
        
        div.innerHTML = `
            <div>
                <div style="font-weight: 600; font-size: 13px; color: ${color};">${item.name} <span style="font-size:10px;color:#94a3b8;">${item.subType ? `[${item.subType}]` : ''}</span></div>
                <div style="font-size: 11px; color: #94a3b8; margin: 2px 0;">${item.desc}</div>
            </div>
            <button class="action-btn" style="padding: 4px 8px; font-size: 12px; width: auto; border-color: ${color}; color: ${color}; min-width: 80px;" onclick="buyShopItem('${key}')">구매 (${item.price}G)</button>
        `;
        container.appendChild(div);
    });
};

window.buyShopItem = function(itemKey) {
    const itemData = ITEM_DB[itemKey];
    if (!itemData) return;
    
    if (playerState.gold < itemData.price) {
        alert("골드가 부족합니다.");
        return;
    }
    
    // 깊은 복사로 인벤토리에 추가 (스탯 등의 객체가 오염되지 않도록)
    const newItem = JSON.parse(JSON.stringify(itemData));
    
    const newInv = [...playerState.inventory];
    newInv.push(newItem);
    
    updatePlayerState({
        gold: playerState.gold - itemData.price,
        inventory: newInv
    });
    
    alert(`[${itemData.name}]을(를) 구매했습니다!`);
    renderPlayerStats();
};

// 장비 판매 리스트 렌더링
window.renderShopSellList = function() {
    const shopSellList = document.getElementById('shop-sell-list');
    if (!shopSellList) return;
    
    shopSellList.innerHTML = '';
    
    // 장착 중인 아이템 인덱스 파악
    const equippedIndices = new Set();
    if (playerState.equipment) {
        Object.values(playerState.equipment).forEach(eq => {
            if (eq) {
                // 인벤토리 내에서 동일한 참조를 가지는 아이템을 찾지만,
                // 안전하게 하기 위해 인벤토리에서 장비는 판매 리스트에서 아예 제외하는 것이 나을 수도 있음.
                // 또는 타입이 장비인 것을 제외? "장착 중인 장비를 제외"하라는 것은 장착 안된 장비는 팔 수 있다는 뜻.
                // 그러나 현재 구조상 equipment 객체에 따로 복사되어 들어가는지 참조인지 확인 필요.
                // equipItem() 로직을 보면 인벤토리에서 splice 로 제거하고 equipment 에 넣으므로,
                // 인벤토리에는 장착 중인 아이템이 없습니다!
            }
        });
    }

    const groupedInv = [];
    playerState.inventory.forEach((item, index) => {
        if (!item) return;
        if (item.type === 'consumable' || item.type === 'material' || item.type === 'etc') {
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

    if (groupedInv.length === 0) {
        shopSellList.innerHTML = '<div style="color: #64748b; font-size: 12px; padding: 8px;">판매할 아이템이 없습니다.</div>';
        return;
    }

    groupedInv.forEach((group) => {
        const item = group.item;
        const count = group.count;
        const targetIndex = group.indices[0]; // 대표로 하나만 팝니다.
        const displayName = count > 1 ? `${item.name} <span style="color: #fcd34d; font-size: 13px;">x ${count}</span>` : item.name;
        
        // 아이템의 price가 없으면 기본값 10
        const itemPrice = item.price || 10;
        const sellPrice = Math.floor(itemPrice / 2);

        const div = document.createElement('div');
        div.style.display = 'flex';
        div.style.justifyContent = 'space-between';
        div.style.alignItems = 'center';
        div.style.background = 'rgba(0,0,0,0.3)';
        div.style.border = '1px solid #334155';
        div.style.padding = '8px';
        div.style.borderRadius = '4px';

        div.innerHTML = `
            <div title="${getItemTooltipText(item)}">
                <div style="font-weight: 600; font-size: 13px; color: #cbd5e1;">${displayName}</div>
                <div style="font-size: 11px; color: #94a3b8;">${item.desc}</div>
            </div>
            <button class="action-btn" style="padding: 4px 8px; font-size: 12px; width: auto; border-color: #f59e0b; color: #fcd34d;" onclick="sellShopItem(${targetIndex}, ${sellPrice})">판매 (+${sellPrice}G)</button>
        `;
        shopSellList.appendChild(div);
    });
};

// 상점 판매 로직
window.sellShopItem = function(index, sellPrice) {
    const item = playerState.inventory[index];
    if (!item) return;

    const newInv = [...playerState.inventory];
    newInv.splice(index, 1);
    
    updatePlayerState({
        gold: playerState.gold + sellPrice,
        inventory: newInv
    });
    
    renderShopSellList(); // 리스트 갱신
    renderPlayerStats();  // 골드 갱신
};

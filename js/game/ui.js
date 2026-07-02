// DOM 요소를 전역적으로 캐싱
let tabBtns, views, statsContainer;
let btnInn, btnChurch, btnShop, btnGuild, btnWarrior, btnMage, btnArcher, btnStatReset, guildMenu;
let fieldIdle, fieldCombat, monsterNameDisplay, monsterHpDisplay, combatLog;
let btnExplore, btnAttack, btnSkill, btnItem, btnFlee, btnStopAuto, combatSkillMenu, combatSkillList, combatItemMenu, combatItemList;
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
    guildMenu = document.getElementById('guild-menu');
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
    btnItem = document.getElementById('btn-item');
    combatSkillMenu = document.getElementById('combat-skill-menu');
    combatSkillList = document.getElementById('combat-skill-list');
    combatItemMenu = document.getElementById('combat-item-menu');
    combatItemList = document.getElementById('combat-item-list');

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

    // --- 사냥 설정 상태 유지 (localStorage) ---
    const autoPotionHp = document.getElementById('auto-potion-hp');
    const autoPotionMp = document.getElementById('auto-potion-mp');
    
    if (selAutoCombat) {
        selAutoCombat.value = localStorage.getItem('dk_auto_combat') || 'manual';
        selAutoCombat.addEventListener('change', (e) => localStorage.setItem('dk_auto_combat', e.target.value));
    }
    if (autoPotionHp) {
        autoPotionHp.value = localStorage.getItem('dk_auto_potion_hp') || '30';
        autoPotionHp.addEventListener('change', (e) => localStorage.setItem('dk_auto_potion_hp', e.target.value));
    }
    if (autoPotionMp) {
        autoPotionMp.value = localStorage.getItem('dk_auto_potion_mp') || '20';
        autoPotionMp.addEventListener('change', (e) => localStorage.setItem('dk_auto_potion_mp', e.target.value));
    }

    // --- NPC 정보 초기화 ---
    if (window.NPC_DB) {
        Object.values(window.NPC_DB).forEach(npc => {
            const nameEl = document.getElementById(`npc-name-${npc.id}`);
            const greetEl = document.getElementById(`npc-greet-${npc.id}`);
            if (nameEl) nameEl.textContent = `${npc.name} (${npc.job})`;
            if (greetEl) greetEl.textContent = `"${npc.greeting}"`;
        });
    }

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
            document.getElementById(targetId).style.display = 'flex';
            btnBackToTown.style.display = 'block';
            
            if (targetId === 'town-warehouse') renderWarehouse();
            if (targetId === 'town-sell') renderShopSellList();
            if (targetId === 'town-weapon') {
                const activeWeaponCat = document.querySelector('.btn-shop-weapon-cat.active');
                if (activeWeaponCat) activeWeaponCat.click();
            }
            if (targetId === 'town-consumable') {
                const activeConsCat = document.querySelector('.btn-shop-cons-cat.active');
                if (activeConsCat) activeConsCat.click();
            }
            if (targetId === 'town-guild') {
                const jobSection = document.getElementById('guild-job-section');
                if (jobSection) {
                    jobSection.style.display = (playerState && playerState.job === '초보자') ? 'block' : 'none';
                }
            }
        });
    });

    const shopWeaponCats = document.querySelectorAll('.btn-shop-weapon-cat');
    shopWeaponCats.forEach(btn => {
        btn.addEventListener('click', () => {
            shopWeaponCats.forEach(b => {
                b.classList.remove('active');
                b.style.borderColor = '#475569';
                b.style.color = '#cbd5e1';
            });
            btn.classList.add('active');
            btn.style.borderColor = '#ef4444';
            btn.style.color = '#fca5a5';
            
            if (btn.dataset.cat === 'weapon') {
                renderShopCategoryList(['weapon'], 'shop-weapon-list');
            } else {
                renderShopCategoryList(['body', 'head', 'pants', 'shoes'], 'shop-weapon-list');
            }
        });
    });

    const shopConsCats = document.querySelectorAll('.btn-shop-cons-cat');
    shopConsCats.forEach(btn => {
        btn.addEventListener('click', () => {
            shopConsCats.forEach(b => {
                b.classList.remove('active');
                b.style.borderColor = '#475569';
                b.style.color = '#cbd5e1';
            });
            btn.classList.add('active');
            btn.style.borderColor = '#a855f7';
            btn.style.color = '#d8b4fe';
            
            if (btn.dataset.cat === 'accessory') {
                renderShopCategoryList(['accessory', 'accessory1', 'accessory2'], 'shop-consumable-list');
            } else {
                renderShopCategoryList(['consumable'], 'shop-consumable-list');
            }
        });
    });

    if (btnBackToTown) {
        btnBackToTown.addEventListener('click', () => {
            townSubviews.forEach(view => view.style.display = 'none');
            btnBackToTown.style.display = 'none';
            townMain.style.display = 'block';
        });
    }

    const btnInnRest = document.getElementById('btn-inn-rest');
    if (btnInnRest) {
        // 비용: 레벨 * 10 (피로도 회복이므로 기존 여관비용보단 조금 비싸게)
        btnInnRest.textContent = `휴식 (${(playerState.level || 1) * 10}G)`;
        btnInnRest.addEventListener('click', () => {
            const cost = (playerState.level || 1) * 10;
            if (playerState.gold >= cost) {
                updatePlayerState({
                    gold: playerState.gold - cost,
                    fatigue: playerState.fatigue + 100
                });
                window.gameAlert(`충분한 휴식을 취해 피로도를 100 회복했습니다! (${cost}G 소모)`);
            } else {
                window.gameAlert("골드가 부족합니다.");
            }
        });
    }

    function renderInnMeals() {
        const container = document.getElementById('inn-meal-list');
        if (!container) return;
        
        container.innerHTML = `
            <div style="display: flex; gap: 16px;">
                <div style="flex: 1;">
                    <h5 style="color: #fca5a5; margin-bottom: 8px; font-size: 13px; border-bottom: 1px solid #334155; padding-bottom: 4px;">🍖 식사류</h5>
                    <div id="inn-main-list" style="display: flex; flex-direction: column; gap: 8px;"></div>
                </div>
                <div style="flex: 1;">
                    <h5 style="color: #fde047; margin-bottom: 8px; font-size: 13px; border-bottom: 1px solid #334155; padding-bottom: 4px;">🍰 디저트류</h5>
                    <div id="inn-dessert-list" style="display: flex; flex-direction: column; gap: 8px;"></div>
                </div>
            </div>
        `;
        
        if (typeof window.MEAL_DB === 'undefined') return;

        const mainList = document.getElementById('inn-main-list');
        const dessertList = document.getElementById('inn-dessert-list');

        for (const [mealId, meal] of Object.entries(window.MEAL_DB)) {
            const itemDiv = document.createElement('div');
            itemDiv.style.cssText = "display: flex; justify-content: space-between; align-items: center; border-top: 1px dashed #334155; padding-top: 8px;";
            itemDiv.innerHTML = `
                <div>
                    <div style="color: #f8fafc; font-size: 12px; font-weight: bold;">${meal.icon} ${meal.name}</div>
                    <div style="color: #94a3b8; font-size: 10px; margin-top: 2px;">${meal.desc}</div>
                </div>
                <button class="action-btn btn-inn-meal" data-meal="${mealId}" style="padding: 4px 8px; font-size: 11px; width: auto; border-color: #ef4444; color: #fca5a5; white-space: nowrap; margin-left: 8px;">${meal.price.toLocaleString()} G</button>
            `;
            
            if (meal.category === 'dessert') {
                dessertList.appendChild(itemDiv);
            } else {
                mainList.appendChild(itemDiv);
            }
        }

        container.querySelectorAll('.btn-inn-meal').forEach(btn => {
            btn.addEventListener('click', () => {
                const mealId = btn.dataset.meal;
                const meal = window.MEAL_DB[mealId];
                if (!meal) return;

                if (playerState.gold >= meal.price) {
                    let currentBuffs = playerState.mealBuffs || { main: null, dessert: null };
                    if (playerState.mealBuff && !playerState.mealBuffs) {
                        currentBuffs.main = playerState.mealBuff;
                    }
                    const category = meal.category || 'main';
                    currentBuffs[category] = { id: mealId, remainingBattles: meal.duration };

                    updatePlayerState({
                        gold: playerState.gold - meal.price,
                        mealBuffs: currentBuffs,
                        mealBuff: null // Clear old legacy buff
                    });
                    window.gameAlert(`식사를 마쳤습니다! ${meal.duration}회 전투 동안 [${meal.name}] 효과가 적용됩니다.`);
                } else {
                    window.gameAlert("골드가 부족합니다.");
                }
            });
        });
    }

    // 초기 요리 렌더링
    renderInnMeals();

    // --- 성당 기능 ---
    const btnChurchHeal = document.getElementById('btn-church-heal');
    if (btnChurchHeal) {
        // 비용: 레벨 * 5
        btnChurchHeal.textContent = `치유 받기 (${(playerState.level || 1) * 5}G)`;
        btnChurchHeal.addEventListener('click', () => {
            const cost = (playerState.level || 1) * 5;
            if (playerState.gold >= cost) {
                let isPoisoned = playerState.statusEffects && playerState.statusEffects["Poison"];
                if (playerState.currentHp === playerState.maxHp && playerState.currentMp === playerState.maxMp && !isPoisoned) {
                    window.gameAlert("이미 치유할 상처가 없습니다.");
                    return;
                }
                let newStatus = {...playerState.statusEffects};
                if (isPoisoned) delete newStatus["Poison"];
                
                updatePlayerState({
                    gold: playerState.gold - cost,
                    currentHp: playerState.maxHp,
                    currentMp: playerState.maxMp,
                    statusEffects: newStatus
                });
                window.gameAlert(`여신의 권능으로 모든 상처와 질병이 회복되었습니다! (${cost}G 소모)`);
            } else {
                window.gameAlert("공물이 부족합니다.");
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

    const checkJobChangeCondition = () => {
        if (playerState.job !== "초보자") {
            window.gameAlert("이미 전직을 완료했습니다.");
            return false;
        }
        if (playerState.jobLevel < 10) {
            window.gameAlert("초보자 직업 레벨이 10 이상이어야 전직할 수 있습니다.");
            return false;
        }
        return true;
    };

    const handleJobChange = (jobName) => {
        if (!checkJobChangeCondition()) return;
        const jobData = JOB_DB[jobName];
        window.gameConfirm(`${jobName} - ${jobData.desc}<br><br>정말 전직하시겠습니까?`).then(res => {
            if (res) {
                playerState.skills = {};
                playerState.equippedSkills = [];
                playerState.job = jobName;
                playerState.jobLevel = 1;
                playerState.jobExp = 0;
                updatePlayerState({ job: jobName, jobLevel: 1, jobExp: 0, skills: {}, equippedSkills: [] });
                
                // Firebase에도 즉시 백업
                if (typeof DB !== 'undefined' && DB.backupToServer) {
                    DB.backupToServer();
                }
                
                // 전직 버튼 숨김
                const jobChangeSection = document.getElementById('guild-job-section');
                if (jobChangeSection) jobChangeSection.style.display = 'none';
                
                if (typeof switchTab === 'function') {
                    switchTab('info');
                }
                setTimeout(() => {
                    window.gameAlert(`${jobName}(으)로 전직했습니다!`, 'success', true);
                }, 150);
            }
        });
    };

    if (btnWarrior) {
        btnWarrior.addEventListener('click', () => handleJobChange("검사"));
    }

    if (btnMage) {
        btnMage.addEventListener('click', () => handleJobChange("마법사"));
    }

    if (btnArcher) {
        btnArcher.addEventListener('click', () => handleJobChange("궁수"));
    }

    if (btnStatReset) {
        btnStatReset.addEventListener('click', () => {
            window.gameConfirm("정말로 스탯을 모두 초기화하시겠습니까? 포인트가 전부 반환됩니다.").then(res => {
                if (res) {
                    playerState.baseStats = { str: 1, agi: 1, dex: 1, vit: 1, int: 1, luk: 1 };
                    playerState.statPoints = EXP_DB.getAccumulatedStatPoints(playerState.level);
                    updatePlayerState({ baseStats: playerState.baseStats, statPoints: playerState.statPoints });
                    window.gameAlert("여신의 세례로 스탯이 모두 초기화되었습니다!", 'info', true);
                    if (typeof renderPlayerStats === 'function') renderPlayerStats();
                }
            });
        });
    }

    const btnSkillReset = document.getElementById('btn-skill-reset');
    if (btnSkillReset) {
        btnSkillReset.addEventListener('click', () => {
            if (playerState.job === "초보자") {
                window.gameAlert("초보자는 스킬을 배울 수 없어 초기화가 불필요합니다.");
                return;
            }
            window.gameConfirm("정말로 스킬을 모두 초기화하시겠습니까? 포인트가 전부 반환됩니다.").then(res => {
                if (res) {
                    playerState.skills = {};
                    playerState.equippedSkills = [];
                    // Job level 1 starts with 0 points. Level up gives points.
                    playerState.skillPoints = Math.max(0, playerState.jobLevel - 1);
                    updatePlayerState({ skills: playerState.skills, equippedSkills: playerState.equippedSkills, skillPoints: playerState.skillPoints });
                    window.gameAlert("여신의 세례로 스킬이 모두 초기화되었습니다!", 'info', true);
                    if (typeof renderPlayerStats === 'function') renderPlayerStats();
                }
            });
        });
    }

    const btnGuildDaily = document.getElementById('btn-guild-daily');
    if (btnGuildDaily) {
        btnGuildDaily.addEventListener('click', () => {
            renderQuestList('daily');
        });
    }

    const btnGuildWeekly = document.getElementById('btn-guild-weekly');
    if (btnGuildWeekly) {
        btnGuildWeekly.addEventListener('click', () => {
            renderQuestList('weekly');
        });
    }

    const btnQuestClose = document.getElementById('btn-quest-close');
    const questModal = document.getElementById('quest-modal');
    if (btnQuestClose && questModal) {
        btnQuestClose.addEventListener('click', () => {
            questModal.style.display = 'none';
        });
    }

    const cbQuestShowLow = document.getElementById('cb-quest-show-low');
    if (cbQuestShowLow) {
        cbQuestShowLow.addEventListener('change', () => {
            if (questModal.dataset.currentCycle) {
                renderQuestList(questModal.dataset.currentCycle);
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
            if (combatItemMenu) combatItemMenu.style.display = 'none';
            if (combatSkillMenu.style.display === 'none') {
                let activeSkills = [];
                for (let sName in playerState.skills) {
                    if (SKILL_DB[sName] && SKILL_DB[sName].type !== 'passive') activeSkills.push(sName);
                }
                if (activeSkills.length === 0) {
                    window.gameAlert("전투에 사용할 수 있는 액티브 스킬이 없습니다.");
                    return;
                }
                
                combatSkillMenu.style.display = 'block';
                combatSkillList.innerHTML = '';
                
                activeSkills.forEach(sName => {
                        const skillData = SKILL_DB[sName];
                        const sLevel = playerState.skills[sName];
                        const costMp = skillData.getCostMp ? skillData.getCostMp(sLevel) : 0;
                        const sBtn = document.createElement('button');
                        sBtn.className = 'action-btn';
                        sBtn.style.padding = '4px 8px';
                        sBtn.style.fontSize = '12px';
                        sBtn.textContent = `${sName} (MP ${costMp})`;
                        
                        // 쿨타임 체크
                        if (window.skillCooldowns && window.skillCooldowns[sName] > 0) {
                            sBtn.textContent += ` [쿨타임 ${window.skillCooldowns[sName]}턴]`;
                            sBtn.style.opacity = '0.5';
                            sBtn.style.cursor = 'not-allowed';
                        } else {
                            sBtn.addEventListener('click', () => {
                                if (playerState.currentMp < costMp) {
                                    window.gameAlert("MP가 부족합니다!");
                                    return;
                                }
                                combatSkillMenu.style.display = 'none';
                                window.manualSkill = skillData;
                                executePlayerAction();
                            });
                        }
                        combatSkillList.appendChild(sBtn);
                    });
            } else {
                combatSkillMenu.style.display = 'none';
            }
        });
    }

    if (btnItem) {
        btnItem.addEventListener('click', () => {
            if (!currentMonster || playerState.currentHp <= 0) return;
            if (combatSkillMenu) combatSkillMenu.style.display = 'none';
    if (combatItemMenu) combatItemMenu.style.display = 'none';
    window.itemUsedThisTurn = false;
            if (combatItemMenu.style.display === 'none') {
                let consumables = playerState.inventory.filter(i => i && ITEM_DB[i.id] && (ITEM_DB[i.id].healHp || ITEM_DB[i.id].healMp || ITEM_DB[i.id].curePoison));
                
                if (consumables.length === 0) {
                    window.gameAlert("사용할 수 있는 소모품(포션, 해독제 등)이 없습니다.");
                    return;
                }

                combatItemMenu.style.display = 'block';
                combatItemList.innerHTML = '';
                
                consumables.forEach(invItem => {
                        const itemData = ITEM_DB[invItem.id];
                        const iBtn = document.createElement('button');
                        iBtn.className = 'action-btn';
                        iBtn.style.padding = '4px 8px';
                        iBtn.style.fontSize = '12px';
                        iBtn.style.borderColor = '#10b981';
                        iBtn.style.color = '#6ee7b7';
                        iBtn.textContent = `${itemData.name} (x${invItem.count})`;
                        
                        if (window.itemUsedThisTurn) {
                            iBtn.style.opacity = '0.5';
                            iBtn.style.cursor = 'not-allowed';
                            iBtn.title = "한 턴에 한 번만 사용할 수 있습니다.";
                        } else {
                            iBtn.addEventListener('click', () => {
                                // 사용 처리
                                let used = false;
                                if (itemData.healHp) {
                                    const hp = Math.min(playerState.maxHp, playerState.currentHp + itemData.healHp);
                                    updatePlayerState({ currentHp: hp });
                                    addCombatLog(`[소모품] ${itemData.name}을(를) 사용하여 체력을 회복했습니다!`, "#10b981");
                                    used = true;
                                }
                                if (itemData.healMp) {
                                    const mp = Math.min(playerState.maxMp, playerState.currentMp + itemData.healMp);
                                    updatePlayerState({ currentMp: mp });
                                    addCombatLog(`[소모품] ${itemData.name}을(를) 사용하여 마나를 회복했습니다!`, "#3b82f6");
                                    used = true;
                                }
                                if (itemData.curePoison) {
                                    if (playerState.statusEffects && playerState.statusEffects["Poison"]) {
                                        let s = {...playerState.statusEffects};
                                        delete s["Poison"];
                                        updatePlayerState({ statusEffects: s });
                                        addCombatLog(`[소모품] ${itemData.name}을(를) 사용하여 맹독을 해독했습니다!`, "#10b981");
                                        used = true;
                                    } else {
                                        window.gameAlert("중독 상태가 아닙니다.");
                                        return;
                                    }
                                }
                                
                                if (used) {
                                    window.loseItem(invItem.id, 1);
                                    window.itemUsedThisTurn = true;
                                    combatItemMenu.style.display = 'none';
                                    updateCombatUI();
                                    renderInventory();
                                }
                            });
                        }
                        combatItemList.appendChild(iBtn);
                    });
            } else {
                combatItemMenu.style.display = 'none';
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
    if (targetId !== 'field') {
        if (window.isAutoCombatActive) {
            window.isAutoCombatActive = false;
            window.autoCombatMode = 'manual';
            addCombatLog("다른 메뉴로 이동하여 자동전투가 중단되었습니다.", "#fca5a5");
        }
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
    } else if (targetId === 'town') {
        const townMain = document.getElementById('town-main');
        const townSubviews = document.querySelectorAll('.town-subview');
        const btnBackToTown = document.getElementById('btn-back-to-town');
        if (townMain) townMain.style.display = 'block';
        if (townSubviews) townSubviews.forEach(view => view.style.display = 'none');
        if (btnBackToTown) btnBackToTown.style.display = 'none';
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
        window.gameAlert("체력을 먼저 회복하세요!");
        return;
    }
    
    // 영구 상태이상(독) 필드 탐색 데미지
    if (playerState.statusEffects && playerState.statusEffects["Poison"]) {
        let poisonDmg = Math.max(1, Math.floor(playerState.maxHp * 0.02));
        playerState.currentHp -= poisonDmg;
        if (playerState.currentHp <= 0) {
            playerState.currentHp = 1;
            window.gameAlert(`맹독 상태로 인해 탐색 중 체력이 1이 되었습니다. 해독제나 성당을 이용하세요!`);
            window.isAutoCombatActive = false;
            return;
        }
    }
    if (playerState.fatigue < 5) {
        window.gameAlert(`피로도가 부족합니다! (현재: ${playerState.fatigue}, 필요: 5)`);
        window.isAutoCombatActive = false;
        return;
    }

    const fieldData = FIELD_DB[fieldId];
    
    if (fieldData.requireItem) {
        const keyIndex = playerState.inventory.findIndex(i => i && i.name === fieldData.requireItem);
        if (keyIndex === -1) {
            window.gameAlert(`${fieldData.requireItem} 아이템이 부족합니다!`);
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
    if (combatItemMenu) combatItemMenu.style.display = 'none';
    window.itemUsedThisTurn = false;
    
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

        const playerBuffsContainer = document.getElementById('combat-player-buffs');
        if (playerBuffsContainer) {
            playerBuffsContainer.innerHTML = '';
            const buffs = [];
            if (playerState.mealBuffs) {
                if (playerState.mealBuffs.main) buffs.push(playerState.mealBuffs.main);
                if (playerState.mealBuffs.dessert) buffs.push(playerState.mealBuffs.dessert);
            } else if (playerState.mealBuff) {
                buffs.push(playerState.mealBuff);
            }

            for (const buff of buffs) {
                if (buff && buff.remainingBattles > 0) {
                    const meal = typeof window.MEAL_DB !== 'undefined' ? window.MEAL_DB[buff.id] : null;
                    if (meal) {
                        playerBuffsContainer.innerHTML += `<span style="font-size: 11px; background: rgba(0,0,0,0.5); padding: 2px 4px; border-radius: 4px; border: 1px solid #475569; cursor: help;" title="${meal.name}: ${meal.desc}">${meal.icon}x${buff.remainingBattles}</span>`;
                    }
                }
            }
            if (window.combatBuffs && window.combatBuffs.player) {
                for (const [buffName, duration] of Object.entries(window.combatBuffs.player)) {
                    if (duration > 0) {
                        playerBuffsContainer.innerHTML += `<span style="font-size: 11px; background: rgba(59,130,246,0.2); padding: 2px 4px; border-radius: 4px; border: 1px solid #3b82f6; color: #93c5fd; cursor: help;" title="${buffName} (${duration}턴 남음)">✨${buffName}x${duration}</span>`;
                    }
                }
            }
        }

        if(monsterNameDisplay) monsterNameDisplay.textContent = currentMonster.name;
        
        const mHp = Math.max(0, currentMonster.hp);
        const mMaxHp = currentMonster.maxHp || 1;
        if(combatMonsterHpText) combatMonsterHpText.textContent = `${mHp}/${mMaxHp}`;
        if(combatMonsterHpBar) combatMonsterHpBar.style.width = `${Math.max(0, (mHp / mMaxHp) * 100)}%`;

        const monsterBuffsContainer = document.getElementById('combat-monster-buffs');
        if (monsterBuffsContainer) {
            monsterBuffsContainer.innerHTML = '';
            if (window.combatBuffs && window.combatBuffs.monster) {
                for (const [buffName, duration] of Object.entries(window.combatBuffs.monster)) {
                    if (duration > 0) {
                        monsterBuffsContainer.innerHTML += `<span style="font-size: 11px; background: rgba(239,68,68,0.2); padding: 2px 4px; border-radius: 4px; border: 1px solid #ef4444; color: #fca5a5; cursor: help;" title="${buffName} (${duration}턴 남음)">💀${buffName}x${duration}</span>`;
                    }
                }
            }
        }
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
    if (item.reqLevel) stats.push(`[요구 레벨: ${item.reqLevel}]`);
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
    const jobReq = EXP_DB.getRequiredJobExp(playerState.jobLevel, playerState.job);
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
    if (typeof DB !== 'undefined' && DB.backupToServer) DB.backupToServer();
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
        if (typeof DB !== 'undefined' && DB.backupToServer) DB.backupToServer();
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
    
    playerState.inventory.forEach((invItem, index) => {
        if (!invItem) return;
        const baseItem = ITEM_DB[invItem.id];
        if (!baseItem) return;
        
        // 카테고리 필터링
        if (currentInvFilter !== 'all') {
            const isEquip = ['weapon', 'body', 'head', 'shoes', 'pants', 'subWeapon'].includes(baseItem.type) || baseItem.type.startsWith('accessory');
            if (currentInvFilter === 'equip' && !isEquip) return;
            if (currentInvFilter === 'consumable' && baseItem.type !== 'consumable') return;
            if (currentInvFilter === 'material' && baseItem.type !== 'material') return;
            if (currentInvFilter === 'etc' && baseItem.type !== 'etc') return;
            if (currentInvFilter === 'event' && baseItem.type !== 'event') return;
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
        const isEquip = ['weapon', 'body', 'head', 'shoes', 'pants', 'subWeapon'].includes(baseItem.type) || baseItem.type.startsWith('accessory');
        if (isEquip) {
            btnHtml = `<button class="action-btn" style="padding: 4px 8px; font-size: 12px; width: auto;" onclick="equipItem(${index})">장착</button>`;
        } else if (baseItem.type === 'consumable') {
            btnHtml = `<button class="action-btn" style="padding: 4px 8px; font-size: 12px; width: auto; border-color: #10b981; color: #6ee7b7;" onclick="useItem('${invItem.id}')">사용</button>`;
        }

        const countStr = invItem.count && invItem.count > 1 ? ` <span style="color: #fcd34d; font-size: 13px;">x ${invItem.count}</span>` : '';
        const enhanceStr = invItem.enhance ? `<span style="color: #3b82f6;">+${invItem.enhance} </span>` : '';
        const displayName = `${enhanceStr}${baseItem.name}${countStr}`;

        const combinedItem = { ...baseItem, ...invItem };

        div.innerHTML = `
            <div title="${getItemTooltipText(combinedItem)}">
                <div style="font-weight: 600; font-size: 14px; color: #f8fafc;">${displayName}</div>
                <div style="font-size: 12px; color: #94a3b8;">${baseItem.desc}</div>
            </div>
            <div>${btnHtml}</div>
        `;
        inventoryList.appendChild(div);
    });
};

// 아이템 장착 로직
window.equipItem = function(index) {
    const invItem = playerState.inventory[index];
    if (!invItem) return;
    const baseItem = ITEM_DB[invItem.id];
    if (!baseItem) return;

    if (baseItem.reqLevel && playerState.level < baseItem.reqLevel) {
        showToast(`레벨이 부족하여 장착할 수 없습니다. (요구 레벨: ${baseItem.reqLevel})`, 'error');
        return;
    }
    let slot = baseItem.type;
    
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
    newEquip[slot] = invItem;
    
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
window.useItem = function(itemId) {
    const baseItem = ITEM_DB[itemId];
    if (!baseItem) return;

    let used = false;
    if (baseItem.healHp) {
        const hp = Math.min(playerState.maxHp, playerState.currentHp + baseItem.healHp);
        updatePlayerState({ currentHp: hp });
        window.gameAlert(`${baseItem.name}을(를) 사용하여 체력을 회복했습니다.`);
        used = true;
    }
    if (baseItem.healMp) {
        const mp = Math.min(playerState.maxMp, playerState.currentMp + baseItem.healMp);
        updatePlayerState({ currentMp: mp });
        if (!baseItem.healHp) window.gameAlert(`${baseItem.name}을(를) 사용하여 마나를 회복했습니다.`);
        used = true;
    }
    if (baseItem.curePoison) {
        if (playerState.statusEffects && playerState.statusEffects["Poison"]) {
            let s = {...playerState.statusEffects};
            delete s["Poison"];
            updatePlayerState({ statusEffects: s });
            window.gameAlert(`${baseItem.name}을(를) 사용하여 맹독을 해독했습니다.`);
            used = true;
        } else {
            window.gameAlert("중독 상태가 아닙니다.");
            return;
        }
    }
    
    if (used) {
        window.loseItem(itemId, 1);
        renderInventory();
        renderPlayerStats();
    }
};

// 창고 UI 렌더링
window.renderWarehouse = function() {
    if (!warehouseInvList || !warehouseStorageList) return;
    const accId = sessionStorage.getItem('lastAccount');
    const db = DB.load();
    const warehouse = db.accounts[accId].warehouse || [];

    warehouseInvList.innerHTML = '';
    
    playerState.inventory.forEach((invItem, targetIndex) => {
        if (!invItem) return;
        const baseItem = ITEM_DB[invItem.id];
        if (!baseItem) return;
        
        const countStr = invItem.count && invItem.count > 1 ? ` (x${invItem.count})` : '';
        const enhanceStr = invItem.enhance ? `+${invItem.enhance} ` : '';
        const displayName = `${enhanceStr}${baseItem.name}${countStr}`;

        const div = document.createElement('div');
        div.className = 'action-btn';
        div.style.padding = '6px 8px';
        div.style.fontSize = '12px';
        div.style.textAlign = 'left';
        div.style.display = 'flex';
        div.style.justifyContent = 'space-between';
        div.title = getItemTooltipText({ ...baseItem, ...invItem });
        div.innerHTML = `<span>${displayName}</span> <span style="color:#94a3b8;">▶ 보관</span>`;
        div.addEventListener('click', () => storeInWarehouse(targetIndex));
        warehouseInvList.appendChild(div);
    });

    warehouseStorageList.innerHTML = '';
    warehouse.forEach((whItem, targetIndex) => {
        if (!whItem) return;
        const baseItem = ITEM_DB[whItem.id] || { name: whItem.id || '알 수 없는 아이템' };
        
        const countStr = whItem.count && whItem.count > 1 ? ` (x${whItem.count})` : '';
        const enhanceStr = whItem.enhance ? `+${whItem.enhance} ` : '';
        const displayName = `${enhanceStr}${baseItem.name}${countStr}`;

        const div = document.createElement('div');
        div.className = 'action-btn';
        div.style.padding = '6px 8px';
        div.style.fontSize = '12px';
        div.style.textAlign = 'left';
        div.style.display = 'flex';
        div.style.justifyContent = 'space-between';
        div.title = getItemTooltipText({ ...baseItem, ...whItem });
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

window.renderShopCategoryList = function(categoryTypes, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = '';
    
    // Ensure categoryTypes is an array
    if (!Array.isArray(categoryTypes)) {
        categoryTypes = [categoryTypes];
    }
    
    // ITEM_DB에서 해당 카테고리의 아이템만 필터링
    const items = Object.entries(ITEM_DB)
        .filter(([_, item]) => {
            return categoryTypes.includes(item.type);
        });

    if (items.length === 0) {
        container.innerHTML = '<div style="color: #64748b; font-size: 12px; padding: 8px;">상품이 없습니다.</div>';
        return;
    }

    items.forEach(([key, item]) => {
        
        let color = '#cbd5e1';
        if (item.type === 'weapon') color = '#fca5a5';
        else if (item.type === 'body' || item.type === 'accessory') color = '#fcd34d';
        else if (item.type === 'consumable') color = '#a855f7';

        const div = document.createElement('div');
        div.style.cssText = 'display: flex; justify-content: space-between; align-items: center; background: rgba(0,0,0,0.3); border: 1px solid #334155; padding: 8px; border-radius: 4px;';
        
        div.innerHTML = `
            <div title="${getItemTooltipText(item)}">
                <div style="font-weight: 600; font-size: 13px; color: ${color};">${item.name} <span style="font-size:10px;color:#94a3b8;">${item.subType ? `[${item.subType}]` : ''}</span></div>
                <div style="font-size: 11px; color: #94a3b8; margin: 2px 0;">${item.desc}</div>
            </div>
            <button class="action-btn" style="padding: 4px 8px; font-size: 12px; width: auto; border-color: #ef4444; color: #fca5a5; min-width: 80px;" onclick="buyShopItem('${key}')">${item.price.toLocaleString()} G</button>
        `;
        container.appendChild(div);
    });
};

window.buyShopItem = function(itemKey) {
    const itemData = ITEM_DB[itemKey];
    if (!itemData) return;
    
    if (playerState.gold < itemData.price) {
        window.gameAlert("골드가 부족합니다.");
        return;
    }
    
// 깊은 복사 대신 gainItem 사용
    if (typeof window.gainItem === 'function') {
        window.gainItem(itemKey, 1);
        updatePlayerState({ gold: playerState.gold - itemData.price });
    } else {
        const newItem = { id: itemKey, count: 1 };
        const newInv = [...playerState.inventory];
        newInv.push(newItem);
        updatePlayerState({
            gold: playerState.gold - itemData.price,
            inventory: newInv
        });
    }
    
    window.gameAlert(`[${itemData.name}]을(를) 구매했습니다!`);
    renderPlayerStats();
};

// 장비 판매 리스트 렌더링
window.renderShopSellList = function() {
    const shopSellList = document.getElementById('shop-sell-list');
    if (!shopSellList) return;
    
    shopSellList.innerHTML = '';

    if (!playerState.inventory || playerState.inventory.length === 0) {
        shopSellList.innerHTML = '<div style="color: #64748b; font-size: 12px; padding: 8px;">판매할 아이템이 없습니다.</div>';
        return;
    }

    playerState.inventory.forEach((invItem, targetIndex) => {
        if (!invItem) return;
        const baseItem = ITEM_DB[invItem.id];
        if (!baseItem) return;

        const countStr = invItem.count && invItem.count > 1 ? ` <span style="color: #fcd34d; font-size: 13px;">x ${invItem.count}</span>` : '';
        const enhanceStr = invItem.enhance ? `<span style="color: #3b82f6;">+${invItem.enhance} </span>` : '';
        const displayName = `${enhanceStr}${baseItem.name}${countStr}`;
        
        // 아이템의 price가 없으면 기본값 10
        const itemPrice = baseItem.price || 10;
        const sellPrice = Math.floor(itemPrice / 2);

        const div = document.createElement('div');
        div.style.display = 'flex';
        div.style.justifyContent = 'space-between';
        div.style.alignItems = 'center';
        div.style.background = 'rgba(0,0,0,0.3)';
        div.style.border = '1px solid #334155';
        div.style.padding = '8px';
        div.style.borderRadius = '4px';

        const combinedItem = { ...baseItem, ...invItem };

        div.innerHTML = `
            <div title="${getItemTooltipText(combinedItem)}">
                <div style="font-weight: 600; font-size: 13px; color: #cbd5e1;">${displayName}</div>
                <div style="font-size: 11px; color: #94a3b8;">${baseItem.desc}</div>
            </div>
            <button class="action-btn" style="padding: 4px 8px; font-size: 12px; width: auto; border-color: #10b981; color: #6ee7b7; min-width: 80px;" onclick="sellShopItem('${invItem.id}', ${sellPrice}, ${targetIndex})">${sellPrice.toLocaleString()} G</button>
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

window.renderQuestList = function(cycle) {
    const modal = document.getElementById('quest-modal');
    const titleEl = document.getElementById('quest-modal-title');
    const container = document.getElementById('quest-list-container');
    const activeCountEl = document.getElementById('quest-active-count');
    const showLowCb = document.getElementById('cb-quest-show-low');
    
    if (!modal || !container || typeof QUEST_DB === 'undefined') return;
    
    modal.dataset.currentCycle = cycle;
    titleEl.textContent = cycle === 'daily' ? '일일 의뢰 수주' : '주간 의뢰 수주';
    
    let activeQuests = playerState.quests.active || [];
    activeCountEl.textContent = activeQuests.length;
    
    container.innerHTML = '';
    
    const showLow = showLowCb ? showLowCb.checked : false;
    
    for (const [qId, qData] of Object.entries(QUEST_DB)) {
        if (qData.cycle !== cycle) continue;
        
        // 레벨 필터링
        if (playerState.level < qData.reqLevel) continue; // 최소 레벨 미달
        if (playerState.level >= qData.reqLevel + 20 && !showLow) continue; // 수준 낮은 의뢰 숨김
        
        const isHistory = playerState.quests.history && playerState.quests.history[qId];
        if (isHistory && cycle === 'daily') continue; // 오늘 이미 깬 일일퀘스트
        if (isHistory && cycle === 'weekly') continue; // 이번주 이미 깬 주간퀘스트
        
        const activeQ = activeQuests.find(q => q.id === qId);
        const isCompleted = activeQ ? activeQ.isComplete : false;
        
        // 아이템 납품 퀘스트의 경우 인벤토리 체크
        let currentProgress = activeQ ? activeQ.progress : 0;
        let isReadyToComplete = isCompleted;
        
        if (activeQ && qData.type === 'delivery') {
            const hasItem = playerState.inventory.find(i => i.id === qData.target);
            currentProgress = hasItem ? hasItem.count : 0;
            if (currentProgress >= qData.requiredCount) {
                isReadyToComplete = true;
            } else {
                isReadyToComplete = false;
                if(activeQ.isComplete) activeQ.isComplete = false; // 소지품 버렸을경우 대비
            }
        }
        
        const div = document.createElement('div');
        div.style.cssText = "background: rgba(15,23,42,0.8); border: 1px solid #334155; border-radius: 6px; padding: 12px; display: flex; flex-direction: column; gap: 8px;";
        
        let statusBadge = '';
        if (activeQ) {
            if (isReadyToComplete) {
                statusBadge = '<span style="color: #34d399; font-size: 11px; font-weight: bold; padding: 2px 6px; background: rgba(52, 211, 153, 0.2); border-radius: 4px;">달성 완료</span>';
            } else {
                statusBadge = '<span style="color: #3b82f6; font-size: 11px; font-weight: bold; padding: 2px 6px; background: rgba(59, 130, 246, 0.2); border-radius: 4px;">진행 중</span>';
            }
        }
        
        let rewardText = `골드 ${qData.rewards.gold.toLocaleString()}G, EXP ${qData.rewards.exp}`;
        if (qData.rewards.items) {
            qData.rewards.items.forEach(rItem => {
                const iData = window.ITEM_DB ? window.ITEM_DB[rItem.id] : null;
                if(iData) rewardText += `, ${iData.name} x${rItem.count}`;
            });
        }
        
        let progressText = activeQ ? `<div style="font-size: 12px; color: ${isReadyToComplete ? '#34d399' : '#f59e0b'}; margin-top: 4px;">진척도: ${Math.min(currentProgress, qData.requiredCount)} / ${qData.requiredCount}</div>` : '';

        let actionBtnHTML = '';
        if (activeQ) {
            if (isReadyToComplete) {
                actionBtnHTML = `<button class="action-btn" style="border-color: #34d399; color: #6ee7b7;" onclick="completeQuest('${qId}')">보상 받기</button>`;
            } else {
                actionBtnHTML = `<button class="action-btn" style="border-color: #ef4444; color: #fca5a5;" onclick="abandonQuest('${qId}')">포기하기</button>`;
            }
        } else {
            actionBtnHTML = `<button class="action-btn" style="border-color: #3b82f6; color: #93c5fd;" onclick="acceptQuest('${qId}')">수주하기</button>`;
        }
        
        div.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                <div>
                    <div style="font-weight: bold; color: #e2e8f0; font-size: 14px;">${qData.name} <span style="font-size: 11px; color: #94a3b8; font-weight: normal;">(Lv.${qData.reqLevel})</span></div>
                    <div style="font-size: 12px; color: #94a3b8; margin-top: 4px; font-style: italic;">"${qData.desc}"</div>
                </div>
                ${statusBadge}
            </div>
            <div style="font-size: 12px; color: #fcd34d; background: rgba(252, 211, 77, 0.1); padding: 4px 8px; border-radius: 4px;">보상: ${rewardText}</div>
            ${progressText}
            <div style="margin-top: 4px;">${actionBtnHTML}</div>
        `;
        
        container.appendChild(div);
    }
    
    if (container.children.length === 0) {
        container.innerHTML = '<div style="text-align: center; color: #94a3b8; padding: 20px; font-size: 13px;">현재 수주 가능한 의뢰가 없습니다.</div>';
    }
    
    modal.style.display = 'flex';
};

window.acceptQuest = function(qId) {
    if (playerState.quests.active.length >= 3) {
        window.gameAlert("의뢰는 최대 3개까지만 동시에 진행할 수 있습니다.");
        return;
    }
    playerState.quests.active.push({ id: qId, progress: 0, isComplete: false });
    updatePlayerState({ quests: playerState.quests });
    renderQuestList(document.getElementById('quest-modal').dataset.currentCycle);
};

window.abandonQuest = function(qId) {
    window.gameConfirm("정말로 이 의뢰를 포기하시겠습니까? 진척도가 초기화됩니다.").then(res => {
        if(res) {
            playerState.quests.active = playerState.quests.active.filter(q => q.id !== qId);
            updatePlayerState({ quests: playerState.quests });
            renderQuestList(document.getElementById('quest-modal').dataset.currentCycle);
        }
    });
};

window.completeQuest = function(qId) {
    const qData = window.QUEST_DB[qId];
    if (!qData) return;
    
    if (qData.type === 'delivery') {
        if (!loseItem(qData.target, qData.requiredCount)) {
            window.gameAlert("납품할 아이템이 부족합니다.");
            renderQuestList(document.getElementById('quest-modal').dataset.currentCycle);
            return;
        }
    }
    
    playerState.quests.active = playerState.quests.active.filter(q => q.id !== qId);
    
    // 기록에 남김
    if (!playerState.quests.history) playerState.quests.history = {};
    playerState.quests.history[qId] = true;
    
    // 보상 지급
    updatePlayerState({
        gold: playerState.gold + qData.rewards.gold
    });
    addExp(qData.rewards.exp, 0); // 잡경험치 없음
    
    let rewardMsg = `의뢰 완료! 골드 ${qData.rewards.gold.toLocaleString()}G, 경험치 ${qData.rewards.exp}를 획득했습니다.`;
    
    if (qData.rewards.items) {
        qData.rewards.items.forEach(rItem => {
            gainItem(rItem.id, rItem.count);
            rewardMsg += `\n[${rItem.id}] x${rItem.count} 획득!`;
        });
    }
    
    updatePlayerState({ quests: playerState.quests });
    window.gameAlert(rewardMsg, 'success', true);
    renderQuestList(document.getElementById('quest-modal').dataset.currentCycle);
};


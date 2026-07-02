let playerState = null;

document.addEventListener('DOMContentLoaded', () => {
    const lastAccount = sessionStorage.getItem('lastAccount');
    const lastSlot = sessionStorage.getItem('lastSlot');
    
    if (!lastAccount || !lastSlot) {
        window.location.href = 'index.html';
        return;
    }

    const account = DB.getAccount(lastAccount);
    if (!account || !account.characters[lastSlot]) {
        window.location.href = 'index.html';
        return;
    }

    const rawData = account.characters[lastSlot];
    const rawPlayerState = restoreCharacter(rawData);

    playerState = new Proxy(rawPlayerState, {
        set(target, property, value) {
            target[property] = value;
            if (typeof renderPlayerStats === 'function') {
                renderPlayerStats();
            }
            DB.saveCharacter(lastAccount, parseInt(lastSlot), rawPlayerState);
            return true;
        }
    });

    // 호환성 처리 및 오프라인 피로도 계산
    if (playerState.fatigue === undefined) {
        playerState.fatigue = playerState.maxFatigue;
        playerState.lastFatigueUpdate = Date.now();
    } else {
        const now = Date.now();
        const diffMs = now - playerState.lastFatigueUpdate;
        const diffMins = Math.floor(diffMs / 60000);
        if (diffMins > 0) {
            const tempFatigue = Math.min(playerState.maxFatigue, playerState.fatigue + diffMins);
            // proxy를 통해 할당하여 자동 렌더링 및 저장 트리거 (값이 같더라도 시간은 업데이트)
            playerState.fatigue = tempFatigue; 
            playerState.lastFatigueUpdate += diffMins * 60000;
        }
    }

    // 직업 레벨 및 경험치 시스템 완전 분리 호환성 마이그레이션
    if (playerState.jobLevel === undefined) {
        // 1. 구버전 경험치 테이블(레벨*100) 기준 총 누적 경험치 산출
        let totalOldExp = 0;
        for (let i = 1; i < playerState.level; i++) {
            totalOldExp += (i * 100);
        }
        totalOldExp += (playerState.exp || 0);

        // 2. 신버전 경험치 테이블(100*L^1.5) 적용하여 새로운 레벨 재계산
        let newLevel = 1;
        let newExp = totalOldExp;
        let req = EXP_DB.getRequiredExp(newLevel);
        while (newExp >= req && newLevel < 100) {
            newExp -= req;
            newLevel++;
            req = EXP_DB.getRequiredExp(newLevel);
        }

        // 3. 인벤토리 보존 및 장착 장비 회수
        const savedInventory = playerState.inventory || [];
        if (playerState.equipment) {
            for (let slot in playerState.equipment) {
                if (playerState.equipment[slot]) {
                    savedInventory.push(playerState.equipment[slot]);
                    playerState.equipment[slot] = null;
                }
            }
        }

        // 4. 캐릭터 완전 초기화 (새로운 레벨 적용)
        playerState.level = newLevel;
        playerState.exp = newExp;
        playerState.jobLevel = 1;
        playerState.jobExp = 0;
        playerState.job = "초보자";
        playerState.gold = 500;
        playerState.baseStats = { str: 1, agi: 1, dex: 1, vit: 1, int: 1, luk: 1 };
        playerState.statPoints = EXP_DB.getAccumulatedStatPoints(newLevel);
        playerState.skills = {};
        playerState.equippedSkills = [];
        playerState.inventory = savedInventory;
        
        // 체력 마나 갱신 (스탯 초기화 이후)
        playerState.currentHp = playerState.maxHp;
        playerState.currentMp = playerState.maxMp;
    } else if (playerState.statPoints === undefined) {
        // 아주 오래된 캐릭터를 위한 대비
        playerState.baseStats = { str: 1, agi: 1, dex: 1, vit: 1, int: 1, luk: 1 };
        playerState.statPoints = EXP_DB.getAccumulatedStatPoints(playerState.level);
    }

    // 신규 스킬 시스템(객체) 호환성 마이그레이션
    if (Array.isArray(playerState.skills)) {
        playerState.skills = {};
        playerState.equippedSkills = [];
        playerState.job = "초보자"; // 스킬 트리가 바뀌었으므로 직업도 리셋
        playerState.jobLevel = 1;
        playerState.jobExp = 0;
    }

    // 초보자의 옷 -> 천옷 마이그레이션
    if (playerState.inventory) {
        playerState.inventory.forEach(item => {
            if (item && item.id === '초보자의 옷') item.id = '천옷';
            if (item && item.name === '초보자의 옷') item.name = '천옷';
        });
    }
    if (playerState.equipment) {
        for (let slot in playerState.equipment) {
            if (playerState.equipment[slot] && playerState.equipment[slot].id === '초보자의 옷') {
                playerState.equipment[slot].id = '천옷';
            }
        }
    }

    // 아이템 스키마 마이그레이션 (전체 객체 -> 레퍼런스 및 스택)
    if (playerState.inventory) {
        let invMigrated = false;
        let newInventory = [];
        playerState.inventory.forEach(item => {
            if (!item) return;
            // 예전 방식(name 속성이 직접 존재)이라면 마이그레이션
            if (item.name && !item.id) {
                invMigrated = true;
                const baseItem = ITEM_DB[item.name];
                if (!baseItem) return;

                if (baseItem.type === 'consumable' || baseItem.type === 'material' || baseItem.type === 'etc') {
                    // 스택형 아이템
                    let existing = newInventory.find(i => i.id === baseItem.name);
                    if (existing) {
                        existing.count += (item.count || 1);
                    } else {
                        newInventory.push({ id: baseItem.name, count: item.count || 1 });
                    }
                } else {
                    // 장비형 아이템
                    newInventory.push({ id: baseItem.name, enhance: item.enhance || 0 });
                }
            } else {
                // 이미 마이그레이션 된 아이템
                newInventory.push(item);
            }
        });
        if (invMigrated) {
            playerState.inventory = newInventory;
        }
    }

    if (playerState.equipment) {
        for (let slot in playerState.equipment) {
            const eq = playerState.equipment[slot];
            if (eq && eq.name && !eq.id) {
                playerState.equipment[slot] = { id: eq.name, enhance: eq.enhance || 0 };
            }
        }
    }

    // 의뢰(Quest) 리셋 로직
    if (playerState.quests) {
        const todayStr = new Date().toISOString().split('T')[0];
        const weekStartStr = getStartOfWeek(new Date()).toISOString().split('T')[0];
        let questUpdated = false;

        if (playerState.quests.lastDailyReset !== todayStr) {
            playerState.quests.lastDailyReset = todayStr;
            // 일일 의뢰 관련 초기화 로직: history에서 일일 의뢰 삭제
            if (playerState.quests.history) {
                for (let qId in playerState.quests.history) {
                    if (QUEST_DB[qId] && QUEST_DB[qId].cycle === 'daily') {
                        delete playerState.quests.history[qId];
                    }
                }
            }
            questUpdated = true;
        }
        if (playerState.quests.lastWeeklyReset !== weekStartStr) {
            playerState.quests.lastWeeklyReset = weekStartStr;
            // 주간 의뢰 초기화
            if (playerState.quests.history) {
                for (let qId in playerState.quests.history) {
                    if (QUEST_DB[qId] && QUEST_DB[qId].cycle === 'weekly') {
                        delete playerState.quests.history[qId];
                    }
                }
            }
            questUpdated = true;
        }
        
        // active 퀘스트 중 삭제된(DB에 없는) 퀘스트 정리
        const validActiveQuests = playerState.quests.active.filter(q => QUEST_DB && QUEST_DB[q.id]);
        if (validActiveQuests.length !== playerState.quests.active.length) {
            playerState.quests.active = validActiveQuests;
            questUpdated = true;
        }
        
        // proxy를 통하므로 사실 직접 수정해도 되지만 안전하게 강제 렌더링
        if (questUpdated) updatePlayerState({ quests: playerState.quests });
    }

    // 10초마다 피로도 1분(60000ms) 경과 체크 후 회복
    setInterval(() => {
        if (!playerState) return;
        const now = Date.now();
        const diffMs = now - playerState.lastFatigueUpdate;
        const diffMins = Math.floor(diffMs / 60000);
        if (diffMins > 0) {
            playerState.fatigue = Math.min(playerState.maxFatigue, playerState.fatigue + diffMins);
            playerState.lastFatigueUpdate += diffMins * 60000;
        }
    }, 10000);

    if (typeof initGameUI === 'function') {
        initGameUI();
    }
});

function updatePlayerState(updates) {
    if (!playerState) return;
    for (const key in updates) {
        if (key === 'fatigue') {
            playerState[key] = Math.min(playerState.maxFatigue, updates[key]);
        } else if (key in playerState) {
            playerState[key] = updates[key];
        } else if (key === 'baseStats' || key === 'equipment') {
            Object.assign(playerState[key], updates[key]);
        }
    }
}

window.gainItem = function(itemId, count = 1, options = {}) {
    if (!playerState || !playerState.inventory) return;
    const baseItem = ITEM_DB[itemId];
    if (!baseItem) return;
    
    let newInv = [...playerState.inventory];
    if (baseItem.type === 'consumable' || baseItem.type === 'material' || baseItem.type === 'etc') {
        let existing = newInv.find(i => i.id === itemId);
        if (existing) {
            existing.count += count;
        } else {
            newInv.push({ id: itemId, count: count });
        }
    } else {
        // 장비류 (Stack 불가)
        for(let i=0; i<count; i++) {
            newInv.push({ id: itemId, enhance: options.enhance || 0, element: options.element || null, cards: options.cards || [] });
        }
    }
    updatePlayerState({ inventory: newInv });
};

window.loseItem = function(itemId, count = 1) {
    if (!playerState || !playerState.inventory) return false;
    let newInv = [...playerState.inventory];
    let existingIndex = newInv.findIndex(i => i.id === itemId);
    
    if (existingIndex !== -1) {
        let existing = newInv[existingIndex];
        if (existing.count && existing.count >= count) {
            existing.count -= count;
            if (existing.count <= 0) {
                newInv.splice(existingIndex, 1);
            }
            updatePlayerState({ inventory: newInv });
            return true;
        } else if (!existing.count && count === 1) {
            newInv.splice(existingIndex, 1);
            updatePlayerState({ inventory: newInv });
            return true;
        }
    }
    return false;
};

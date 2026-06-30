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

    // 테스트용 검 일회성 지급 및 10레벨 달성 로직 ("낮잠" 캐릭터 한정)
    if (playerState.name === "낮잠") {
        if (playerState.level < 10) {
            const levelDiff = 10 - playerState.level;
            playerState.level = 10;
            const stats = ['str', 'agi', 'dex', 'vit', 'int', 'luk'];
            stats.forEach(s => { playerState.baseStats[s] += levelDiff; });
            DB.saveCharacter(lastAccount, parseInt(lastSlot), rawPlayerState);
        }

        const hasTestSword = playerState.inventory.some(item => item && item.name === "테스트용 검") || 
                             Object.values(playerState.equipment).some(item => item && item.name === "테스트용 검");
        if (!hasTestSword && typeof ITEM_DB !== 'undefined' && ITEM_DB["테스트용 검"]) {
            playerState.inventory.push(JSON.parse(JSON.stringify(ITEM_DB["테스트용 검"])));
            DB.saveCharacter(lastAccount, parseInt(lastSlot), rawPlayerState);
        }
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

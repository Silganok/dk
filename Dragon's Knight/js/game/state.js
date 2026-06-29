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
        if (key in playerState) {
            playerState[key] = updates[key];
        } else if (key === 'baseStats' || key === 'equipment') {
            Object.assign(playerState[key], updates[key]);
        }
    }
}

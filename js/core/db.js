/**
 * 로컬 데이터베이스 모듈
 */
const DB = {
    load() {
        const data = localStorage.getItem('dragonsKnightDB');
        return data ? JSON.parse(data) : { accounts: {} };
    },
    save(data) {
        localStorage.setItem('dragonsKnightDB', JSON.stringify(data));
    },
    getAccount(accountId) {
        const db = this.load();
        const acc = db.accounts[accountId];
        if (acc && !acc.warehouse) {
            acc.warehouse = [];
            this.save(db);
        }
        return acc || null;
    },
    createAccount(accountId) {
        const db = this.load();
        if (db.accounts[accountId]) return false;
        db.accounts[accountId] = { characters: [null, null, null], warehouse: [] };
        this.save(db);
        return true;
    },
    checkNameDuplicate(name) {
        const db = this.load();
        for (const acc in db.accounts) {
            const chars = db.accounts[acc].characters;
            if (chars.some(c => c && c.name === name)) return true;
        }
        return false;
    },
    saveCharacter(accountId, slotIndex, characterData) {
        const db = this.load();
        if (!db.accounts[accountId]) return false;
        db.accounts[accountId].characters[slotIndex] = characterData;
        this.save(db);
        return true;
    },
    deleteCharacter(accountId, slotIndex) {
        const db = this.load();
        if (db.accounts[accountId]) {
            db.accounts[accountId].characters[slotIndex] = null;
            this.save(db);
        }
    },
    exportData() {
        const data = localStorage.getItem('dragonsKnightDB');
        if (!data) return null;
        return data;
    },
    importData(jsonData) {
        try {
            const parsed = JSON.parse(jsonData);
            if (!parsed || typeof parsed !== 'object' || !parsed.accounts) {
                return false;
            }
            this.save(parsed);
            return true;
        } catch (e) {
            return false;
        }
    },
    async backupToServer() {
        const dataStr = localStorage.getItem('dragonsKnightDB');
        if (!dataStr || !window.auth.currentUser) return;
        
        try {
            const parsed = JSON.parse(dataStr);
            const userAccount = parsed.accounts[window.auth.currentUser.uid];
            // 백업 최소화: 해당 유저의 데이터만 백업
            if (userAccount) {
                await window.database.ref('users/' + window.auth.currentUser.uid + '/data').set(userAccount);
                console.log("Firebase 백업 성공");
            }
        } catch(e) {
            console.error("Firebase 백업 실패:", e);
        }
    },
    async loadFromServer() {
        if (!window.auth.currentUser) return;
        
        try {
            const snapshot = await window.database.ref('users/' + window.auth.currentUser.uid + '/data').once('value');
            if (snapshot.exists()) {
                const serverData = snapshot.val();
                let localDb = this.load();
                // 기존 데이터에 병합 또는 덮어쓰기
                localDb.accounts[auth.currentUser.uid] = serverData;
                this.save(localDb);
                console.log("Firebase에서 로컬로 복원 완료");
            }
        } catch(e) {
            console.error("Firebase 복원 실패:", e);
        }
    }
};

window.MEAL_DB = {
    // 식사류 (메인)
    "bbq": {
        name: "돼지 바비큐",
        icon: "🍖",
        desc: "STR+3, 근접 공격력 10% 증가",
        price: 100,
        duration: 10,
        level: 1,
        category: 'main',
        effects: { str: 3, meleeAttackMultBonus: 0.1 }
    },
    "soup": {
        name: "버섯 수프",
        icon: "🥣",
        desc: "INT+3, 마법 공격력 10% 증가",
        price: 100,
        duration: 10,
        level: 1,
        category: 'main',
        effects: { int: 3, magicAttackMultBonus: 0.1 }
    },
    "salad": {
        name: "허브 샐러드",
        icon: "🥗",
        desc: "DEX+3, 원거리 공격력 10% 증가",
        price: 100,
        duration: 10,
        level: 1,
        category: 'main',
        effects: { dex: 3, rangedAttackMultBonus: 0.1 }
    },
    "sandwich": {
        name: "야채 샌드위치",
        icon: "🥪",
        desc: "AGI+3, 속도+3, 회피율 3% 증가",
        price: 100,
        duration: 10,
        level: 1,
        category: 'main',
        effects: { agi: 3, speedBonus: 3, evadeBonus: 3 }
    },
    "stew": {
        name: "고기 스튜",
        icon: "🍲",
        desc: "VIT+3, 방어력 10% 증가",
        price: 100,
        duration: 10,
        level: 1,
        category: 'main',
        effects: { vit: 3, defMultBonus: 0.1 }
    },
    "fish": {
        name: "생선 튀김",
        icon: "🍤",
        desc: "LUK+3, 크리티컬 확률 5% 증가",
        price: 100,
        duration: 10,
        level: 1,
        category: 'main',
        effects: { luk: 3, critBonus: 5 }
    },
    // 디저트류
    "pie": {
        name: "베리 파이",
        icon: "🥧",
        desc: "획득 경험치 10% 증가",
        price: 80,
        duration: 10,
        level: 1,
        category: 'dessert',
        effects: { expMultBonus: 0.1 }
    },
    "cake": {
        name: "초코 케이크",
        icon: "🍰",
        desc: "최대 HP/MP 10% 증가",
        price: 80,
        duration: 10,
        level: 1,
        category: 'dessert',
        effects: { hpMultBonus: 0.1, mpMultBonus: 0.1 }
    },
    "pudding": {
        name: "커스터드 푸딩",
        icon: "🍮",
        desc: "획득 골드 10% 증가",
        price: 80,
        duration: 10,
        level: 1,
        category: 'dessert',
        effects: { goldMultBonus: 0.1 }
    }
};

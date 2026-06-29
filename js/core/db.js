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
    }
};

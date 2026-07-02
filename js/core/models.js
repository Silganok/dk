/**
 * 파생 스탯 Getter 믹스인
 */
const playerGetters = {
    getJobBonus(stat) {
        if (!this.job || typeof JOB_DB === 'undefined' || !JOB_DB[this.job]) return 0;
        const jobData = JOB_DB[this.job];
        if (!jobData.maxBonusStats || !jobData.maxLevel) return 0;
        
        const ratio = (this.jobLevel - 1) / (jobData.maxLevel - 1);
        const maxStat = jobData.maxBonusStats[stat] || 0;
        return Math.floor(maxStat * ratio);
    },
    getEquipBonus(stat) {
        let bonus = 0;
        for (let slot in this.equipment) {
            const eqItem = this.equipment[slot];
            if (eqItem && typeof ITEM_DB !== 'undefined') {
                const baseItem = ITEM_DB[eqItem.id];
                if (baseItem && baseItem[stat]) {
                    let baseStat = baseItem[stat];
                    // 강화 수치 적용 로직
                    if (eqItem.enhance > 0) {
                        if (stat === 'attack' || stat === 'magicAttack') {
                            baseStat += (eqItem.enhance * 2); // 예시: 무기는 강화당 공격력 +2
                        } else if (stat === 'defense') {
                            baseStat += (eqItem.enhance * 1); // 예시: 방어구는 강화당 방어력 +1
                        }
                    }
                    bonus += baseStat;
                }
            }
        }
        return bonus;
    },
    getSetBonus(stat) {
        let bonus = 0;
        let w = this.equipment.weapon && ITEM_DB[this.equipment.weapon.id] ? ITEM_DB[this.equipment.weapon.id].name : '';
        let b = this.equipment.body && ITEM_DB[this.equipment.body.id] ? ITEM_DB[this.equipment.body.id].name : '';
        // Tier 1
        if (w.includes('기사') && b.includes('기사')) { if (stat === 'hpMult') bonus += 0.1; if (stat === 'accuracy') bonus += 5; }
        if (w.includes('사냥꾼') && b.includes('사냥꾼')) { if (stat === 'speed') bonus += 10; if (stat === 'evasion') bonus += 5; }
        if ((w.includes('마법학도') || w.includes('마법')) && (b.includes('마법사') || b.includes('마법학도'))) { if (stat === 'mpMult') bonus += 0.1; if (stat === 'magicAttack') bonus += 5; }
        // Tier 2
        if (w.includes('강철') && b.includes('미스릴')) { if (stat === 'attackMult') bonus += 0.1; if (stat === 'defMult') bonus += 0.1; }
        if ((w.includes('엘븐') || w.includes('저격수')) && b.includes('암살자')) { if (stat === 'evasion') bonus += 10; if (stat === 'critChance') bonus += 5; }
        if ((w.includes('수호자') || w.includes('원소')) && b.includes('현자')) { if (stat === 'magicAttackMult') bonus += 0.1; if (stat === 'mpMult') bonus += 0.1; }
        // Tier 3
        if ((w.includes('집행자') || w.includes('거인')) && b.includes('티타늄')) { if (stat === 'hpMult') bonus += 0.2; if (stat === 'critDamage') bonus += 20; }
        if ((w.includes('요정') || w.includes('발키리')) && b.includes('환영')) { if (stat === 'evasion') bonus += 20; if (stat === 'speed') bonus += 20; }
        if ((w.includes('현자의') || w.includes('대마법사')) && b.includes('아크메이지')) { if (stat === 'magicAttackMult') bonus += 0.2; if (stat === 'mpMult') bonus += 0.2; }
        return bonus;
    },
    getPassiveBonus(statBonusName) {
        let bonus = 0;
        if (!this.skills || Array.isArray(this.skills)) return 0; // 호환성 또는 빈 배열
        for (let skillName in this.skills) {
            const level = this.skills[skillName];
            const skillData = typeof SKILL_DB !== 'undefined' ? SKILL_DB[skillName] : null;
            if (skillData && skillData.type === 'passive' && skillData.getPassiveEffect) {
                const effect = skillData.getPassiveEffect(level);
                const wItem = this.equipment.weapon && typeof ITEM_DB !== 'undefined' ? ITEM_DB[this.equipment.weapon.id] : null;
                // 무기 제한 조건 확인 (한손검, 양손검 수련 등)
                if (skillName === "한손검 수련") {
                    if (wItem && wItem.subType === "한손검" && effect[statBonusName]) {
                        bonus += effect[statBonusName];
                    }
                } else if (skillName === "양손검 수련") {
                    if (wItem && wItem.subType === "양손검" && effect[statBonusName]) {
                        bonus += effect[statBonusName];
                    }
                } else {
                    if (effect[statBonusName]) {
                        bonus += effect[statBonusName];
                    }
                }
            }
        }
        return bonus;
    },
    getMealBonus(statBonusName) {
        let total = 0;
        const buffs = [];
        if (this.mealBuffs) {
            if (this.mealBuffs.main) buffs.push(this.mealBuffs.main);
            if (this.mealBuffs.dessert) buffs.push(this.mealBuffs.dessert);
        } else if (this.mealBuff) {
            buffs.push(this.mealBuff); // Fallback for old save data
        }

        for (const buff of buffs) {
            if (buff && buff.remainingBattles > 0) {
                const mealData = typeof window.MEAL_DB !== 'undefined' ? window.MEAL_DB[buff.id] : null;
                if (mealData && mealData.effects && mealData.effects[statBonusName]) {
                    total += mealData.effects[statBonusName];
                }
            }
        }
        return total;
    },
    getTotalStat(statName) {
        return this.baseStats[statName] + this.getJobBonus(statName) + this.getEquipBonus(statName) + this.getPassiveBonus(statName + 'Bonus') + this.getMealBonus(statName);
    },
    calcStatBonus(statName, multiplier) {
        const s = this.getTotalStat(statName);
        return (s * multiplier) + (Math.floor(s / 10) * (2 * multiplier));
    },
    get maxHp() { let base = 50 + this.calcStatBonus('vit', 10) + this.getEquipBonus('hp') + this.getPassiveBonus('hpBonus'); return Math.floor(base * (1 + this.getSetBonus('hpMult') + this.getMealBonus('hpMultBonus'))); },
    get maxMp() { let base = 20 + this.calcStatBonus('int', 5) + this.getEquipBonus('mp') + this.getPassiveBonus('mpBonus'); return Math.floor(base * (1 + this.getSetBonus('mpMult') + this.getMealBonus('mpMultBonus'))); },
    get meleeAttack() { let base = this.calcStatBonus('str', 2) + this.getEquipBonus('attack') + this.getEquipBonus('meleeAttack') + this.getPassiveBonus('attackBonus'); return Math.floor(base * (1 + this.getSetBonus('attackMult') + this.getMealBonus('meleeAttackMultBonus'))); },
    get rangedAttack() { let base = this.calcStatBonus('dex', 2) + this.getEquipBonus('attack') + this.getEquipBonus('rangedAttack') + this.getPassiveBonus('attackBonus'); return Math.floor(base * (1 + this.getSetBonus('attackMult') + this.getMealBonus('rangedAttackMultBonus'))); },
    get magicAttack() { let base = this.calcStatBonus('int', 2) + this.getEquipBonus('magicAttack') + this.getPassiveBonus('magicAttackBonus') + this.getSetBonus('magicAttack'); return Math.floor(base * (1 + this.getSetBonus('magicAttackMult') + this.getMealBonus('magicAttackMultBonus'))); },
    get equipDefense() { return Math.floor((this.getEquipBonus('defense') + this.getSetBonus('defense')) * (1 + this.getSetBonus('defMult') + this.getMealBonus('defMultBonus'))); },
    get vitDefense() { return Math.floor(this.calcStatBonus('vit', 1) + this.getPassiveBonus('defBonus')); },
    get defense() { return this.equipDefense + this.vitDefense; },
    get equipMagicDefense() { return Math.floor(this.getEquipBonus('magicDefense') + this.getSetBonus('magicDefense')); },
    get intDefense() { return Math.floor(this.calcStatBonus('int', 1)); },
    get magicDefense() { return this.equipMagicDefense + this.intDefense; },
    get speed() { return this.calcStatBonus('agi', 1) + this.getEquipBonus('speed') + this.getPassiveBonus('speedBonus') + this.getSetBonus('speed') + this.getMealBonus('speedBonus'); },
    get accuracy() { return 80 + this.calcStatBonus('dex', 1) + this.getEquipBonus('accuracy') + this.getPassiveBonus('hitRateBonus') + this.getSetBonus('accuracy') + this.getMealBonus('accuracyBonus'); },
    get evasion() { return this.calcStatBonus('agi', 2) + this.getEquipBonus('evasion') + this.getPassiveBonus('evadeBonus') + this.getSetBonus('evasion') + this.getMealBonus('evadeBonus'); },
    get critChance() { return 5 + this.calcStatBonus('luk', 0.5) + this.getEquipBonus('critChance') + this.getPassiveBonus('critBonus') + this.getSetBonus('critChance') + this.getMealBonus('critBonus'); },
    get critDamage() { return 200 + this.calcStatBonus('luk', 1) + this.getEquipBonus('critDamage') + this.getPassiveBonus('critDamageBonus') + this.getSetBonus('critDamage') + this.getMealBonus('critDamageBonus'); },
    get maxWeight() { return this.calcStatBonus('str', 10) + this.getEquipBonus('weight'); },
    get maxFatigue() { return 100 + ((this.level - 1) * 5); },
    get skillPoints() {
        let spent = 0;
        if (this.skills && !Array.isArray(this.skills)) {
            for (let skillName in this.skills) {
                spent += this.skills[skillName];
            }
        }
        // 기본 초보자일때도 JobLevel이 1이지만, 전직 전엔 스킬 포인트 0
        if (this.job === "초보자") return 0;
        return this.jobLevel - spent;
    }
};

function createNewCharacter(name, gender, appearance) {
    const raw = {
        name: name,
        gender: gender,
        appearance: appearance,
        level: 1,
        jobLevel: 1,
        job: "초보자",
        exp: 0,
        jobExp: 0,
        gold: 500,
        currentHp: 50,
        currentMp: 20,
        fatigue: 100,
        lastFatigueUpdate: Date.now(),
        statPoints: 0,
        baseStats: { str: 1, agi: 1, dex: 1, vit: 1, int: 1, luk: 1 },
        skills: {},
        equippedSkills: [],
        statusEffects: {},
        inventory: [],
        equipment: {
            weapon: { id: "단검", enhance: 0 },
            subWeapon: null,
            head: null,
            body: { id: "천옷", enhance: 0 },
            pants: null,
            shoes: null,
            accessory1: null,
            accessory2: null
        },
        mealBuffs: { main: null, dessert: null },
        quests: {
            active: [],
            history: {},
            lastDailyReset: new Date().toISOString().split('T')[0],
            lastWeeklyReset: getStartOfWeek(new Date()).toISOString().split('T')[0]
        }
    };
    Object.setPrototypeOf(raw, playerGetters);
    return raw;
}

function restoreCharacter(data) {
    if (!data.quests) {
        data.quests = {
            active: [],
            history: {},
            lastDailyReset: new Date().toISOString().split('T')[0],
            lastWeeklyReset: getStartOfWeek(new Date()).toISOString().split('T')[0]
        };
    }
    Object.setPrototypeOf(data, playerGetters);
    return data;
}

function getStartOfWeek(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day == 0 ? -6:1); // adjust when day is sunday
    return new Date(d.setDate(diff));
}

/**
 * 캐릭터 외형(초상화) 이미지 경로 반환 헬퍼 함수
 */
function getAppearanceImageURL(gender, appearance) {
    const prefix = gender === '여성' ? 'f' : 'm';
    const num = appearance.toString().padStart(2, '0'); // 1 -> '01'
    return `images/presets/${prefix}_${num}.png`;
}


// ==========================================
// Custom Notification & Alert / Confirm System
// ==========================================
window.notifications = [];
window.unreadNotifCount = 0;

window.gameAlert = function(msg, type = 'info', addToCenter = false) {
    console.log("[gameAlert]", msg);
    
    // 1. 토스트 생성
    const toastContainer = document.getElementById('toast-container');
    if (toastContainer) {
        const toast = document.createElement('div');
        toast.style.background = type === 'error' ? 'rgba(220, 38, 38, 0.9)' : 'rgba(59, 130, 246, 0.9)';
        toast.style.color = '#f8fafc';
        toast.style.padding = '10px 16px';
        toast.style.borderRadius = '6px';
        toast.style.boxShadow = '0 4px 6px rgba(0,0,0,0.3)';
        toast.style.fontSize = '13px';
        toast.style.fontWeight = 'bold';
        toast.style.transition = 'opacity 0.3s ease-in-out';
        toast.style.whiteSpace = 'pre-wrap';
        toast.textContent = msg;
        
        toastContainer.appendChild(toast);
        
        // 2.5초 후 서서히 사라짐
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => {
                if (toastContainer.contains(toast)) toastContainer.removeChild(toast);
            }, 300);
        }, 2500);
    }
    
    // 2. 알림 센터에 추가
    if (addToCenter) {
        const timestamp = new Date().toLocaleTimeString('ko-KR', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
        window.notifications.unshift({ msg, type, time: timestamp });
        if (window.notifications.length > 50) window.notifications.pop();
        
        window.unreadNotifCount++;
        updateNotifBadge();
        renderNotifList();
    }
};

window.gameConfirm = function(msg) {
    return new Promise((resolve) => {
        const modal = document.getElementById('custom-confirm-modal');
        const msgEl = document.getElementById('custom-confirm-msg');
        const btnYes = document.getElementById('btn-confirm-yes');
        const btnNo = document.getElementById('btn-confirm-no');
        
        if (!modal || !msgEl || !btnYes || !btnNo) {
            // Fallback
            resolve(confirm(msg));
            return;
        }
        
        msgEl.textContent = msg;
        modal.style.display = 'flex';
        
        const cleanup = () => {
            modal.style.display = 'none';
            btnYes.removeEventListener('click', onYes);
            btnNo.removeEventListener('click', onNo);
        };
        
        const onYes = () => { cleanup(); resolve(true); };
        const onNo = () => { cleanup(); resolve(false); };
        
        btnYes.addEventListener('click', onYes);
        btnNo.addEventListener('click', onNo);
    });
};

function updateNotifBadge() {
    const badge = document.getElementById('notif-badge');
    if (!badge) return;
    if (window.unreadNotifCount > 0) {
        badge.style.display = 'block';
        badge.textContent = window.unreadNotifCount > 9 ? '9+' : window.unreadNotifCount;
    } else {
        badge.style.display = 'none';
    }
}

function renderNotifList() {
    const listEl = document.getElementById('notification-list');
    if (!listEl) return;
    
    if (window.notifications.length === 0) {
        listEl.innerHTML = '<div style="text-align: center; color: #64748b; padding: 20px 0;">최근 알림이 없습니다.</div>';
        return;
    }
    
    listEl.innerHTML = '';
    window.notifications.forEach(notif => {
        const item = document.createElement('div');
        item.style.padding = '8px';
        item.style.borderBottom = '1px solid #334155';
        item.style.display = 'flex';
        item.style.flexDirection = 'column';
        item.style.gap = '4px';
        
        const color = notif.type === 'error' ? '#fca5a5' : '#93c5fd';
        
        item.innerHTML = `
            <div style="font-size: 10px; color: #94a3b8;">${notif.time}</div>
            <div style="color: ${color}; font-size: 13px; line-height: 1.4; white-space: pre-wrap;">${notif.msg}</div>
        `;
        listEl.appendChild(item);
    });
}

// 초기화 시 이벤트 리스너 등록
window.addEventListener('DOMContentLoaded', () => {
    const btnNotif = document.getElementById('btn-notification');
    const notifModal = document.getElementById('notification-center-modal');
    const btnCloseNotif = document.getElementById('btn-close-notif');
    
    if (btnNotif && notifModal) {
        btnNotif.addEventListener('click', () => {
            notifModal.style.display = 'block';
            window.unreadNotifCount = 0;
            updateNotifBadge();
        });
    }
    
    if (btnCloseNotif && notifModal) {
        btnCloseNotif.addEventListener('click', () => {
            notifModal.style.display = 'none';
        });
    }
});

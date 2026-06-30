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
            if (this.equipment[slot] && this.equipment[slot][stat]) {
                bonus += this.equipment[slot][stat];
            }
        }
        return bonus;
    },
    getSetBonus(stat) {
        let bonus = 0;
        let w = this.equipment.weapon ? this.equipment.weapon.name : '';
        let b = this.equipment.body ? this.equipment.body.name : '';
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
                // 무기 제한 조건 확인 (한손검, 양손검 수련 등)
                if (skillName === "한손검 수련") {
                    if (this.equipment.weapon && this.equipment.weapon.subType === "한손검" && effect[statBonusName]) {
                        bonus += effect[statBonusName];
                    }
                } else if (skillName === "양손검 수련") {
                    if (this.equipment.weapon && this.equipment.weapon.subType === "양손검" && effect[statBonusName]) {
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
    getTotalStat(statName) {
        return this.baseStats[statName] + this.getJobBonus(statName) + this.getEquipBonus(statName) + this.getPassiveBonus(statName + 'Bonus');
    },
    calcStatBonus(statName, multiplier) {
        const s = this.getTotalStat(statName);
        return (s * multiplier) + (Math.floor(s / 10) * (2 * multiplier));
    },
    get maxHp() { let base = 50 + this.calcStatBonus('vit', 10) + this.getEquipBonus('hp') + this.getPassiveBonus('hpBonus'); return Math.floor(base * (1 + this.getSetBonus('hpMult'))); },
    get maxMp() { let base = 20 + this.calcStatBonus('int', 5) + this.getEquipBonus('mp') + this.getPassiveBonus('mpBonus'); return Math.floor(base * (1 + this.getSetBonus('mpMult'))); },
    get meleeAttack() { let base = this.calcStatBonus('str', 2) + this.getEquipBonus('attack') + this.getEquipBonus('meleeAttack') + this.getPassiveBonus('attackBonus'); return Math.floor(base * (1 + this.getSetBonus('attackMult'))); },
    get rangedAttack() { let base = this.calcStatBonus('dex', 2) + this.getEquipBonus('attack') + this.getEquipBonus('rangedAttack') + this.getPassiveBonus('attackBonus'); return Math.floor(base * (1 + this.getSetBonus('attackMult'))); },
    get magicAttack() { let base = this.calcStatBonus('int', 2) + this.getEquipBonus('magicAttack') + this.getPassiveBonus('magicAttackBonus') + this.getSetBonus('magicAttack'); return Math.floor(base * (1 + this.getSetBonus('magicAttackMult'))); },
    get defense() { let base = this.calcStatBonus('vit', 1) + this.getEquipBonus('defense') + this.getPassiveBonus('defBonus'); return Math.floor(base * (1 + this.getSetBonus('defMult'))); },
    get speed() { return this.calcStatBonus('agi', 1) + this.getEquipBonus('speed') + this.getPassiveBonus('speedBonus') + this.getSetBonus('speed'); },
    get accuracy() { return 80 + this.calcStatBonus('dex', 1) + this.getEquipBonus('accuracy') + this.getPassiveBonus('hitRateBonus') + this.getSetBonus('accuracy'); },
    get evasion() { return this.calcStatBonus('agi', 2) + this.getEquipBonus('evasion') + this.getPassiveBonus('evadeBonus') + this.getSetBonus('evasion'); },
    get critChance() { return 5 + this.calcStatBonus('luk', 0.5) + this.getEquipBonus('critChance') + this.getPassiveBonus('critBonus') + this.getSetBonus('critChance'); },
    get critDamage() { return 200 + this.calcStatBonus('luk', 1) + this.getEquipBonus('critDamage') + this.getPassiveBonus('critDamageBonus') + this.getSetBonus('critDamage'); },
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
        inventory: [
            JSON.parse(JSON.stringify(ITEM_DB["단검"])),
            JSON.parse(JSON.stringify(ITEM_DB["초보자의 옷"]))
        ],
        equipment: {
            weapon: JSON.parse(JSON.stringify(ITEM_DB["단검"])),
            subWeapon: null,
            head: null,
            body: JSON.parse(JSON.stringify(ITEM_DB["초보자의 옷"])),
            pants: null,
            shoes: null,
            accessory1: null,
            accessory2: null
        }
    };
    Object.setPrototypeOf(raw, playerGetters);
    return raw;
}

function restoreCharacter(data) {
    Object.setPrototypeOf(data, playerGetters);
    return data;
}

/**
 * 캐릭터 외형(초상화) 이미지 경로 반환 헬퍼 함수
 */
function getAppearanceImageURL(gender, appearance) {
    const prefix = gender === '여성' ? 'f' : 'm';
    const num = appearance.toString().padStart(2, '0'); // 1 -> '01'
    return `images/presets/${prefix}_${num}.png`;
}

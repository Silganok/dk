/**
 * 파생 스탯 Getter 믹스인
 */
const playerGetters = {
    getEquipBonus(stat) {
        let bonus = 0;
        for (let slot in this.equipment) {
            if (this.equipment[slot] && this.equipment[slot][stat]) {
                bonus += this.equipment[slot][stat];
            }
        }
        return bonus;
    },
    getTotalStat(statName) {
        return this.baseStats[statName] + this.getEquipBonus(statName);
    },
    // 10단위 추가 가중치 적용 (10의 배수일 때 해당 포인트의 효율이 3배가 됨 = 추가 2배 보너스)
    calcStatBonus(statName, multiplier) {
        const s = this.getTotalStat(statName);
        return (s * multiplier) + (Math.floor(s / 10) * (2 * multiplier));
    },
    get maxHp() { return 50 + this.calcStatBonus('vit', 10) + this.getEquipBonus('hp'); },
    get maxMp() { return 20 + this.calcStatBonus('int', 5) + this.getEquipBonus('mp'); },
    get meleeAttack() { return this.calcStatBonus('str', 2) + this.getEquipBonus('attack') + this.getEquipBonus('meleeAttack'); },
    get rangedAttack() { return this.calcStatBonus('dex', 2) + this.getEquipBonus('attack') + this.getEquipBonus('rangedAttack'); },
    get magicAttack() { return this.calcStatBonus('int', 2) + this.getEquipBonus('magicAttack'); },
    get defense() { return this.calcStatBonus('vit', 1) + this.getEquipBonus('defense'); },
    get speed() { return this.calcStatBonus('agi', 1) + this.getEquipBonus('speed'); },
    get accuracy() { return 80 + this.calcStatBonus('dex', 1) + this.getEquipBonus('accuracy'); },
    get evasion() { return this.calcStatBonus('agi', 0.5) + this.getEquipBonus('evasion'); },
    get critChance() { return 5 + this.calcStatBonus('luk', 0.5) + this.getEquipBonus('critChance'); },
    get critDamage() { return 200 + this.calcStatBonus('luk', 1) + this.getEquipBonus('critDamage'); },
    get maxWeight() { return this.calcStatBonus('str', 10) + this.getEquipBonus('weight'); },
    get maxFatigue() { return 100 + ((this.level - 1) * 5); }
};

function createNewCharacter(name, gender, appearance) {
    const raw = {
        name: name,
        gender: gender,
        appearance: appearance,
        level: 1,
        job: "초보자",
        exp: 0,
        gold: 500,
        currentHp: 50,
        currentMp: 20,
        fatigue: 100,
        lastFatigueUpdate: Date.now(),
        baseStats: { str: 1, agi: 1, dex: 1, vit: 1, int: 1, luk: 1 },
        skills: [],
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

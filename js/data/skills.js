const SKILL_DB = {
    // ================== 검사 스킬 ==================
    "한손검 수련": {
        name: "한손검 수련",
        type: "passive",
        maxLevel: 10,
        reqJob: "검사",
        reqSkills: {},
        desc: "한손검 장착 시 최종 데미지가 증가합니다.",
        getPassiveEffect: (level) => ({ attackBonus: level * 2 })
    },
    "양손검 수련": {
        name: "양손검 수련",
        type: "passive",
        maxLevel: 10,
        reqJob: "검사",
        reqSkills: { "한손검 수련": 1 },
        desc: "양손검 장착 시 최종 데미지가 크게 증가합니다.",
        getPassiveEffect: (level) => ({ attackBonus: level * 4 })
    },
    "HP회복력 향상": {
        name: "HP회복력 향상",
        type: "passive",
        maxLevel: 10,
        reqJob: "검사",
        reqSkills: {},
        desc: "전투 중 턴 종료 시 HP를 회복합니다.",
        getPassiveEffect: (level) => ({ hpRegen: level * 5 })
    },
    "배쉬": {
        name: "배쉬",
        type: "active",
        maxLevel: 10,
        reqJob: "검사",
        reqSkills: {},
        desc: "적에게 강한 근접 타격을 가합니다.",
        element: "무",
        cooldown: 1,
        getCostMp: (level) => 5 + level,
        getMultiplier: (level) => 1.1 + (level * 0.15)
    },
    "매그넘 브레이크": {
        name: "매그넘 브레이크",
        type: "active",
        maxLevel: 10,
        reqJob: "검사",
        reqSkills: { "배쉬": 5 },
        desc: "강력한 화염 속성 타격을 가합니다.",
        element: "화",
        cooldown: 4,
        getCostMp: (level) => 10 + (level * 2),
        getMultiplier: (level) => 1.3 + (level * 0.17)
    },
    "프로보크": {
        name: "프로보크",
        type: "active", // debuff
        maxLevel: 10,
        reqJob: "검사",
        reqSkills: {},
        desc: "도발하여 전투 내내 적 방어력을 0으로 깎고 공격력을 1.5배 올립니다.",
        element: "무",
        cooldown: 3,
        getCostMp: (level) => 5,
        getMultiplier: (level) => 0,
        getHitChance: (level) => 50 + (level * 3) // %
    },
    "인듀어": {
        name: "인듀어",
        type: "active", // buff
        maxLevel: 10,
        reqJob: "검사",
        reqSkills: { "프로보크": 5 },
        desc: "일정 턴 동안 방어력을 대폭 상승시키는 버프입니다.",
        element: "무",
        cooldown: 8,
        getCostMp: (level) => 20,
        getMultiplier: (level) => 0,
        getBuffDuration: (level) => level * 2,
        getBuffEffect: (level) => ({ defBonus: level * 3 })
    },

    // ================== 마법사 스킬 ==================
    "SP회복력 향상": {
        name: "SP회복력 향상",
        type: "passive",
        maxLevel: 10,
        reqJob: "마법사",
        reqSkills: {},
        desc: "전투 중 턴 종료 시 MP를 회복합니다.",
        getPassiveEffect: (level) => ({ mpRegen: level * 2 })
    },
    "네이팜 비트": {
        name: "네이팜 비트",
        type: "active",
        maxLevel: 10,
        reqJob: "마법사",
        reqSkills: {},
        desc: "가벼운 염속성 마법을 구사합니다.",
        element: "염",
        cooldown: 1,
        getCostMp: (level) => 5 + level,
        getMultiplier: (level) => 0.8 + (level * 0.1)
    },
    "소울 스트라이크": {
        name: "소울 스트라이크",
        type: "active",
        maxLevel: 10,
        reqJob: "마법사",
        reqSkills: { "네이팜 비트": 4 },
        desc: "염속성 2연속 마법 타격을 입힙니다.",
        element: "염",
        cooldown: 3,
        hits: 2,
        getCostMp: (level) => 10 + (level * 2),
        getMultiplier: (level) => 0.7 + (level * 0.1) // per hit
    },
    "콜드 볼트": {
        name: "콜드 볼트",
        type: "active",
        maxLevel: 10,
        reqJob: "마법사",
        reqSkills: {},
        desc: "수속성 마법을 발사합니다.",
        element: "수",
        cooldown: 2,
        getCostMp: (level) => 8 + level,
        getMultiplier: (level) => 1.0 + (level * 0.2)
    },
    "프로스트 다이버": {
        name: "프로스트 다이버",
        type: "active",
        maxLevel: 10,
        reqJob: "마법사",
        reqSkills: { "콜드 볼트": 5 },
        desc: "수속성 마법으로 적을 얼려 1턴간 스턴(빙결)시킵니다.",
        element: "수",
        cooldown: 4,
        getCostMp: (level) => 15 + (level * 2),
        getMultiplier: (level) => 1.2 + (level * 0.15),
        getHitChance: (level) => 25 + (level * 3)
    },
    "라이트닝 볼트": {
        name: "라이트닝 볼트",
        type: "active",
        maxLevel: 10,
        reqJob: "마법사",
        reqSkills: {},
        desc: "풍속성 마법을 발사합니다.",
        element: "풍",
        cooldown: 2,
        getCostMp: (level) => 8 + level,
        getMultiplier: (level) => 1.0 + (level * 0.2)
    },
    "선더 스톰": {
        name: "선더 스톰",
        type: "active",
        maxLevel: 10,
        reqJob: "마법사",
        reqSkills: { "라이트닝 볼트": 4 },
        desc: "강력한 풍속성 벼락을 내리칩니다.",
        element: "풍",
        cooldown: 5,
        getCostMp: (level) => 25 + (level * 3),
        getMultiplier: (level) => 1.5 + (level * 0.25)
    },
    "화이어 볼트": {
        name: "화이어 볼트",
        type: "active",
        maxLevel: 10,
        reqJob: "마법사",
        reqSkills: {},
        desc: "화속성 마법을 발사합니다.",
        element: "화",
        cooldown: 2,
        getCostMp: (level) => 8 + level,
        getMultiplier: (level) => 1.0 + (level * 0.2)
    },
    "화이어 볼": {
        name: "화이어 볼",
        type: "active",
        maxLevel: 10,
        reqJob: "마법사",
        reqSkills: { "화이어 볼트": 4 },
        desc: "화속성 마법구. 치명타 확률이 높습니다.",
        element: "화",
        cooldown: 4,
        getCostMp: (level) => 12 + level,
        getMultiplier: (level) => 1.2 + (level * 0.15),
        getPassiveEffect: (level) => ({ critBonus: 10 }) // only applied during this skill, handled in engine
    },
    "사이트": {
        name: "사이트",
        type: "active",
        maxLevel: 1,
        reqJob: "마법사",
        reqSkills: {},
        desc: "3턴 간 명중률이 100%가 됩니다.",
        element: "무",
        cooldown: 5,
        getCostMp: (level) => 10,
        getMultiplier: (level) => 0,
        getBuffDuration: (level) => 3,
        getBuffEffect: (level) => ({ hitRateBonus: 100 })
    },
    "화이어 월": {
        name: "화이어 월",
        type: "active",
        maxLevel: 10,
        reqJob: "마법사",
        reqSkills: { "화이어 볼": 5, "사이트": 1 },
        desc: "지정 턴 동안 적 공격 시 화속성 반사 데미지를 줍니다.",
        element: "화",
        cooldown: 5,
        getCostMp: (level) => 20 + (level * 3),
        getMultiplier: (level) => 0,
        getBuffDuration: (level) => level
    },
    "스톤 커스": {
        name: "스톤 커스",
        type: "active",
        maxLevel: 10,
        reqJob: "마법사",
        reqSkills: {},
        desc: "적을 확률적으로 1턴간 석화(스턴)시킵니다.",
        element: "지",
        cooldown: 6,
        getCostMp: (level) => 20,
        getMultiplier: (level) => 0,
        getHitChance: (level) => 30 + (level * 4)
    },
    "세이프티 월": {
        name: "세이프티 월",
        type: "active",
        maxLevel: 10,
        reqJob: "마법사",
        reqSkills: { "네이팜 비트": 7, "소울 스트라이크": 5 },
        desc: "지정 턴 동안 회피율이 대폭 상승하는 궁극의 방어막입니다.",
        element: "무",
        cooldown: 8,
        getCostMp: (level) => 30 + (level * 2),
        getMultiplier: (level) => 0,
        getBuffDuration: (level) => level,
        getBuffEffect: (level) => ({ evadeBonus: Math.min(90, 40 + (level * 5)) }) // max 90% evade
    },

    // ================== 궁수 스킬 ==================
    "올빼미의 눈": {
        name: "올빼미의 눈",
        type: "passive",
        maxLevel: 10,
        reqJob: "궁수",
        reqSkills: {},
        desc: "캐릭터의 DEX가 영구 증가합니다.",
        getPassiveEffect: (level) => ({ dexBonus: level * 1 })
    },
    "독수리의 눈": {
        name: "독수리의 눈",
        type: "passive",
        maxLevel: 10,
        reqJob: "궁수",
        reqSkills: { "올빼미의 눈": 3 },
        desc: "명중률과 치명타 확률이 영구 증가합니다.",
        getPassiveEffect: (level) => ({ hitRateBonus: level * 2, critBonus: level * 1 })
    },
    "집중력 향상": {
        name: "집중력 향상",
        type: "active",
        maxLevel: 10,
        reqJob: "궁수",
        reqSkills: { "독수리의 눈": 1 },
        desc: "일정 턴 동안 AGI와 DEX를 추가로 증가시키는 버프입니다.",
        element: "무",
        cooldown: 8,
        getCostMp: (level) => 15 + level,
        getMultiplier: (level) => 0,
        getBuffDuration: (level) => level * 2,
        getBuffEffect: (level) => ({ agiBonus: level * 1, dexBonus: level * 1 })
    },
    "더블 스트레이핑": {
        name: "더블 스트레이핑",
        type: "active",
        maxLevel: 10,
        reqJob: "궁수",
        reqSkills: {},
        desc: "적에게 2발의 화살을 연속으로 발사합니다.",
        element: "무",
        cooldown: 2,
        hits: 2,
        getCostMp: (level) => 8 + (level * 2),
        getMultiplier: (level) => 0.9 + (level * 0.1) // per hit
    },
    "애로우 샤워": {
        name: "애로우 샤워",
        type: "active",
        maxLevel: 10,
        reqJob: "궁수",
        reqSkills: { "더블 스트레이핑": 5 },
        desc: "강력한 일격을 날리며 치명타 피해량이 1.5배 증폭됩니다.",
        element: "무",
        cooldown: 4,
        getCostMp: (level) => 15 + (level * 2),
        getMultiplier: (level) => 1.5 + (level * 0.2)
    }
};

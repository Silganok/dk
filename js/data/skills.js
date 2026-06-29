const SKILL_DB = {
    "강타": { 
        name: "강타", 
        costMp: 10, 
        multiplier: 1.5, 
        statScale: "meleeAttack", // 근접 공격력 기반
        desc: "무기를 강하게 내리쳐 근접 공격력의 1.5배 피해를 입힙니다." 
    },
    "에너지 볼트": { 
        name: "에너지 볼트", 
        costMp: 15, 
        multiplier: 2.0, 
        statScale: "magicAttack", // 마법 공격력 기반
        desc: "응축된 마력 덩어리를 발사하여 마법 공격력의 2배 피해를 입힙니다." 
    },
    "전투용 스킬1": { 
        name: "전투용 스킬1", 
        costMp: 5, 
        multiplier: 1.2, 
        statScale: "meleeAttack", 
        desc: "초보자를 위한 테스트 스킬 1입니다." 
    },
    "전투용 스킬2": { 
        name: "전투용 스킬2", 
        costMp: 10, 
        multiplier: 1.5, 
        statScale: "meleeAttack", 
        desc: "초보자를 위한 테스트 스킬 2입니다." 
    },
    "전투용 스킬3": { 
        name: "전투용 스킬3", 
        costMp: 15, 
        multiplier: 2.0, 
        statScale: "magicAttack", 
        desc: "초보자를 위한 마법 테스트 스킬 3입니다." 
    }
};

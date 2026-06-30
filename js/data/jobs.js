const JOB_DB = {
    "초보자": {
        reqLevel: 1,
        reqJobLevel: 1,
        reqJob: null,
        maxLevel: 10,
        maxBonusStats: {},
        bonusSkills: [],
        desc: "이제 막 모험을 시작한 초보자입니다."
    },
    "검사": {
        reqLevel: 10,
        reqJobLevel: 10,
        reqJob: "초보자",
        maxLevel: 50,
        maxBonusStats: { str: 7, agi: 2, vit: 4, int: 0, dex: 3, luk: 2 },
        bonusSkills: ["한손검 수련", "양손검 수련", "HP회복력 향상", "배쉬", "매그넘 브레이크", "프로보크", "인듀어"],
        desc: "강인한 체력과 힘을 바탕으로 적을 물리치는 근접 전투의 전문가입니다."
    },
    "마법사": {
        reqLevel: 10,
        reqJobLevel: 10,
        reqJob: "초보자",
        maxLevel: 50,
        maxBonusStats: { str: 0, agi: 4, vit: 0, int: 7, dex: 3, luk: 3 },
        bonusSkills: ["SP회복력 향상", "네이팜 비트", "소울 스트라이크", "콜드 볼트", "프로스트 다이버", "라이트닝 볼트", "선더 스톰", "화이어 볼트", "화이어 볼", "사이트", "화이어 월", "스톤 커스", "세이프티 월"],
        desc: "마법을 다루어 원거리에서 강력한 공격을 퍼붓는 직업입니다."
    },
    "궁수": {
        reqLevel: 10,
        reqJobLevel: 10,
        reqJob: "초보자",
        maxLevel: 50,
        maxBonusStats: { str: 3, agi: 3, vit: 1, int: 2, dex: 7, luk: 2 },
        bonusSkills: ["올빼미의 눈", "독수리의 눈", "집중력 향상", "더블 스트레이핑", "애로우 샤워"],
        desc: "활을 다루어 멀리서 적의 약점을 정확하게 노리는 직업입니다."
    }
};

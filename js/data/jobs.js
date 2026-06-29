const JOB_DB = {
    "초보자": {
        reqLevel: 1,
        reqJob: null,
        bonusStats: {},
        bonusSkills: ["전투용 스킬1", "전투용 스킬2", "전투용 스킬3"],
        desc: "이제 막 모험을 시작한 초보자입니다."
    },
    "검사": {
        reqLevel: 10,
        reqJob: "초보자",
        bonusStats: { str: 5, vit: 5 },
        bonusSkills: ["강타"],
        desc: "강인한 체력과 힘을 바탕으로 적을 물리치는 근접 전투의 전문가입니다."
    },
    "마법사": {
        reqLevel: 10,
        reqJob: "초보자",
        bonusStats: { int: 8, dex: 2 },
        bonusSkills: ["에너지 볼트"],
        desc: "마법을 다루어 원거리에서 강력한 공격을 퍼붓는 직업입니다."
    }
};

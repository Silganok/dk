const FIELD_DB = {
    "초보자 평원": {
        name: "초보자 평원",
        desc: "비교적 얌전한 몬스터들이 출몰하는 평원입니다.",
        reqLevel: 1,
        monsters: [
            { id: "슬라임", weight: 60 },
            { id: "고블린", weight: 40 }
        ]
    },
    "어두운 숲": {
        name: "어두운 숲",
        desc: "햇빛이 잘 들지 않아 흉폭한 몬스터들이 사는 숲입니다.",
        reqLevel: 5,
        monsters: [
            { id: "고블린", weight: 30 },
            { id: "오크", weight: 70 }
        ]
    },
    "버려진 광산": {
        name: "버려진 광산",
        desc: "언데드와 기괴한 생물들이 배회하는 버려진 광산입니다.",
        reqLevel: 10,
        monsters: [
            { id: "스켈레톤", weight: 60 },
            { id: "박쥐", weight: 40 }
        ]
    },
    "용의 둥지": {
        name: "용의 둥지",
        desc: "강력한 드래곤들이 서식하는 위험한 화산 지대입니다.",
        reqLevel: 20,
        requireItem: "둥지로의 열쇠",
        monsters: [
            { id: "레드 드래곤", weight: 100 }
        ]
    }
};

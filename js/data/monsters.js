const MONSTER_DB = {
    // Lv 1
    "포링": { name: "포링", element: "수", hp: 10, attack: 3, defense: 1, speed: 10, accuracy: 71, evasion: 5, luk: 0, exp: 45, jobExp: 45, gold: 10, dropTable: "포링" },
    "파브르": { name: "파브르", element: "지", hp: 14, attack: 4, defense: 2, speed: 11, accuracy: 73, evasion: 5, luk: 0, exp: 55, jobExp: 90, gold: 20, dropTable: "파브르" },
    "루나틱": { name: "루나틱", element: "무", hp: 12, attack: 5, defense: 2, speed: 11, accuracy: 74, evasion: 7, luk: 0, exp: 90, jobExp: 55, gold: 20, dropTable: "루나틱" },
    "엔젤링": { name: "엔젤링", element: "성", hp: 196, attack: 25, defense: 10, speed: 12, accuracy: 77, evasion: 8, luk: 1, exp: 300, jobExp: 250, gold: 500, dropTable: "엔젤링" },

    // Lv 10
    "로커": { name: "로커", element: "지", hp: 105, attack: 35, defense: 12, speed: 30, accuracy: 100, evasion: 15, luk: 2, exp: 150, jobExp: 120, gold: 100, dropTable: "로커" },
    "쵸코": { name: "쵸코", element: "지", hp: 232, attack: 29, defense: 13, speed: 15, accuracy: 86, evasion: 10, luk: 2, exp: 181, jobExp: 145, gold: 110, dropTable: "쵸코" },
    "픽키": { name: "픽키", element: "화", hp: 122, attack: 37, defense: 13, speed: 32, accuracy: 104, evasion: 16, luk: 2, exp: 181, jobExp: 145, gold: 110, dropTable: "픽키" },
    "마스터링": { name: "마스터링", element: "수", hp: 1596, attack: 55, defense: 30, speed: 17, accuracy: 92, evasion: 16, luk: 3, exp: 1687, jobExp: 1350, gold: 1500, dropTable: "마스터링" },

    // Lv 20
    "스포아": { name: "스포아", element: "수", hp: 1141, attack: 34, defense: 24, speed: 20, accuracy: 100, evasion: 9, luk: 4, exp: 600, jobExp: 480, gold: 200, dropTable: "스포아" },
    "포이즌 스포아": { name: "포이즌 스포아", element: "지", hp: 1376, attack: 36, defense: 26, speed: 21, accuracy: 103, evasion: 9, luk: 4, exp: 726, jobExp: 580, gold: 220, dropTable: "포이즌 스포아" },
    "타라 프로그": { name: "타라 프로그", element: "수", hp: 792, attack: 47, defense: 25, speed: 20, accuracy: 101, evasion: 15, luk: 4, exp: 661, jobExp: 529, gold: 210, dropTable: "타라 프로그" },
    "엠버나이트": { name: "엠버나이트", element: "수", hp: 1255, attack: 35, defense: 25, speed: 20, accuracy: 101, evasion: 9, luk: 4, exp: 661, jobExp: 529, gold: 210, dropTable: "엠버나이트" },
    "토드": { name: "토드", element: "수", hp: 4396, attack: 85, defense: 50, speed: 22, accuracy: 126, evasion: 23, luk: 5, exp: 4687, jobExp: 3750, gold: 2500, dropTable: "토드" },

    // Lv 30
    "고블린": { name: "고블린", element: "지", hp: 777, attack: 85, defense: 36, speed: 70, accuracy: 137, evasion: 35, luk: 6, exp: 1350, jobExp: 1080, gold: 300, dropTable: "고블린" },
    "오크 워리어": { name: "오크 워리어", element: "지", hp: 1812, attack: 67, defense: 38, speed: 26, accuracy: 118, evasion: 21, luk: 6, exp: 1536, jobExp: 1228, gold: 320, dropTable: "오크 워리어" },
    "오크 레이디": { name: "오크 레이디", element: "지", hp: 828, attack: 87, defense: 37, speed: 72, accuracy: 139, evasion: 36, luk: 6, exp: 1441, jobExp: 1153, gold: 310, dropTable: "오크 레이디" },
    "오크 히어로": { name: "오크 히어로", element: "지", hp: 8596, attack: 115, defense: 70, speed: 27, accuracy: 148, evasion: 31, luk: 7, exp: 9187, jobExp: 7350, gold: 3500, dropTable: "오크 히어로" },

    // Lv 40
    "워그": { name: "워그", element: "풍", hp: 1365, attack: 110, defense: 48, speed: 90, accuracy: 160, evasion: 45, luk: 8, exp: 2400, jobExp: 1920, gold: 400, dropTable: "워그" },
    "맨티스": { name: "맨티스", element: "풍", hp: 1502, attack: 115, defense: 50, speed: 94, accuracy: 164, evasion: 47, luk: 8, exp: 2646, jobExp: 2116, gold: 420, dropTable: "맨티스" },
    "플로라": { name: "플로라", element: "지", hp: 4727, attack: 59, defense: 49, speed: 30, accuracy: 131, evasion: 13, luk: 8, exp: 2521, jobExp: 2017, gold: 410, dropTable: "플로라" },
    "드래곤 플라이": { name: "드래곤 플라이", element: "풍", hp: 14196, attack: 145, defense: 90, speed: 32, accuracy: 171, evasion: 38, luk: 9, exp: 15187, jobExp: 12150, gold: 4500, dropTable: "드래곤 플라이" },

    // Lv 50
    "마타": { name: "마타", element: "화", hp: 4396, attack: 100, defense: 60, speed: 35, accuracy: 145, evasion: 30, luk: 10, exp: 3750, jobExp: 3000, gold: 500, dropTable: "마타" },
    "그랜드 페코": { name: "그랜드 페코", element: "화", hp: 4753, attack: 103, defense: 62, speed: 36, accuracy: 148, evasion: 31, luk: 10, exp: 4056, jobExp: 3244, gold: 520, dropTable: "그랜드 페코" },
    "고트": { name: "고트", element: "지", hp: 7303, attack: 71, defense: 61, speed: 35, accuracy: 146, evasion: 15, luk: 10, exp: 3901, jobExp: 3121, gold: 510, dropTable: "고트" },
    "프리오니": { name: "프리오니", element: "무", hp: 21196, attack: 175, defense: 110, speed: 37, accuracy: 193, evasion: 46, luk: 11, exp: 22687, jobExp: 18150, gold: 5500, dropTable: "프리오니" },

    // Lv 60
    "아르고스": { name: "아르고스", element: "지", hp: 6321, attack: 118, defense: 72, speed: 40, accuracy: 160, evasion: 35, luk: 12, exp: 5400, jobExp: 4320, gold: 600, dropTable: "아르고스" },
    "사이드 와인더": { name: "사이드 와인더", element: "지", hp: 3249, attack: 165, defense: 74, speed: 134, accuracy: 209, evasion: 67, luk: 12, exp: 5766, jobExp: 4612, gold: 620, dropTable: "사이드 와인더" },
    "그리폰": { name: "그리폰", element: "풍", hp: 3146, attack: 162, defense: 73, speed: 132, accuracy: 207, evasion: 66, luk: 12, exp: 5581, jobExp: 4465, gold: 610, dropTable: "그리폰" },
    "하피": { name: "하피", element: "풍", hp: 3354, attack: 167, defense: 75, speed: 136, accuracy: 211, evasion: 68, luk: 12, exp: 5953, jobExp: 4762, gold: 630, dropTable: "하피" },
    "블러디 머더러": { name: "블러디 머더러", element: "무", hp: 29595, attack: 205, defense: 130, speed: 42, accuracy: 216, evasion: 53, luk: 13, exp: 31687, jobExp: 25350, gold: 6500, dropTable: "블러디 머더러" },

    // Lv 70
    "듀라한": { name: "듀라한", element: "염", hp: 13741, attack: 94, defense: 84, speed: 45, accuracy: 175, evasion: 19, luk: 14, exp: 7350, jobExp: 5880, gold: 700, dropTable: "듀라한" },
    "하이딩": { name: "하이딩", element: "염", hp: 4375, attack: 190, defense: 86, speed: 154, accuracy: 232, evasion: 77, luk: 14, exp: 7776, jobExp: 6220, gold: 720, dropTable: "하이딩" },
    "로리루리": { name: "로리루리", element: "무", hp: 8842, attack: 137, defense: 85, speed: 45, accuracy: 176, evasion: 40, luk: 14, exp: 7561, jobExp: 6049, gold: 710, dropTable: "로리루리" },
    "로드 오브 데스": { name: "로드 오브 데스", element: "염", hp: 39396, attack: 235, defense: 150, speed: 47, accuracy: 238, evasion: 61, luk: 15, exp: 42187, jobExp: 33750, gold: 7500, dropTable: "로드 오브 데스" },

    // Lv 80
    "와이즈먼": { name: "와이즈먼", element: "수", hp: 11221, attack: 154, defense: 96, speed: 50, accuracy: 190, evasion: 45, luk: 16, exp: 9600, jobExp: 7680, gold: 800, dropTable: "와이즈먼" },
    "슬리퍼": { name: "슬리퍼", element: "지", hp: 18848, attack: 108, defense: 98, speed: 51, accuracy: 193, evasion: 21, luk: 16, exp: 10086, jobExp: 8068, gold: 820, dropTable: "슬리퍼" },
    "드레이크": { name: "드레이크", element: "수", hp: 11502, attack: 155, defense: 97, speed: 50, accuracy: 191, evasion: 45, luk: 16, exp: 9841, jobExp: 7873, gold: 810, dropTable: "드레이크" },
    "이그니젬 세니아": { name: "이그니젬 세니아", element: "화", hp: 50596, attack: 265, defense: 170, speed: 52, accuracy: 261, evasion: 68, luk: 17, exp: 54187, jobExp: 43350, gold: 8500, dropTable: "이그니젬 세니아" },

    // Lv 90
    "아트로스": { name: "아트로스", element: "무", hp: 14196, attack: 172, defense: 108, speed: 55, accuracy: 205, evasion: 50, luk: 18, exp: 12150, jobExp: 9720, gold: 900, dropTable: "아트로스" },
    "도플갱어": { name: "도플갱어", element: "무", hp: 6976, attack: 237, defense: 109, speed: 192, accuracy: 275, evasion: 96, luk: 18, exp: 12421, jobExp: 9937, gold: 910, dropTable: "도플갱어" },
    "에드가": { name: "에드가", element: "화", hp: 14832, attack: 175, defense: 110, speed: 56, accuracy: 208, evasion: 51, luk: 18, exp: 12696, jobExp: 10156, gold: 920, dropTable: "에드가" },
    "마야": { name: "마야", element: "지", hp: 24238, attack: 121, defense: 111, speed: 56, accuracy: 209, evasion: 23, luk: 18, exp: 12973, jobExp: 10378, gold: 930, dropTable: "마야" },
    "바포메트": { name: "바포메트", element: "염", hp: 68628, attack: 307, defense: 198, speed: 59, accuracy: 292, evasion: 79, luk: 19, exp: 73507, jobExp: 58806, gold: 9900, dropTable: "바포메트" }
};

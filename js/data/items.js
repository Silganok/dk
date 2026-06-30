const ITEM_DB = {
    // 무기
    "단검": { name: "단검", type: "weapon", subType: "단검", attack: 3, price: 50, desc: "가장 기본적인 짧은 검입니다." },
    "철검": { name: "철검", type: "weapon", subType: "한손검", attack: 8, price: 150, desc: "철로 만들어진 견고한 검입니다." },
    "마법의 지팡이": { name: "마법의 지팡이", type: "weapon", subType: "스태프", magicAttack: 10, price: 200, desc: "마력이 깃든 나무 지팡이입니다." },
    "테스트용 검": { name: "테스트용 검", type: "weapon", subType: "한손검", attack: 10, str: 9, dex: 9, price: 1, desc: "스탯 보너스 테스트를 위한 검입니다. 장착 시 STR과 DEX가 크게 오릅니다." },
    "화염의 검": { name: "화염의 검", type: "weapon", subType: "한손검", element: "화", attack: 15, price: 500, desc: "타오르는 화염 속성을 가진 한손검입니다." },
    "얼음 단검": { name: "얼음 단검", type: "weapon", subType: "단검", element: "수", attack: 12, price: 400, desc: "얼어붙은 수속성 단검입니다." },
    
    // 방어구
    "초보자의 옷": { name: "초보자의 옷", type: "body", defense: 2, price: 20, desc: "여행자들이 입는 낡은 옷입니다." },
    "가죽 갑옷": { name: "가죽 갑옷", type: "body", defense: 5, price: 100, desc: "동물의 가죽을 덧대어 만든 튼튼한 갑옷입니다." },
    
    // 소비 아이템
    "초보자 체력 포션": { name: "초보자 체력 포션", type: "consumable", healHp: 30, price: 10, desc: "체력을 30 회복합니다." },
    "초보자 마나 포션": { name: "초보자 마나 포션", type: "consumable", healMp: 20, price: 15, desc: "마나를 20 회복합니다." },

    // 기존 재료 아이템 (기타로 통합 취급하거나 유지)
    "슬라임의 점액": { name: "슬라임의 점액", type: "material", price: 5, desc: "슬라임에게서 얻은 끈적끈적한 점액입니다. 아이템 제작에 쓰일지도 모릅니다." },
    "고블린의 송곳니": { name: "고블린의 송곳니", type: "material", price: 10, desc: "고블린이 지니고 있던 송곳니입니다. 장신구 재료로 쓰입니다." },
    "오크의 가죽": { name: "오크의 가죽", type: "material", price: 15, desc: "오크에게서 얻은 질긴 가죽입니다. 갑옷을 만들 때 사용됩니다." },
    "철광석": { name: "철광석", type: "material", price: 20, desc: "철이 섞인 광석입니다. 대장간에서 주괴로 만들 수 있습니다." },

    // 이벤트 아이템
    "초보자 지원 상자": { name: "초보자 지원 상자", type: "event", desc: "초보 모험가를 위한 특별한 선물이 들어있는 상자입니다." },
    "여신의 축복 쿠폰": { name: "여신의 축복 쿠폰", type: "event", desc: "이벤트 기간 동안 경험치와 드랍률을 올려줍니다." },
    "둥지로의 열쇠": { name: "둥지로의 열쇠", type: "event", desc: "용의 둥지로 가는 길을 여는 신비한 열쇠입니다. 입장 시 1개가 소모됩니다." },

    // 신규 기타(Etc) 아이템
    "젤로피": { name: "젤로피", type: "etc", price: 3, desc: "포링이 떨어뜨린 투명한 젤리 모양의 물체." },
    "빈 병": { name: "빈 병", type: "etc", price: 2, desc: "무언가를 담을 수 있는 빈 유리병." },
    "파브르의 털": { name: "파브르의 털", type: "etc", price: 4, desc: "파브르의 부드러운 털." },
    "토끼풀": { name: "토끼풀", type: "etc", price: 5, desc: "루나틱이 좋아하는 풀잎." },
    "신성한 깃털": { name: "신성한 깃털", type: "etc", price: 50, desc: "엔젤링이 떨어뜨린 성스러운 깃털." },
    "메뚜기의 뒷다리": { name: "메뚜기의 뒷다리", type: "etc", price: 6, desc: "로커의 튼튼한 뒷다리." },
    "원숭이 꼬리": { name: "원숭이 꼬리", type: "etc", price: 7, desc: "쵸코의 긴 꼬리." },
    "새의 깃털": { name: "새의 깃털", type: "etc", price: 6, desc: "픽키의 깃털." },
    "마스터 젤로피": { name: "마스터 젤로피", type: "etc", price: 30, desc: "마스터링의 거대한 젤로피." },
    "버섯 포자": { name: "버섯 포자", type: "etc", price: 8, desc: "스포아가 뿜어내는 독특한 포자." },
    "맹독 가루": { name: "맹독 가루", type: "etc", price: 10, desc: "포이즌 스포아의 맹독성 가루." },
    "개구리 알": { name: "개구리 알", type: "etc", price: 12, desc: "타라 프로그의 끈적한 알." },
    "달팽이 껍질": { name: "달팽이 껍질", type: "etc", price: 11, desc: "엠버나이트의 단단한 껍질." },
    "끈적이는 물갈퀴": { name: "끈적이는 물갈퀴", type: "etc", price: 80, desc: "토드의 거대한 물갈퀴." },
    "고블린의 털": { name: "고블린의 털", type: "etc", price: 14, desc: "고블린의 거친 털." },
    "오크의 증표": { name: "오크의 증표", type: "etc", price: 15, desc: "오크 전사임을 증명하는 증표." },
    "오크의 화장품": { name: "오크의 화장품", type: "etc", price: 16, desc: "오크 레이디가 애용하는 화장품." },
    "영웅의 증표": { name: "영웅의 증표", type: "etc", price: 150, desc: "오크 히어로의 강력함을 상징하는 증표." },
    "늑대 발톱": { name: "늑대 발톱", type: "etc", price: 18, desc: "워그의 날카로운 발톱." },
    "사마귀의 낫": { name: "사마귀의 낫", type: "etc", price: 20, desc: "맨티스의 날카로운 앞다리." },
    "식물의 줄기": { name: "식물의 줄기", type: "etc", price: 19, desc: "플로라의 질긴 줄기." },
    "잠자리 날개": { name: "잠자리 날개", type: "etc", price: 200, desc: "드래곤 플라이의 투명한 날개." },
    "붉은 갈기": { name: "붉은 갈기", type: "etc", price: 22, desc: "마타의 타오르는 듯한 갈기." },
    "단단한 부리": { name: "단단한 부리", type: "etc", price: 24, desc: "그랜드 페코의 강력한 부리." },
    "염소의 뿔": { name: "염소의 뿔", type: "etc", price: 25, desc: "고트의 튼튼한 뿔." },
    "빛나는 이빨": { name: "빛나는 이빨", type: "etc", price: 300, desc: "프리오니의 탐욕스러운 이빨." },
    "거미줄": { name: "거미줄", type: "etc", price: 30, desc: "아르고스의 질긴 거미줄." },
    "뱀 비늘": { name: "뱀 비늘", type: "etc", price: 32, desc: "사이드 와인더의 매끄러운 비늘." },
    "그리폰의 발톱": { name: "그리폰의 발톱", type: "etc", price: 35, desc: "그리폰의 날카로운 발톱." },
    "하피의 날개": { name: "하피의 날개", type: "etc", price: 34, desc: "하피의 날개 깃털." },
    "피묻은 칼날": { name: "피묻은 칼날", type: "etc", price: 400, desc: "블러디 머더러가 사용하던 흉기." },
    "듀라한의 갑옷 조각": { name: "듀라한의 갑옷 조각", type: "etc", price: 40, desc: "듀라한이 입고 있던 갑옷의 파편." },
    "저주받은 붕대": { name: "저주받은 붕대", type: "etc", price: 42, desc: "하이딩을 감싸고 있던 불길한 붕대." },
    "마녀의 빗자루 가지": { name: "마녀의 빗자루 가지", type: "etc", price: 45, desc: "로리루리가 타고 다니던 빗자루 조각." },
    "죽음의 조각": { name: "죽음의 조각", type: "etc", price: 500, desc: "로드 오브 데스가 남긴 죽음의 기운." },
    "낡은 마법진": { name: "낡은 마법진", type: "etc", price: 50, desc: "와이즈먼이 그리던 마법진의 흔적." },
    "고운 모래": { name: "고운 모래", type: "etc", price: 55, desc: "슬리퍼의 몸을 이루고 있던 모래." },
    "해적의 두건": { name: "해적의 두건", type: "etc", price: 60, desc: "드레이크 선장의 낡은 두건." },
    "기사의 긍지": { name: "기사의 긍지", type: "etc", price: 800, desc: "이그니젬 세니아가 끝까지 쥐고 있던 훈장." },
    "거대한 검은 늑대 가죽": { name: "거대한 검은 늑대 가죽", type: "etc", price: 1000, desc: "아트로스의 칠흑 같은 가죽." },
    "깨진 거울 조각": { name: "깨진 거울 조각", type: "etc", price: 1200, desc: "도플갱어를 비추던 기분 나쁜 거울 파편." },
    "에드가의 파이프": { name: "에드가의 파이프", type: "etc", price: 1500, desc: "에드가가 물고 있던 담뱃대." },
    "개미의 턱": { name: "개미의 턱", type: "etc", price: 1400, desc: "마야의 거대하고 위협적인 턱." },
    "바포메트의 뿔": { name: "바포메트의 뿔", type: "etc", price: 5000, desc: "파괴의 화신, 바포메트의 잘린 뿔." }
};

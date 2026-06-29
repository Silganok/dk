const ITEM_DB = {
    // 무기
    "단검": { name: "단검", type: "weapon", subType: "단검", attack: 3, price: 50, desc: "가장 기본적인 짧은 검입니다." },
    "철검": { name: "철검", type: "weapon", subType: "한손검", attack: 8, price: 150, desc: "철로 만들어진 견고한 검입니다." },
    "마법의 지팡이": { name: "마법의 지팡이", type: "weapon", subType: "스태프", magicAttack: 10, price: 200, desc: "마력이 깃든 나무 지팡이입니다." },
    "테스트용 검": { name: "테스트용 검", type: "weapon", subType: "한손검", attack: 10, str: 9, dex: 9, price: 1, desc: "스탯 보너스 테스트를 위한 검입니다. 장착 시 STR과 DEX가 크게 오릅니다." },
    
    // 방어구
    "초보자의 옷": { name: "초보자의 옷", type: "body", defense: 2, price: 20, desc: "여행자들이 입는 낡은 옷입니다." },
    "가죽 갑옷": { name: "가죽 갑옷", type: "body", defense: 5, price: 100, desc: "동물의 가죽을 덧대어 만든 튼튼한 갑옷입니다." },
    
    // 소비 아이템 (추후 인벤토리 구현 시 사용)
    "초보자 체력 포션": { name: "초보자 체력 포션", type: "consumable", healHp: 30, price: 10, desc: "체력을 30 회복합니다." },
    "초보자 마나 포션": { name: "초보자 마나 포션", type: "consumable", healMp: 20, price: 15, desc: "마나를 20 회복합니다." },

    // 재료 아이템
    "슬라임의 점액": { name: "슬라임의 점액", type: "material", price: 5, desc: "슬라임에게서 얻은 끈적끈적한 점액입니다. 아이템 제작에 쓰일지도 모릅니다." },
    "고블린의 송곳니": { name: "고블린의 송곳니", type: "material", price: 10, desc: "고블린이 지니고 있던 송곳니입니다. 장신구 재료로 쓰입니다." },
    "오크의 가죽": { name: "오크의 가죽", type: "material", price: 15, desc: "오크에게서 얻은 질긴 가죽입니다. 갑옷을 만들 때 사용됩니다." },
    "철광석": { name: "철광석", type: "material", price: 20, desc: "철이 섞인 광석입니다. 대장간에서 주괴로 만들 수 있습니다." },

    // 이벤트 아이템
    "초보자 지원 상자": { name: "초보자 지원 상자", type: "event", desc: "초보 모험가를 위한 특별한 선물이 들어있는 상자입니다." },
    "여신의 축복 쿠폰": { name: "여신의 축복 쿠폰", type: "event", desc: "이벤트 기간 동안 경험치와 드랍률을 올려줍니다." },
    "둥지로의 열쇠": { name: "둥지로의 열쇠", type: "event", desc: "용의 둥지로 가는 길을 여는 신비한 열쇠입니다. 입장 시 1개가 소모됩니다." }
};

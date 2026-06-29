const EXP_DB = {
    // 요구 경험치 계산 함수
    getRequiredExp: function(level) {
        return level * 100;
    },
    
    // 레벨업 시 스탯 보너스 테이블
    levelUpBonus: {
        str: 1, agi: 1, dex: 1, vit: 1, int: 1, luk: 1
    }
};

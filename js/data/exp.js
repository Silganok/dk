const EXP_DB = {
    // 요구 경험치 계산 함수
    getRequiredExp: function(level) {
        return Math.floor(100 * Math.pow(level, 2));
    },
    getRequiredJobExp: function(jobLevel) {
        return Math.floor(100 * Math.pow(jobLevel, 1.2));
    },
    
    getStatPointsOnLevelUp: function(level) {
        if (level <= 1) return 0;
        return Math.floor((level - 1) / 10) * 2 + 2;
    },
    getAccumulatedStatPoints: function(level) {
        let total = 0;
        for (let i = 2; i <= level; i++) {
            total += this.getStatPointsOnLevelUp(i);
        }
        return total;
    },
    getStatUpgradeCost: function(currentStat) {
        return Math.floor((currentStat - 1) / 10) + 1;
    }
};

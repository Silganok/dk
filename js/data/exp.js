const BASE_EXP_TABLE = [
    0, 28, 57, 86, 115, 144, 309, 474, 639, 804, 1615, 1890, 2165, 2440, 2715, 2990, 4094, 5197, 6301, 7404, 9529, 10765, 12001, 13237, 14473, 15709, 19119, 22530, 25940, 29351, 31498, 34777, 38056, 41335, 44613, 47892, 59666, 71440, 83214, 94988, 116334, 129164, 141994, 154823, 167653, 180483, 208586, 236689, 264793, 292896, 315671, 343308, 370945, 398582, 426219, 453856, 525625, 597394, 669163, 740932, 853057, 928390, 1003722, 1079055, 1154388, 1229721, 1362793, 1495865, 1628937, 1762009, 1911836, 2046085, 2180334, 2314582, 2448831, 2583079, 2803608, 3024137, 3244666, 3465195, 3671875, 3891575, 4111275, 4330976, 4550676, 4770376, 5153430, 5536484, 5919537, 6302591, 6914605, 7310776, 7706948, 8103120, 8499292, 8895464, 9291636, 9687808, 10083980, 10480152
];

const EXP_DB = {
    // 요구 경험치 계산 함수
    getRequiredExp: function(level) {
        if (level < 1 || level > 99) return 999999999;
        return BASE_EXP_TABLE[level];
    },
    getRequiredJobExp: function(jobLevel, jobName) {
        let tier = 1;
        if (jobName && typeof JOB_DB !== 'undefined' && JOB_DB[jobName]) {
            tier = JOB_DB[jobName].tier !== undefined ? JOB_DB[jobName].tier : 1;
        }

        let baseExp = Math.floor(151.08 * Math.pow(jobLevel, 2.5));
        
        if (tier === 0) {
            return jobLevel * 17; // 1~9레벨 총합 765 (베이스 레벨 6구간 누적 739보다 약간 많음)
        } else if (tier === 1) {
            return baseExp;
        } else {
            return baseExp * tier;
        }
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

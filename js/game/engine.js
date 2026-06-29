/**
 * 경험치 및 레벨업 시스템
 */
function addExp(amount) {
    if (!playerState) return;
    if (playerState.job === "초보자" && playerState.level >= 10) return;

    let newExp = playerState.exp + amount;
    let requiredExp = EXP_DB.getRequiredExp(playerState.level);
    let levelUp = false;

    while (newExp >= requiredExp) {
        if (playerState.job === "초보자" && playerState.level >= 10) {
            newExp = requiredExp;
            break;
        }
        
        newExp -= requiredExp;
        playerState.level += 1;
        levelUp = true;
        requiredExp = EXP_DB.getRequiredExp(playerState.level);
        
        for (let stat in EXP_DB.levelUpBonus) {
            playerState.baseStats[stat] += EXP_DB.levelUpBonus[stat];
        }
    }

    playerState.exp = newExp; 

    if (levelUp) {
        playerState.currentHp = playerState.maxHp;
        playerState.currentMp = playerState.maxMp;
        alert(`레벨업! 레벨 ${playerState.level}이 되었습니다.\n모든 기본 스탯이 상승하고 체력/마력이 회복되었습니다.`);
        if (typeof renderPlayerStats === 'function') renderPlayerStats();
    }
}

let currentMonster = null;

function calculateHit(attackerAcc, defenderEva) {
    const hitChance = Math.max(20, 100 + (attackerAcc - defenderEva) * 2);
    return (Math.random() * 100) < hitChance;
}

function calculateCrit(attackerLuk) {
    const critChance = 5 + (attackerLuk * 0.5);
    return (Math.random() * 100) < critChance;
}

function getAutoSkill() {
    if (!playerState.equippedSkills || playerState.equippedSkills.length === 0) return null;
    
    const roll = Math.random() * 100;
    let cumulativeProb = 0;
    
    for (let eqSkill of playerState.equippedSkills) {
        if (eqSkill.prob > 0) {
            cumulativeProb += eqSkill.prob;
            if (roll < cumulativeProb) {
                const skillData = SKILL_DB[eqSkill.name];
                if (skillData && playerState.currentMp >= skillData.costMp) {
                    return skillData;
                } else {
                    return null; // Not enough MP, fallback to normal attack
                }
            }
        }
    }
    return null; // Fallback to normal attack
}

function executePlayerAction(skill = null) {
    if (!currentMonster || playerState.currentHp <= 0) return;
    if (typeof setCombatButtonsState === 'function') setCombatButtonsState(true);

    window.combatTurnCount = (window.combatTurnCount || 0) + 1;
    
    if (window.combatTurnCount > 100) {
        if (typeof addCombatLog === 'function') addCombatLog("100턴이 경과하여 전투에서 패배했습니다. (체력 1로 마을 귀환)", "#ef4444");
        setTimeout(() => {
            playerState.currentHp = 1;
            if (typeof endCombat === 'function') {
                endCombat();
                if (typeof switchTab === 'function') switchTab('town');
            }
        }, 1500);
        return;
    }

    if (!skill) {
        const autoSkill = getAutoSkill();
        if (autoSkill) {
            skill = autoSkill;
            if (typeof updatePlayerState === 'function') {
                updatePlayerState({ currentMp: playerState.currentMp - skill.costMp });
            } else {
                playerState.currentMp -= skill.costMp;
            }
        }
    }

    const pSpeed = playerState.speed;
    const mSpeed = currentMonster.speed;
    
    // 더블 어택 확률 계산 (플레이어)
    let doubleAttackChance = Math.max(0, (pSpeed - mSpeed) * 2);
    doubleAttackChance = Math.min(50, doubleAttackChance);
    const hasDoubleAttack = (Math.random() * 100) < doubleAttackChance;
    const playerAttacks = hasDoubleAttack ? 2 : 1;

    // 더블 어택 확률 계산 (몬스터)
    let mDoubleAttackChance = Math.max(0, (mSpeed - pSpeed) * 2);
    mDoubleAttackChance = Math.min(50, mDoubleAttackChance);
    const mHasDoubleAttack = (Math.random() * 100) < mDoubleAttackChance;
    const monsterAttacks = mHasDoubleAttack ? 2 : 1;

    // 선공 주사위 굴림 (속도 + 0~20%)
    const pSpeedRoll = pSpeed + (Math.random() * pSpeed * 0.2);
    const mSpeedRoll = mSpeed + (Math.random() * mSpeed * 0.2);
    const pGoesFirst = pSpeedRoll >= mSpeedRoll;

    if (typeof addCombatLog === 'function') {
        const turnInitiativeName = pGoesFirst ? playerState.name : currentMonster.name;
        addCombatLog(`[턴 ${window.combatTurnCount}] 👑 ${turnInitiativeName}의 선공!`, "#e2e8f0");
    }

    if (pGoesFirst) {
        playerAttackTurn(skill, 1, playerAttacks, () => {
            if (currentMonster && currentMonster.hp > 0) {
                setTimeout(() => monsterAttackTurn(1, monsterAttacks, endCombatTurn), 800);
            } else {
                endCombatTurn();
            }
        });
    } else {
        monsterAttackTurn(1, monsterAttacks, () => {
            if (playerState.currentHp > 0) {
                setTimeout(() => playerAttackTurn(skill, 1, playerAttacks, endCombatTurn), 800);
            } else {
                endCombatTurn();
            }
        });
    }
}

function getPlayerDamageVarianceMultiplier() {
    let weapon = playerState.equipment ? playerState.equipment.weapon : null;
    let subType = weapon ? weapon.subType : null;
    
    let baseMin = 0.85;
    let baseMax = 1.15;

    if (subType === "단검" || subType === "완드") {
        baseMin = 0.90; baseMax = 1.10;
    } else if (subType === "양손검" || subType === "스태프") {
        baseMin = 0.75; baseMax = 1.25;
    } else if (subType === "도끼" || subType === "장궁") {
        baseMin = 0.70; baseMax = 1.30;
    }

    let dex = playerState.calcStatBonus ? playerState.calcStatBonus('dex', 1) : playerState.baseStats.dex;
    dex = Math.min(100, Math.max(0, dex));
    
    let newMin = baseMin + (baseMax - baseMin) * (dex / 100);
    return newMin + Math.random() * (baseMax - newMin);
}

function playerAttackTurn(skill, currentAttack, totalAttacks, callback) {
    if (!currentMonster) return;
    
    if (playerState.currentHp <= 0 || currentMonster.hp <= 0) {
        if (callback) callback(); return;
    }

    if (currentAttack === 2) {
        if (typeof addCombatLog === 'function') addCombatLog(`⚡ 압도적인 속도로 한 번 더 공격합니다!`, "#fcd34d");
    }

    if (!calculateHit(playerState.accuracy, currentMonster.evasion)) {
        if (typeof addCombatLog === 'function') addCombatLog("당신의 공격이 빗나갔습니다!", "#94a3b8");
        if (currentAttack < totalAttacks) {
            setTimeout(() => playerAttackTurn(skill, currentAttack + 1, totalAttacks, callback), 800);
        } else {
            callback();
        }
        return;
    }

    let rawDamage = playerState.meleeAttack;
    let skillName = "일반 공격";
    
    if (skill) {
        skillName = skill.name;
        const skillData = SKILL_DB[skill.name];
        if (skillData) {
            rawDamage = playerState[skillData.statScale] * skillData.multiplier;
        }
    }

    // 무기 편차 및 DEX 보정 적용
    rawDamage *= getPlayerDamageVarianceMultiplier();

    let isCrit = calculateCrit(playerState.baseStats.luk);
    if (isCrit) {
        rawDamage = rawDamage * (playerState.critDamage / 100);
    }

    let finalDamage = Math.max(1, Math.floor(rawDamage - currentMonster.defense));
    currentMonster.hp -= finalDamage;

    if (typeof updateCombatUI === 'function') updateCombatUI();
    if (typeof addCombatLog === 'function') {
        const msg = `${skillName}! 몬스터에게 ${finalDamage}의 데미지를 입혔습니다!`;
        addCombatLog(msg, isCrit ? "crit-text" : "#60a5fa");
    }

    if (currentMonster.hp <= 0) {
        setTimeout(handleMonsterDeath, 500);
    } else {
        if (currentAttack < totalAttacks) {
            setTimeout(() => playerAttackTurn(skill, currentAttack + 1, totalAttacks, callback), 800);
        } else {
            callback();
        }
    }
}

function monsterAttackTurn(currentAttack, totalAttacks, callback) {
    if (!currentMonster) return;
    
    if (playerState.currentHp <= 0 || currentMonster.hp <= 0) {
        if (callback) callback(); return;
    }

    if (currentAttack === 2) {
        if (typeof addCombatLog === 'function') addCombatLog(`⚡ 몬스터가 재빠르게 추가 공격을 가합니다!`, "#fcd34d");
    }

    if (!calculateHit(currentMonster.accuracy, playerState.evasion)) {
        if (typeof addCombatLog === 'function') addCombatLog("몬스터의 공격을 회피했습니다!", "#10b981");
        if (currentAttack < totalAttacks) {
            setTimeout(() => monsterAttackTurn(currentAttack + 1, totalAttacks, callback), 800);
        } else {
            callback();
        }
        return;
    }

    let rawDamage = currentMonster.attack;
    
    // 몬스터 데미지 기본 편차 적용 (85% ~ 115%)
    const variance = 0.85 + Math.random() * 0.30;
    rawDamage *= variance;

    let isCrit = calculateCrit(currentMonster.luk);
    if (isCrit) {
        rawDamage *= 1.5;
    }

    let finalDamage = Math.max(1, Math.floor(rawDamage - playerState.defense));
    playerState.currentHp = Math.max(0, playerState.currentHp - finalDamage);

    if (typeof updateCombatUI === 'function') updateCombatUI();
    if (typeof addCombatLog === 'function') {
        const msg = `몬스터의 공격! 당신은 ${finalDamage}의 피해를 입었습니다.`;
        addCombatLog(msg, isCrit ? "crit-text" : "#ef4444");
    }

    if (playerState.currentHp <= 0) {
        if (typeof addCombatLog === 'function') addCombatLog("당신은 쓰러졌습니다... (체력 1로 마을 귀환)", "#ef4444");
        setTimeout(() => {
            playerState.currentHp = 1;
            if (typeof endCombat === 'function') {
                endCombat();
                if (typeof switchTab === 'function') switchTab('town');
            }
        }, 1500);
    } else {
        if (currentAttack < totalAttacks) {
            setTimeout(() => monsterAttackTurn(currentAttack + 1, totalAttacks, callback), 800);
        } else {
            callback();
        }
    }
}

function handleMonsterDeath() {
    let dropMsg = "";
    if (currentMonster.dropTable && DROP_DB[currentMonster.dropTable]) {
        const drops = DROP_DB[currentMonster.dropTable];
        drops.forEach(drop => {
            if ((Math.random() * 100) < drop.chance) {
                const item = ITEM_DB[drop.itemId];
                if (item) {
                    playerState.inventory.push(JSON.parse(JSON.stringify(item)));
                    dropMsg += `\n[${item.name}]을(를) 획득했습니다!`;
                }
            }
        });
    }

    if (typeof addCombatLog === 'function') {
        addCombatLog(`몬스터 처치! 경험치 ${currentMonster.exp}, 골드 ${currentMonster.gold}G 획득${dropMsg}`, "#34d399");
    }
    updatePlayerState({ gold: playerState.gold + currentMonster.gold });
    addExp(currentMonster.exp);
    
    setTimeout(() => {
        if (typeof endCombat === 'function') {
            endCombat();
            
            if (window.autoCombatMode === 'repeat' && window.currentFieldId && playerState.currentHp > 0 && playerState.fatigue >= 5) {
                const fieldData = FIELD_DB[window.currentFieldId];
                if (fieldData && fieldData.requireItem) {
                    const hasKey = playerState.inventory.some(i => i && i.name === fieldData.requireItem);
                    if (!hasKey) {
                        alert("열쇠가 부족하여 반복 자동 사냥을 종료합니다.");
                        window.isAutoCombatActive = false;
                        if (typeof renderFieldList === 'function') renderFieldList();
                        return;
                    }
                }
                
                setTimeout(() => {
                    if (typeof startCombat === 'function') startCombat(window.currentFieldId);
                }, 500);
            }
        }
    }, 1500);
}

function endCombatTurn() {
    if (playerState.currentHp > 0 && currentMonster && currentMonster.hp > 0) {
        if (window.isAutoCombatActive) {
            setTimeout(() => executePlayerAction(null), 800);
        } else {
            if (typeof setCombatButtonsState === 'function') setCombatButtonsState(false);
        }
    }
}

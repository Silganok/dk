/**
 * 경험치 및 레벨업 시스템
 */
function addExp(baseAmount, jobAmount = 0) {
    if (!playerState) return;
    
    // 치트(대량 경험치 획득) 방지 로직: 아이디가 'amirael'인 경우에만 5000 이상의 경험치 획득 허용
    if (baseAmount > 5000 || jobAmount > 5000) {
        const accountId = sessionStorage.getItem('lastAccount');
        if (accountId !== 'amirael') {
            console.error("비정상적인 경험치 획득이 감지되었습니다. 치트 사용 권한이 없습니다.");
            return;
        }
    }

    let baseLevelUp = false;
    let jobLevelUp = false;
    let maxLevel = 100;
    
    // Base EXP 처리
    if (playerState.level < maxLevel) {
        let newBaseExp = playerState.exp + baseAmount;
        let requiredBaseExp = EXP_DB.getRequiredExp(playerState.level);

        while (newBaseExp >= requiredBaseExp) {
            if (playerState.level >= maxLevel) {
                newBaseExp = requiredBaseExp;
                break;
            }
            newBaseExp -= requiredBaseExp;
            playerState.level += 1;
            baseLevelUp = true;
            requiredBaseExp = EXP_DB.getRequiredExp(playerState.level);
            
            const points = EXP_DB.getStatPointsOnLevelUp(playerState.level);
            playerState.statPoints = (playerState.statPoints || 0) + points;
        }
        playerState.exp = newBaseExp;
    } else {
        playerState.exp = EXP_DB.getRequiredExp(maxLevel);
    }

    // Job EXP 처리
    const jobData = JOB_DB[playerState.job];
    const maxJobLevel = jobData ? jobData.maxLevel : 10;
    
    if (playerState.jobLevel < maxJobLevel) {
        let newJobExp = (playerState.jobExp || 0) + jobAmount;
        let requiredJobExp = EXP_DB.getRequiredJobExp(playerState.jobLevel);

        while (newJobExp >= requiredJobExp) {
            if (playerState.jobLevel >= maxJobLevel) {
                newJobExp = requiredJobExp;
                break;
            }
            newJobExp -= requiredJobExp;
            playerState.jobLevel += 1;
            jobLevelUp = true;
            requiredJobExp = EXP_DB.getRequiredJobExp(playerState.jobLevel);
        }
        playerState.jobExp = newJobExp;
    } else {
        playerState.jobExp = EXP_DB.getRequiredJobExp(maxJobLevel);
    }

    if (baseLevelUp || jobLevelUp) {
        let msg = "";
        if (baseLevelUp) msg += `레벨업! 레벨 ${playerState.level}이 되었습니다.\n모든 기본 스탯이 상승하고 체력/마력이 회복되었습니다.\n`;
        if (jobLevelUp) msg += `직업 레벨업! [${playerState.job}] 직업 레벨 ${playerState.jobLevel}이 되었습니다.`;
        
        playerState.currentHp = playerState.maxHp;
        playerState.currentMp = playerState.maxMp;
        alert(msg);
        if (typeof renderPlayerStats === 'function') renderPlayerStats();
    }
}

let currentMonster = null;

function handleAutoPotion() {
    if (!playerState || playerState.currentHp <= 0 || !currentMonster || currentMonster.hp <= 0) return;
    
    const hpInput = document.getElementById('auto-potion-hp');
    const mpInput = document.getElementById('auto-potion-mp');
    const hpThreshold = hpInput ? parseInt(hpInput.value) / 100 : 0.3;
    const mpThreshold = mpInput ? parseInt(mpInput.value) / 100 : 0.2;
    
    // HP Check
    if (hpThreshold > 0 && playerState.currentHp <= playerState.maxHp * hpThreshold) {
        const hpPotIndex = playerState.inventory.findIndex(item => item && item.healHp);
        if (hpPotIndex !== -1) {
            const item = playerState.inventory[hpPotIndex];
            playerState.currentHp = Math.min(playerState.maxHp, playerState.currentHp + item.healHp);
            playerState.inventory.splice(hpPotIndex, 1);
            if (typeof addCombatLog === 'function') addCombatLog(`[자동 물약] ${item.name}을(를) 사용하여 체력을 회복했습니다!`, "#10b981");
            if (typeof updateCombatUI === 'function') updateCombatUI();
        }
    }
    
    // MP Check
    if (mpThreshold > 0 && playerState.currentMp <= playerState.maxMp * mpThreshold) {
        const mpPotIndex = playerState.inventory.findIndex(item => item && item.healMp);
        if (mpPotIndex !== -1) {
            const item = playerState.inventory[mpPotIndex];
            playerState.currentMp = Math.min(playerState.maxMp, playerState.currentMp + item.healMp);
            playerState.inventory.splice(mpPotIndex, 1);
            if (typeof addCombatLog === 'function') addCombatLog(`[자동 물약] ${item.name}을(를) 사용하여 마나를 회복했습니다!`, "#3b82f6");
            if (typeof updateCombatUI === 'function') updateCombatUI();
        }
    }
}

function calculateHit(attackerAcc, defenderEva) {
    const hitChance = Math.min(100, Math.max(5, 100 + (attackerAcc - defenderEva)));
    return (Math.random() * 100) < hitChance;
}

function calculateCrit(attackerLuk) {
    const critChance = 5 + (attackerLuk * 0.5);
    return (Math.random() * 100) < critChance;
}

function getElementMultiplier(attackElement, defendElement) {
    if (!attackElement || attackElement === "무" || !defendElement) return 1;
    const rules = {
        "수": { weak: "풍", strong: "화" },
        "화": { weak: "수", strong: "지" },
        "지": { weak: "화", strong: "풍" },
        "풍": { weak: "지", strong: "수" }
    };
    if (rules[attackElement] && rules[attackElement].strong === defendElement) return 1.5;
    if (rules[defendElement] && rules[defendElement].strong === attackElement) return 0.5;
    if (defendElement === "염" && attackElement !== "염") return 0.5;
    if (defendElement === "염" && attackElement === "염") return 1.5;
    return 1;
}

// 오토 스킬 판단 AI
function getAutoSkill() {
    if (!playerState.equippedSkills || playerState.equippedSkills.length === 0) return null;
    
    for (let eqSkillName of playerState.equippedSkills) {
        const skillData = typeof SKILL_DB !== 'undefined' ? SKILL_DB[eqSkillName] : null;
        if (!skillData) continue;
        
        // 쿨타임 체크
        if (window.skillCooldowns && window.skillCooldowns[eqSkillName] > 0) continue;
        
        // 마나 체크
        const level = playerState.skills[eqSkillName] || 1;
        const costMp = skillData.getCostMp ? skillData.getCostMp(level) : 0;
        if (playerState.currentMp < costMp) continue;
        
        // 버프 유지 AI: 이미 걸려있다면 패스
        if (skillData.getBuffDuration) {
            if (window.combatBuffs && window.combatBuffs.player && window.combatBuffs.player[eqSkillName] > 0) continue;
        }
        if (skillData.name === "프로보크" && window.combatBuffs && window.combatBuffs.monster && window.combatBuffs.monster["프로보크"] > 0) continue;
        if (skillData.name === "스톤 커스" && window.combatBuffs && window.combatBuffs.monster && window.combatBuffs.monster["스톤 커스"] > 0) continue;
        if (skillData.name === "프로스트 다이버" && window.combatBuffs && window.combatBuffs.monster && window.combatBuffs.monster["스턴"] > 0) continue;

        return skillData;
    }
    return null; 
}

function executePlayerAction() {
    if (!currentMonster || playerState.currentHp <= 0) return;
    if (typeof setCombatButtonsState === 'function') setCombatButtonsState(true);

    if (!window.combatTurnCount) {
        window.combatTurnCount = 0;
        window.skillCooldowns = {};
        window.combatBuffs = { player: {}, monster: {} };
    }
    window.combatTurnCount++;
    handleAutoPotion();
    
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

    const pSpeed = playerState.speed;
    const mSpeed = currentMonster.speed;
    
    // 더블 어택 횟수 계산
    const playerAttacks = ((Math.random() * 100) < Math.min(50, Math.max(0, (pSpeed - mSpeed) * 2))) ? 2 : 1;
    const monsterAttacks = ((Math.random() * 100) < Math.min(50, Math.max(0, (mSpeed - pSpeed) * 2))) ? 2 : 1;

    // 선공 주사위
    const pGoesFirst = (pSpeed + (Math.random() * pSpeed * 0.2)) >= (mSpeed + (Math.random() * mSpeed * 0.2));

    if (typeof addCombatLog === 'function') {
        const turnInitiativeName = pGoesFirst ? playerState.name : currentMonster.name;
        addCombatLog(`[턴 ${window.combatTurnCount}] 👑 ${turnInitiativeName}의 선공!`, "#e2e8f0");
    }

    if (pGoesFirst) {
        executeAttacks('player', playerAttacks, () => {
            if (currentMonster && currentMonster.hp > 0) {
                setTimeout(() => executeAttacks('monster', monsterAttacks, endCombatTurn), 800);
            } else endCombatTurn();
        });
    } else {
        executeAttacks('monster', monsterAttacks, () => {
            if (playerState.currentHp > 0) {
                setTimeout(() => executeAttacks('player', playerAttacks, endCombatTurn), 800);
            } else endCombatTurn();
        });
    }
}

function getPlayerDamageVarianceMultiplier() {
    let weapon = playerState.equipment ? playerState.equipment.weapon : null;
    let subType = weapon ? weapon.subType : null;
    let baseMin = 0.85, baseMax = 1.15;
    if (subType === "단검" || subType === "완드") { baseMin = 0.90; baseMax = 1.10; } 
    else if (subType === "양손검" || subType === "스태프") { baseMin = 0.75; baseMax = 1.25; } 
    else if (subType === "도끼" || subType === "장궁") { baseMin = 0.70; baseMax = 1.30; }
    
    let dex = playerState.calcStatBonus ? playerState.calcStatBonus('dex', 1) : playerState.baseStats.dex;
    dex = Math.min(100, Math.max(0, dex));
    let newMin = baseMin + (baseMax - baseMin) * (dex / 100);
    return newMin + Math.random() * (baseMax - newMin);
}

function executeAttacks(attacker, totalAttacks, callback) {
    if (!currentMonster || playerState.currentHp <= 0 || currentMonster.hp <= 0) {
        if (callback) callback(); return;
    }

    // 상태 이상 체크 (스턴/석화)
    if (attacker === 'player' && window.combatBuffs.player["스턴"] > 0) {
        if (typeof addCombatLog === 'function') addCombatLog("당신은 기절하여 행동할 수 없습니다!", "#94a3b8");
        if (callback) callback(); return;
    }
    if (attacker === 'monster' && (window.combatBuffs.monster["스턴"] > 0 || window.combatBuffs.monster["스톤 커스"] > 0)) {
        if (typeof addCombatLog === 'function') addCombatLog("몬스터가 행동 불능 상태입니다!", "#94a3b8");
        if (callback) callback(); return;
    }

    let currentAttack = 1;

    function nextAttack() {
        if (playerState.currentHp <= 0 || currentMonster.hp <= 0 || currentAttack > totalAttacks) {
            if (callback) callback(); return;
        }
        if (currentAttack === 2 && typeof addCombatLog === 'function') addCombatLog(`⚡ 압도적인 속도로 한 번 더 공격합니다!`, "#fcd34d");

        if (attacker === 'player') playerSingleAttack();
        else monsterSingleAttack();

        currentAttack++;
        if (playerState.currentHp > 0 && currentMonster.hp > 0 && currentAttack <= totalAttacks) {
            setTimeout(nextAttack, 800);
        } else {
            if (currentMonster.hp <= 0) setTimeout(handleMonsterDeath, 500);
            else if (playerState.currentHp <= 0) {
                if (typeof addCombatLog === 'function') addCombatLog("당신은 쓰러졌습니다... (체력 1로 마을 귀환)", "#ef4444");
                setTimeout(() => {
                    playerState.currentHp = 1;
                    if (typeof endCombat === 'function') { endCombat(); if (typeof switchTab === 'function') switchTab('town'); }
                }, 1500);
            }
            else callback();
        }
    }
    
    nextAttack();
}

function playerSingleAttack() {
    const skill = getAutoSkill();
    let skillData = null;
    let skillLevel = 1;

    if (skill) {
        skillData = skill;
        skillLevel = playerState.skills[skill.name] || 1;
        playerState.currentMp -= skillData.getCostMp ? skillData.getCostMp(skillLevel) : 0;
        if (skillData.cooldown) {
            window.skillCooldowns[skill.name] = skillData.cooldown;
        }
        if (typeof updateCombatUI === 'function') updateCombatUI();
    }

    let pAcc = playerState.accuracy;
    if (playerState.mealBuff && playerState.mealBuff.stat === 'acc_eva') pAcc += playerState.mealBuff.amount;
    if (window.combatBuffs.player["사이트"] > 0) pAcc = 9999;
    
    // 공격 명중 판정 (버프 스킬은 회피 판정 안 함)
    const isBuffSkill = skillData && skillData.getMultiplier && skillData.getMultiplier(skillLevel) === 0 && !skillData.getHitChance;
    if (!isBuffSkill && !calculateHit(pAcc, currentMonster.evasion)) {
        if (typeof addCombatLog === 'function') addCombatLog(skillData ? `${skillData.name} 스킬이 빗나갔습니다!` : "당신의 공격이 빗나갔습니다!", "#94a3b8");
        return;
    }

    if (isBuffSkill) {
        // 버프 스킬 처리
        if (skillData.name === "프로보크") {
            if (Math.random() * 100 < skillData.getHitChance(skillLevel)) {
                window.combatBuffs.monster["프로보크"] = 999; // 전투 내내
                if (typeof addCombatLog === 'function') addCombatLog(`프로보크 성공! 몬스터의 방어력이 무력화되고 공격력이 상승합니다.`, "#f59e0b");
            } else {
                if (typeof addCombatLog === 'function') addCombatLog(`프로보크에 실패했습니다.`, "#94a3b8");
            }
        } else if (skillData.getBuffDuration) {
            window.combatBuffs.player[skillData.name] = skillData.getBuffDuration(skillLevel);
            if (typeof addCombatLog === 'function') addCombatLog(`[${skillData.name}] 발동! 버프 효과가 적용됩니다.`, "#34d399");
        } else {
            if (typeof addCombatLog === 'function') addCombatLog(`[${skillData.name}] 발동!`, "#34d399");
        }
        return;
    }

    // 데미지 스킬/평타 처리
    let hitsCount = skillData && skillData.hits ? skillData.hits : 1;
    let hitDamages = [];
    let isCrit = false;
    let skillName = skillData ? skillData.name : "일반 공격";
    let attackElement = skillData && skillData.element ? skillData.element : (playerState.equipment.weapon && playerState.equipment.weapon.element ? playerState.equipment.weapon.element : "무");
    let defendElement = currentMonster.element || "무";
    let elementMult = getElementMultiplier(attackElement, defendElement);

    // 스킬별 치명타 보정 (화이어 볼 등)
    let pCritChance = playerState.critChance;
    if (skillData && skillData.getPassiveEffect) {
        const pEffect = skillData.getPassiveEffect(skillLevel);
        if (pEffect.critBonus) pCritChance += pEffect.critBonus;
    }

    // 몬스터 방어력 계산 (프로보크 시 0)
    let mDefense = window.combatBuffs.monster["프로보크"] > 0 ? 0 : currentMonster.defense;

    for (let i = 0; i < hitsCount; i++) {
        let rawDamage = (skillData && skillData.element && skillData.element !== "무") ? playerState.magicAttack : playerState.meleeAttack;
        if (playerState.mealBuff && playerState.mealBuff.stat === 'atk') rawDamage *= (1 + playerState.mealBuff.amount);
        
        // 궁수의 경우 원거리 타격 처리? (간단히 무기가 활이면 rangedAttack 사용)
        if (playerState.equipment.weapon && playerState.equipment.weapon.subType === "장궁" && (!skillData || skillData.element === "무")) {
            rawDamage = playerState.rangedAttack;
            if (playerState.mealBuff && playerState.mealBuff.stat === 'atk') rawDamage *= (1 + playerState.mealBuff.amount);
        }

        if (skillData && skillData.getMultiplier) {
            rawDamage *= skillData.getMultiplier(skillLevel);
        }
        
        rawDamage *= getPlayerDamageVarianceMultiplier();
        rawDamage *= elementMult;

        let critRoll = (Math.random() * 100) < pCritChance;
        if (critRoll) {
            isCrit = true;
            // 애로우 샤워 치명타 증폭
            if (skillData && skillData.name === "애로우 샤워") {
                rawDamage *= (playerState.critDamage / 100) * 1.5; 
            } else {
                rawDamage *= (playerState.critDamage / 100);
            }
        }

        let finalDmg = Math.max(1, Math.floor(rawDamage - mDefense));
        currentMonster.hp -= finalDmg;
        hitDamages.push(finalDmg);
    }

    if (typeof updateCombatUI === 'function') updateCombatUI();
    const dmgStr = hitDamages.join(', ');
    
    let effectStr = "";
    if (elementMult > 1) effectStr = " (효과가 굉장했다!)";
    else if (elementMult < 1) effectStr = " (효과가 별로인 듯 하다...)";

    if (typeof addCombatLog === 'function') addCombatLog(`${skillName}! ${dmgStr} 데미지!${effectStr}`, isCrit ? "crit-text" : "#60a5fa");

    // 타격 후 상태이상 부여 체크
    if (skillData && skillData.getHitChance) {
        if (Math.random() * 100 < skillData.getHitChance(skillLevel)) {
            if (skillData.name === "프로스트 다이버") {
                window.combatBuffs.monster["스턴"] = 1;
                if (typeof addCombatLog === 'function') addCombatLog(`적을 꽁꽁 얼렸습니다! (스턴)`, "#38bdf8");
            } else if (skillData.name === "스톤 커스") {
                window.combatBuffs.monster["스톤 커스"] = 1;
                if (typeof addCombatLog === 'function') addCombatLog(`적을 석화시켰습니다! (행동 불능)`, "#a8a29e");
            }
        }
    }
}

function monsterSingleAttack() {
    let pEvasion = playerState.evasion;
    if (playerState.mealBuff && playerState.mealBuff.stat === 'acc_eva') pEvasion += playerState.mealBuff.amount;
    if (window.combatBuffs.player["세이프티 월"] > 0) {
        const swLevel = playerState.skills["세이프티 월"] || 1;
        pEvasion += Math.min(90, 40 + (swLevel * 5)); 
    }
    
    if (!calculateHit(currentMonster.accuracy, pEvasion)) {
        if (typeof addCombatLog === 'function') addCombatLog("몬스터의 공격을 회피했습니다!", "#10b981");
        return;
    }

    let mAttack = currentMonster.attack;
    if (window.combatBuffs.monster["프로보크"] > 0) mAttack *= 1.5;

    let rawDamage = mAttack * (0.85 + Math.random() * 0.30);
    let isCrit = calculateCrit(currentMonster.luk);
    if (isCrit) rawDamage *= 1.5;
    
    let pDef = playerState.defense;
    if (window.combatBuffs.player["인듀어"] > 0) {
        const endureLevel = playerState.skills["인듀어"] || 1;
        pDef += endureLevel * 3;
    }

    let finalDamage = Math.max(1, Math.floor(rawDamage - pDef));
    playerState.currentHp = Math.max(0, playerState.currentHp - finalDamage);

    if (typeof updateCombatUI === 'function') updateCombatUI();
    if (typeof addCombatLog === 'function') addCombatLog(`몬스터의 공격! 당신은 ${finalDamage}의 피해를 입었습니다.`, isCrit ? "crit-text" : "#ef4444");

    // 화이어 월 반사 데미지 체크
    if (window.combatBuffs.player["화이어 월"] > 0 && currentMonster.hp > 0) {
        let reflectDmg = Math.max(1, Math.floor(playerState.magicAttack * 0.5));
        
        let mElem = currentMonster.element || "무";
        let eleMult = getElementMultiplier("화", mElem);
        reflectDmg = Math.floor(reflectDmg * eleMult);
        
        currentMonster.hp -= reflectDmg;
        if (typeof updateCombatUI === 'function') updateCombatUI();
        
        let effectStr = eleMult > 1 ? " (효과 굉!)" : (eleMult < 1 ? " (효과 미미)" : "");
        if (typeof addCombatLog === 'function') addCombatLog(`화이어 월 반사! 몬스터에게 ${reflectDmg} 화속성 피해!${effectStr}`, "#f97316");
    }
}

function handleMonsterDeath() {
    let dropMsg = "";
    if (currentMonster.dropTable && typeof DROP_DB !== 'undefined' && DROP_DB[currentMonster.dropTable]) {
        const drops = DROP_DB[currentMonster.dropTable];
        drops.forEach(drop => {
            if ((Math.random() * 100) < drop.chance) {
                const item = typeof ITEM_DB !== 'undefined' ? ITEM_DB[drop.itemId] : null;
                if (item) {
                    playerState.inventory.push(JSON.parse(JSON.stringify(item)));
                    dropMsg += `\n[${item.name}]을(를) 획득했습니다!`;
                }
            }
        });
    }

    if (typeof addCombatLog === 'function') {
        addCombatLog(`몬스터 처치! Base EXP ${currentMonster.exp}, Job EXP ${currentMonster.jobExp || 0}, 골드 ${currentMonster.gold}G 획득${dropMsg}`, "#34d399");
    }
    
    // 식사 버프 차감
    if (playerState.mealBuff && playerState.mealBuff.count > 0) {
        playerState.mealBuff.count--;
        if (playerState.mealBuff.count <= 0) {
            playerState.mealBuff = null;
            if (typeof addCombatLog === 'function') addCombatLog("식사 버프의 효과가 모두 소모되었습니다.", "#94a3b8");
        }
    }
    
    updatePlayerState({ gold: playerState.gold + currentMonster.gold });
    
    let expBonus = 1;
    if (playerState.mealBuff && playerState.mealBuff.stat === 'exp') expBonus += playerState.mealBuff.amount;
    addExp(Math.floor(currentMonster.exp * expBonus), Math.floor((currentMonster.jobExp || 0) * expBonus));
    
    // 전투 종료 시 초기화
    window.combatTurnCount = 0;
    
    setTimeout(() => {
        if (typeof endCombat === 'function') {
            endCombat();
            if (window.autoCombatMode === 'repeat' && window.currentFieldId && playerState.currentHp > 0 && playerState.fatigue >= 5) {
                const fieldData = typeof FIELD_DB !== 'undefined' ? FIELD_DB[window.currentFieldId] : null;
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
    // 쿨타임 감소
    if (window.skillCooldowns) {
        for(let skill in window.skillCooldowns) {
            window.skillCooldowns[skill]--;
            if(window.skillCooldowns[skill] <= 0) delete window.skillCooldowns[skill];
        }
    }
    // 버프 감소
    if (window.combatBuffs) {
        for(let t in window.combatBuffs) {
            for(let b in window.combatBuffs[t]) {
                if (b === "프로보크" && t === "monster") continue; // 영구지속
                window.combatBuffs[t][b]--;
                if(window.combatBuffs[t][b] <= 0) delete window.combatBuffs[t][b];
            }
        }
    }

    // SP 회복 (패시브)
    const spRegenLevel = playerState.skills && playerState.skills["SP회복력 향상"];
    if (spRegenLevel && typeof SKILL_DB !== 'undefined' && SKILL_DB["SP회복력 향상"]) {
        const heal = SKILL_DB["SP회복력 향상"].getPassiveEffect(spRegenLevel).mpRegen;
        const oldMp = playerState.currentMp;
        playerState.currentMp = Math.min(playerState.maxMp, playerState.currentMp + heal);
        const actualHeal = playerState.currentMp - oldMp;
        if (actualHeal > 0 && typeof addCombatLog === 'function') {
            addCombatLog(`[SP회복력 향상] MP가 ${actualHeal} 회복되었습니다.`, "#60a5fa");
        }
    }
    const hpRegenLevel = playerState.skills && playerState.skills["HP회복력 향상"];
    if (hpRegenLevel && typeof SKILL_DB !== 'undefined' && SKILL_DB["HP회복력 향상"]) {
        const heal = SKILL_DB["HP회복력 향상"].getPassiveEffect(hpRegenLevel).hpRegen;
        const oldHp = playerState.currentHp;
        playerState.currentHp = Math.min(playerState.maxHp, playerState.currentHp + heal);
        const actualHeal = playerState.currentHp - oldHp;
        if (actualHeal > 0 && typeof addCombatLog === 'function') {
            addCombatLog(`[HP회복력 향상] HP가 ${actualHeal} 회복되었습니다.`, "#34d399");
        }
    }
    if (typeof updateCombatUI === 'function') updateCombatUI();

    handleAutoPotion();
    if (playerState.currentHp > 0 && currentMonster && currentMonster.hp > 0) {
        if (window.isAutoCombatActive) {
            setTimeout(() => executePlayerAction(), 800);
        } else {
            if (typeof setCombatButtonsState === 'function') setCombatButtonsState(false);
        }
    }
}
